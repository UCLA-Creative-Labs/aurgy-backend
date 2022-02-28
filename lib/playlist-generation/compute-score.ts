import { Song } from '../song';
import { AudioFeatures } from '../spotify';
import { THEME, theme2Conditions } from './themes';

export type Song2Score = {song: Song, score: number};

export const compareSongScores = (a: Song2Score, b: Song2Score) => a.score < b.score ? -1 : 1;

type AudioFeatureEntry = [feature: keyof AudioFeatures, score: number];

export function computeScore(af: AudioFeatures, theme: THEME): number {
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
