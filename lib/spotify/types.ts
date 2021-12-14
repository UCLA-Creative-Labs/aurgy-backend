export type TokenResponse = {
  'access_token': string,
};

export function isTokenResponse(res: any): res is TokenResponse {
  return 'access_token' in res;
}
