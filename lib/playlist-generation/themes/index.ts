import { AudioFeatures } from '../..';
import { dissociating } from './dissociating';

export type ThemeConditions = {
  min: number,
  max: number,
  target: number,
  weight: number,
}

export const NO_WEIGHT: ThemeConditions = { min: 0, max: 0, target: 0, weight: 0 };

export type Theme = {
  [Property in keyof AudioFeatures]: ThemeConditions;
};

export enum THEME {
  DISSOCIATING_ON_THE_HIGHWAY = 'dissociating on the highway',
}

export const theme2Conditions: Record<THEME, Theme> = Object.freeze({
  [THEME.DISSOCIATING_ON_THE_HIGHWAY]: dissociating,
});
