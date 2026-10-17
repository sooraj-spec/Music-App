import { TRACKS, findTrack } from "../data/mock";
import type { Track } from "../types";

/**
 * Where tracks come from. The player only knows this interface.
 * Today it is mock data. Later a local-library or provider implementation
 * replaces it (which will likely make it asynchronous).
 */
export interface TrackCatalog {
  listTracks(): readonly Track[];
  getTrack(id: string): Track | undefined;
}

export const mockCatalog: TrackCatalog = {
  listTracks: () => TRACKS,
  getTrack: findTrack,
};