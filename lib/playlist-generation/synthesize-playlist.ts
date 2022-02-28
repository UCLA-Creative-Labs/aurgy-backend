import { Song, User } from '..';
import { kLargest } from '../../utils';
import { Lobby } from '../lobby';
import { addSongs } from '../spotify/add-songs';
import { compareSongScores, computeScore, Song2Score } from './compute-score';
import { THEME } from './themes';

/**
 *
 * @param lobbyId the lobby to analyze
 */
export async function synthesizePlaylist(lobbyId: string, theme: THEME): Promise<SynthesizePlaylist> {
  const lobby = await Lobby.fromId(lobbyId);
  if (!lobby) return { isPlaylistUpdated: false, songs: [] };

  const songsMap = await lobby.participants.reduce(async (accP: Promise<Record<string, string[]>>, userId) => {
    const acc = await accP;

    const user = await User.fromId(userId);
    if (!user) return acc;

    user.topSongs.forEach((songId) => {
      if (!acc[songId]) acc[songId] = [];
      acc[songId].push(user.name);
    });

    return acc;
  }, Promise.resolve({}));

  const songScores: Song2Score[] = [];

  Object.entries(songsMap).forEach(async ([id, contributors]) => {
    const song = await Song.fromId(id);
    if (!song || !song.audioFeatures) return;
    const score = computeScore(song.audioFeatures, theme) * (1 + contributors.length * .1);
    if (score === 0) return;
    songScores.push({song, score});
  });

  const topSongs = kLargest<Song2Score>(songScores, compareSongScores, 50);

  const isPlaylistUpdated = await addSongs(lobbyId, ...topSongs.map(s => s.song.uri));

  return {
    isPlaylistUpdated,
    songs: topSongs.map(({song}) => ({
      id: song.id,
      name: song.name,
      artists: song.artists.map(a => a.name),
      contributors: songsMap[song.id],
    })),
  };
}

export interface SynthesizePlaylist {
  readonly isPlaylistUpdated: boolean;
  readonly songs: SongMetadata[];
}

export interface SongMetadata {
  readonly id: string;
  readonly name: string;
  readonly artists: string[];
  readonly contributors: string[];
}
