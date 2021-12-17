import fetch from 'node-fetch';
import { isTopSongsResponse, TopSongsResponse } from './types';

export async function getTopSongs(accessToken: string): Promise<TopSongsResponse>{
  function getSongs(offset: number){
    return fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term&offset=${offset}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    });
  }

  const responses = await Promise.all([getSongs(0), getSongs(49)])
  const data = await Promise.all(responses.map(res => res.json()));
  const extractedItems = data.reduce((all: any[], d) => {
    all.push(...d.items);
    return all;
  }, []);

  const songMap = extractedItems.reduce((acc: any, item: any) => {
    if (item.id in acc) return acc;
    const artistNames = item.artists.reduce((arr: any, art: any) => {
        arr.push(art.name)
        return arr;
    }, []);

    acc[item.id] = {'name': item.name,'href': item.href, 'uri': item.uri, 
                    'popularity': item.popularity, 'artists': artistNames};
    if (!isTopSongsResponse(acc[item.id])) {
        throw new Error('Error: Response from spotify is not in top songs response form.');
    }

    return acc;
  }, {});

  return songMap;
}