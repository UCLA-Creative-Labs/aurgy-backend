import fetch from 'node-fetch';
import { User } from '..';

/**
 * Spotify Add Items to Playlist
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/add-tracks-to-playlist
 *
 * Adds items to a playlist
 */
export async function addSongs(playlistId: string, ...uris: string[]): Promise<boolean> {
  const root = await User.fromId('0');
  if (!root) return false;

  const accessToken = await root.getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris }),
  });

  return res.ok;
}
