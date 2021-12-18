export interface IArtist{
  id: string;
  uri: string;
  name: string;
}

export interface ISong{
  name: string;
  href: string;
  uri: string;
  popularity: number;
  duration: number;
  artists: Array<IArtist>;
}
