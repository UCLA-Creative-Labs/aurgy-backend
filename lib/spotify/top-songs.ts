import fetch, {Response} from 'node-fetch';
import { objectToForm } from '../../utils';
import { HTTPResponseError } from '../../utils/errors';
import { TOP_TRACKS } from '../private/SPOTIFY_ENDPOINTS';
import { IArtist, ISong } from '../song';
import { SongResponse, TopSongResponse } from './types';

function fetchTopSongs(accessToken: string, offset: number): Promise<Response> {
  const query: Record<string, any> = {
    limit: 50,
    time_range: 'medium_term',
    offset,
  };

  return fetch(TOP_TRACKS + objectToForm(query), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getTopSongs(accessToken: string): Promise<Record<string, ISong>>{
  const responses = await Promise.all([fetchTopSongs(accessToken, 0), fetchTopSongs(accessToken, 49)]);
  
  responses.forEach((res: Response) => {
    if (!res.ok) throw new HTTPResponseError(res);
  });

  const data = await Promise.all(responses.map(res => res.json()));

  const songMap = data.reduce((acc: Record<string, ISong>, {items}: TopSongResponse) => {
    items.forEach((song: SongResponse) => {
      if (song.id in acc) return;

      const artistInfo = song.artists.reduce((arr: IArtist[], {name, id, uri}: IArtist) => {
        arr.push({name, id, uri});
        return arr;
      }, []);

      acc[song.id] = {
        ...song,
        duration: song.duration_ms,
        artists: artistInfo
      };
    });

    return acc;
  }, {});

  return songMap;
}