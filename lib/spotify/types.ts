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

type TopSongs = {
  'name': string,
  'href': string, 
  'uri': string, 
  'popularity': number, 
  'artists': Array<string>,
};

export type TopSongsResponse = {
  [key: string]: TopSongs,
};

export function isTopSongsResponse(res: any): res is TopSongsResponse {
  return (
    'name' in res &&
    'href' in res &&
    'uri' in res &&
    'popularity' in res &&
    'artists' in res
  );
}
