import { AudioFeatures, Song, User } from '..';
import { kLargest } from '../../utils';
import { Lobby } from '../lobby';
import { addSongs } from '../spotify/add-songs';
import { THEME, theme2Conditions } from './themes';

/**
 *
 * @param lobbyId the lobby to analyze
 */
export async function synthesizePlaylist(lobbyId: string, theme: THEME): Promise<boolean> {
  const lobby = await Lobby.fromId(lobbyId);
  if (!lobby) return false;

  const songsMap = await lobby.participants.reduce(async (accP: Promise<Record<string, number>>, userId) => {
    const acc = await accP;

    const user = await User.fromId(userId);
    if (!user) return acc;

    user.topSongs.forEach((songId) => {
      if (!acc[songId]) acc[songId] = 0;
      acc[songId]++;
    });

    return acc;
  }, Promise.resolve({}));

  const songScores: Song2Score[] = [];

  Object.entries(songsMap).forEach(async ([id, overlapScore]) => {
    const song = await Song.fromId(id);
    if (!song || !song.audioFeatures) return;
    const score = computeScore(song.audioFeatures, theme) * (1 + overlapScore * .1);
    if (score === 0) return;
    songScores.push({id, score});
  });

  const topSongs = kLargest<Song2Score>(songScores, compareSongScores, 50);

  return addSongs(lobbyId, ...topSongs.map(s => s.id));
}

type Song2Score = {id: string, score: number};

const compareSongScores = (a: Song2Score, b: Song2Score) => a.score < b.score ? -1 : 1;

type AudioFeatureEntry = [feature: keyof AudioFeatures, score: number];

function computeScore(af: AudioFeatures, theme: THEME): number {
  const conditions = theme2Conditions[theme];
  const isQualifying = !Object.entries(af).find(([feature, score]: AudioFeatureEntry) => {
    return score < conditions[feature].min || conditions[feature].max < score;
  });
  if (!isQualifying) return 0;

  const rawScore = Object.entries(af).reduce((acc, [feature, score]: AudioFeatureEntry) => {
    const {target, weight} = conditions[feature];
    return acc + (1 - Math.abs(target - score)) * weight;
  }, 0);

  const numWeighted = Object.values(conditions).reduce((acc, {weight}) => acc + +(!!weight), 0);

  return rawScore / numWeighted;
}
