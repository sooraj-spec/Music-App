//! Native audio engine.
//!
//! One dedicated thread owns the audio device and the current `Player`.
//! Tauri commands send it messages over a channel and wait for a reply.
//! The thread blocks while idle and only wakes every POLL_INTERVAL while playing.

use std::fs::File;
use std::path::Path;
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::thread;
use std::time::{Duration, Instant};

use rodio::{Decoder, DeviceSinkBuilder, MixerDeviceSink, Player, Source};
use serde::Serialize;
use tauri::{AppHandle, Emitter, State};

const POLL_INTERVAL: Duration = Duration::from_millis(250);
const SUPPORTED: [&str; 4] = ["mp3", "flac", "ogg", "wav"];
/// Upper bound for seek requests (one week), so `Duration::from_secs_f64` can never panic.
const MAX_SEEK_SECS: f64 = 604_800.0;

type Reply<T> = Sender<Result<T, String>>;

enum Cmd {
    /// Replies with the generation number of this load.
    Load { path: String, track_id: String, reply: Reply<u64> },
    Play { reply: Reply<()> },
    Pause { reply: Reply<()> },
    Seek { seconds: f64, reply: Reply<()> },
    SetVolume { volume: f32, reply: Reply<()> },
    Stop { reply: Reply<()> },
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct PositionEvent {
    track_id: String,
    generation: u64,
    seconds: f64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct EndedEvent {
    track_id: String,
    generation: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbeResult {
    duration_sec: f64,
}

// ---------------------------------------------------------------------------
// File helpers (no audio device needed)
// ---------------------------------------------------------------------------

fn validate(path: &str) -> Result<(), String> {
    let p = Path::new(path);
    let ext = p
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase());
    match ext {
        Some(e) if SUPPORTED.contains(&e.as_str()) => {}
        _ => {
            return Err(format!(
                "Unsupported file type. Supported types: {}.",
                SUPPORTED.join(", ")
            ))
        }
    }
    let meta = std::fs::metadata(p).map_err(|e| format!("Can't access this file: {e}"))?;
    if !meta.is_file() {
        return Err("That path is not a file.".to_string());
    }
    Ok(())
}

fn open_source(path: &str) -> Result<impl Source + Send + 'static, String> {
    validate(path)?;
    let file = File::open(path).map_err(|e| format!("Can't open this file: {e}"))?;
    let decoder =
        Decoder::try_from(file).map_err(|e| format!("Can't decode this audio file: {e}"))?;
    Ok(decoder)
}

/// Duration by decoding the whole file. Slow, so only used when the header has no duration.
fn counted_duration(path: &str) -> Result<Duration, String> {
    let source = open_source(path)?;
    let channels = u64::from(u16::from(source.channels()));
    let rate = u64::from(u32::from(source.sample_rate()));
    if channels == 0 || rate == 0 {
        return Err("Couldn't determine this file's duration.".to_string());
    }
    let samples = source.count() as f64;
    Ok(Duration::from_secs_f64(samples / (channels * rate) as f64))
}

fn probe(path: &str) -> Result<ProbeResult, String> {
    let source = open_source(path)?;
    let duration = match source.total_duration() {
        Some(d) if d > Duration::ZERO => d,
        _ => counted_duration(path)?,
    };
    Ok(ProbeResult { duration_sec: duration.as_secs_f64() })
}

// ---------------------------------------------------------------------------
// Engine (lives on the audio thread)
// ---------------------------------------------------------------------------

struct Engine {
    app: AppHandle,
    device: Option<MixerDeviceSink>,
    player: Option<Player>,
    path: Option<String>,
    track_id: Option<String>,
    /// Bumped on every load/stop so the frontend can ignore events from older loads.
    generation: u64,
    /// Slider value, 0 to 1.
    volume: f32,
    playing: bool,
}

impl Engine {
    fn new(app: AppHandle) -> Self {
        Self {
            app,
            device: None,
            player: None,
            path: None,
            track_id: None,
            generation: 0,
            volume: 0.7,
            playing: false,
        }
    }

