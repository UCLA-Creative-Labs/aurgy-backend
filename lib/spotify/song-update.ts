import fetch, {Response} from 'node-fetch';
import { HTTPResponseError } from '../../utils/errors';
import { IArtist, ISong, SongResponse, TopSongResponse } from './song';

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
  })

  const data = await Promise.all(responses.map(res => res.json()));

  const songMap = data.reduce((acc: Record<string, ISong>, d: TopSongResponse) => {
    d.items.forEach((s: SongResponse) => {
      if (s.id in acc) return;
      const artistNames = s.artists.reduce((arr: IArtist[], art: IArtist) => {
        arr.push({name: art.name, id: art.id, uri: art.uri});
        return arr;
      }, []);

      acc[s.id] = {name: s.name, href: s.href, uri: s.uri, popularity: s.popularity, duration: s.duration_ms, artists: artistNames};
    });
    return acc;
  }, {});

  return songMap;
}
