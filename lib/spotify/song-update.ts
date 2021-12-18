import fetch, {Response} from 'node-fetch';
import { HTTPResponseError } from '../../utils/errors';
import { IArtist, ISong } from './song';
import { SongResponse, TopSongResponse } from './types';

export async function getTopSongs(accessToken: string){
  function getSongs(offset: number){
    return fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term&offset=${offset}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  const responses = await Promise.all([getSongs(0), getSongs(49)]);
  responses.forEach((res: Response) => {
    if (!res.ok) throw new HTTPResponseError(res);
  });

  const data = await Promise.all(responses.map(res => res.json()));

  const songMap = data.reduce((acc: Record<string, ISong>, topSongInfo: TopSongResponse) => {
    topSongInfo.items.forEach((song: SongResponse) => {
      if (song.id in acc) return;
      const artistNames = song.artists.reduce((arr: IArtist[], artist: IArtist) => {
        arr.push({name: artist.name, id: artist.id, uri: artist.uri});
        return arr;
      }, []);

      acc[song.id] = {name: song.name, href: song.href, uri: song.uri, popularity: song.popularity,
        duration: song.duration_ms, artists: artistNames};
    });
    return acc;
  }, {});

  return songMap;
}