    fn apply_volume(&self) {
        if let Some(player) = &self.player {
            // Squared for a more natural loudness curve than a linear slider.
            player.set_volume(self.volume * self.volume);
        }
    }

    fn drop_player(&mut self) {
        if let Some(player) = self.player.take() {
            player.stop();
        }
        self.playing = false;
    }

    /// Builds a fresh paused player for `self.path`, optionally starting at `start`.
    fn attach(&mut self, start: Duration) -> Result<(), String> {
        let path = self
            .path
            .clone()
            .ok_or_else(|| "No track is loaded.".to_string())?;
        let source = open_source(&path)?;
        self.drop_player();

        if self.device.is_none() {
            let device = DeviceSinkBuilder::open_default_sink()
                .map_err(|e| format!("Couldn't open the audio output device: {e}"))?;
            self.device = Some(device);
        }
        let Some(device) = self.device.as_ref() else {
            return Err("The audio output device is unavailable.".to_string());
        };

        let player = Player::connect_new(device.mixer());
        player.pause();
        player.set_volume(self.volume * self.volume);
        player.append(source);
        if !start.is_zero() {
            player
                .try_seek(start)
                .map_err(|e| format!("Couldn't seek in this file: {e}"))?;
        }
        self.player = Some(player);
        Ok(())
    }

    fn load(&mut self, path: String, track_id: String) -> Result<u64, String> {
        self.drop_player();
        self.path = None;
        self.track_id = None;
        self.generation += 1;

        self.path = Some(path);
        match self.attach(Duration::ZERO) {
            Ok(()) => {
                self.track_id = Some(track_id);
                Ok(self.generation)
            }
            Err(e) => {
                self.path = None;
                Err(e)
            }
        }
    }

    fn play(&mut self) -> Result<(), String> {
        if self.path.is_none() {
            return Err("No track is loaded.".to_string());
        }
        // The track finished earlier: start it again from the beginning.
        if self.player.as_ref().is_none_or(|p| p.empty()) {
            self.attach(Duration::ZERO)?;
        }
        if let Some(player) = &self.player {
            player.play();
        }
        self.playing = true;
        Ok(())
    }

    fn pause(&mut self) {
        if let Some(player) = &self.player {
            player.pause();
        }
        self.playing = false;
    }

    fn seek(&mut self, seconds: f64) -> Result<(), String> {
        if self.path.is_none() {
            return Ok(());
        }
        let secs = if seconds.is_finite() { seconds.max(0.0) } else { 0.0 };
        let target = Duration::from_secs_f64(secs.min(MAX_SEEK_SECS));

        let live = self.player.as_ref().filter(|p| !p.empty());
        if let Some(player) = live {
            return player
                .try_seek(target)
                .map_err(|e| format!("Couldn't seek in this file: {e}"));
        }
        // Finished or unloaded: reload paused at the target position.
        self.attach(target)?;
        self.playing = false;
        Ok(())
    }

    fn set_volume(&mut self, volume: f32) {
        self.volume = if volume.is_finite() { volume.clamp(0.0, 1.0) } else { 0.0 };
        self.apply_volume();
    }

    fn stop(&mut self) {
        self.drop_player();
        self.path = None;
        self.track_id = None;
        self.generation += 1;
    }

    fn poll(&mut self) {
        if !self.playing {
            return;
        }
        let Some(player) = &self.player else {
            self.playing = false;
            return;
        };
        let Some(track_id) = self.track_id.clone() else {
            return;
        };
        if player.empty() {
            self.playing = false;
            self.emit(
                "audio:ended",
                EndedEvent { track_id, generation: self.generation },
            );
            return;
        }
        let seconds = player.get_pos().as_secs_f64();
        self.emit(
            "audio:position",
            PositionEvent { track_id, generation: self.generation, seconds },
        );
    }

    fn emit<S: Serialize + Clone>(&self, event: &str, payload: S) {
        if let Err(e) = self.app.emit(event, payload) {
            eprintln!("[audio] failed to emit {event}: {e}");
        }
    }

