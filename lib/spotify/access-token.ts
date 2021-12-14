import fetch from 'node-fetch';
import { objectToForm } from '../../utils';
import { HTTPResponseError } from '../../utils/errors';
import {CLIENT_ID} from '../private/CONSTANTS';
import {TOKEN} from '../private/SPOTIFY_ENDPOINTS';
import { isTokenResponse } from './types';

export async function getAccessToken(refreshToken: string): Promise<string> {
  const body = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  };

  const res = await fetch(TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: objectToForm(body),
  });

  if (!res.ok) {
    throw new HTTPResponseError(res);
  }

  const data = await res.json();

  if (isTokenResponse(data)) {
    return data.access_token;
  }

  throw new Error('Error: Response from Spotify not in token response form');
}
