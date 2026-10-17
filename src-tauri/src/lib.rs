mod audio;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let engine = audio::AudioEngine::start(app.handle().clone())?;
            app.manage(engine);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            audio::audio_probe,
            audio::audio_load,
            audio::audio_play,
            audio::audio_pause,
            audio::audio_seek,
            audio::audio_set_volume,
            audio::audio_stop,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Sonic");
}