    fn handle(&mut self, cmd: Cmd) {
        // A send only fails if the caller stopped waiting, which is safe to ignore.
        match cmd {
            Cmd::Load { path, track_id, reply } => {
                let _ = reply.send(self.load(path, track_id));
            }
            Cmd::Play { reply } => {
                let _ = reply.send(self.play());
            }
            Cmd::Pause { reply } => {
                self.pause();
                let _ = reply.send(Ok(()));
            }
            Cmd::Seek { seconds, reply } => {
                let _ = reply.send(self.seek(seconds));
            }
            Cmd::SetVolume { volume, reply } => {
                self.set_volume(volume);
                let _ = reply.send(Ok(()));
            }
            Cmd::Stop { reply } => {
                self.stop();
                let _ = reply.send(Ok(()));
            }
        }
    }
}

fn run(app: AppHandle, rx: Receiver<Cmd>) {
    let mut engine = Engine::new(app);
    let mut last_poll = Instant::now();

    loop {
        let next = if engine.playing {
            match rx.recv_timeout(POLL_INTERVAL) {
                Ok(cmd) => Some(cmd),
                Err(RecvTimeoutError::Timeout) => None,
                Err(RecvTimeoutError::Disconnected) => break,
            }
        } else {
            // Idle: block until a command arrives, no polling.
            match rx.recv() {
                Ok(cmd) => Some(cmd),
                Err(_) => break,
            }
        };

        if let Some(cmd) = next {
            engine.handle(cmd);
        }
        if engine.playing && last_poll.elapsed() >= POLL_INTERVAL {
            engine.poll();
            last_poll = Instant::now();
        }
    }
}

// ---------------------------------------------------------------------------
// Tauri state and commands
// ---------------------------------------------------------------------------

pub struct AudioEngine {
    tx: Sender<Cmd>,
}

impl AudioEngine {
    pub fn start(app: AppHandle) -> std::io::Result<Self> {
        let (tx, rx) = mpsc::channel();
        thread::Builder::new()
            .name("sonic-audio".into())
            .spawn(move || run(app, rx))?;
        Ok(Self { tx })
    }

    /// Sends a command to the audio thread and waits for its reply without blocking the async runtime.
    async fn call<T: Send + 'static>(
        &self,
        build: impl FnOnce(Reply<T>) -> Cmd,
    ) -> Result<T, String> {
        let (reply, rx) = mpsc::channel();
        self.tx
            .send(build(reply))
            .map_err(|_| "The audio engine is not running.".to_string())?;
        tauri::async_runtime::spawn_blocking(move || match rx.recv() {
            Ok(result) => result,
            Err(_) => Err("The audio engine stopped unexpectedly.".to_string()),
        })
        .await
        .map_err(|e| e.to_string())?
    }
}

#[tauri::command]
pub async fn audio_probe(path: String) -> Result<ProbeResult, String> {
    tauri::async_runtime::spawn_blocking(move || probe(&path))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn audio_load(
    engine: State<'_, AudioEngine>,
    path: String,
    track_id: String,
) -> Result<u64, String> {
    engine.call(|reply| Cmd::Load { path, track_id, reply }).await
}

#[tauri::command]
pub async fn audio_play(engine: State<'_, AudioEngine>) -> Result<(), String> {
    engine.call(|reply| Cmd::Play { reply }).await
}

#[tauri::command]
pub async fn audio_pause(engine: State<'_, AudioEngine>) -> Result<(), String> {
    engine.call(|reply| Cmd::Pause { reply }).await
}

#[tauri::command]
pub async fn audio_seek(engine: State<'_, AudioEngine>, seconds: f64) -> Result<(), String> {
    engine.call(|reply| Cmd::Seek { seconds, reply }).await
}

#[tauri::command]
pub async fn audio_set_volume(engine: State<'_, AudioEngine>, volume: f32) -> Result<(), String> {
    engine.call(|reply| Cmd::SetVolume { volume, reply }).await
}

#[tauri::command]
pub async fn audio_stop(engine: State<'_, AudioEngine>) -> Result<(), String> {
    engine.call(|reply| Cmd::Stop { reply }).await
}