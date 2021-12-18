import { IArtist } from './song';

export type TokenResponse = {
  'access_token': string,
};

export type SpotifySubscriptionType = 'premium' | 'free';

export function isTokenResponse(res: any): res is TokenResponse {
  return 'access_token' in res;
}

export type UserInfoResponse = {
  'display_name': string,
  'email': string,
  'id': string,
  'product': SpotifySubscriptionType,
  'uri': string,
};

export function isUserInfoResponse(res: any): res is UserInfoResponse {
  return (
    'display_name' in res &&
    'email' in res &&
    'id' in res &&
    'product' in res &&
    'uri' in res
  );
}

export interface SongResponse{
  id:string;
  name: string;
  href: string;
  uri: string;
  popularity: number;
  duration_ms: number;
  artists: Array<IArtist>;
}

export interface TopSongResponse{
  items: SongResponse[];
}
