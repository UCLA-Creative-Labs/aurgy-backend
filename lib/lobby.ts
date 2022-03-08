import { getClient, Song, SongMetadata, updateSongs, User } from '.';
import { kLargest } from '../utils';
import { DbItem, IDbItem } from './db-item';
import { compareSongScores, computeScore, Song2Score } from './playlist-generation/compute-score';
import { THEME } from './playlist-generation/themes';
import { COLLECTION } from './private/enums';
import { createSpotifyPlaylist } from './spotify/create-playlist';
// import { followPlaylist } from './spotify/follow-playlist';
// import { unfollowPlaylist } from './spotify/unfollow-playlist';

type DatabaseEntry = Omit<ILobby, 'collectionName'>;
type ClientResponse = {
  theme: THEME;
  name: string;
  participants: string[];
  songs: SongMetadata[];
}

export interface LobbyCreateProps {
  /**
    * The manager of a lobby
    */
  readonly manager: User;

  /**
   * The theme of a lobby
   */
  readonly theme: THEME;

  /**
    * The playlist name
    */
  readonly name: string;
}

export interface LobbyProps extends Omit<LobbyCreateProps, 'manager'> {
  /**
   * The participants in a lobby
   */
  readonly participants?: string[];

  /**
   * The list of song ids in the playlist
   */
  readonly songIds?: string[];

  /**
   * The manager of a lobby
   */
  readonly managerId: string;

  /**
   * Metadata regarding the songs in the playlist
   */
  readonly songMetadata?: SongMetadata[];
}

export interface ILobby extends Omit<LobbyProps, 'particapnts' | 'songIds' | 'songMetadata'>, IDbItem {
  /**
   * The participants in a lobby
   */
  readonly participants: string[];

  /**
   * The list of song ids in the playlist
   */
  readonly songIds: string[];
}

/**
 * The class containing a user and their data
 */
export class Lobby extends DbItem implements ILobby {
  /**
   * A static function to query for a Lobby from its id
   *
   * @returns a Lobby object if the id exists in the database
   */
  public static async fromId(id: string): Promise<Lobby | null> {
    const client = await getClient();
    const document = await client.findDbItem(COLLECTION.LOBBIES, id);
    if (!document) return null;
    const content: DatabaseEntry = document.getContent() as DatabaseEntry;
    return new Lobby(id, content, document.key ?? null);
  }

  /**
   * A static function to create a new Lobby and corresponding Spotify playlist
   *
   * @returns a newly created Lobby object
   */
  public static async create(props: LobbyCreateProps, key : string | null = null) : Promise<Lobby | null> {
    const manager = props.manager;
    const playlistId = await createSpotifyPlaylist(props.name);
    if (!playlistId) return null;
    const added = manager.addLobby(playlistId);
    if (!added) return null;
    return new Lobby(playlistId, {...props, managerId: manager.id}, key);
  }

  /**
   * The manager user id of a lobby
   */
  public readonly managerId: string;

  /**
   * The theme of a lobby
   */
  public readonly theme: THEME;

  /**
   * The playlist name
   */
  get name(): string {
    return this.#name;
  }
  #name: string;

  /**
   * The participants in a lobby
   */
  get participants(): string[] {
    return this.#participants;
  }

  #participants: string[];

  /**
   * The list of song ids in the playlist
   */
  get songIds(): string[] {
    return this.#songIds;
  }

  #songIds: string[];

  private songMetadata: SongMetadata[];

  protected constructor(playlistId: string, props: LobbyProps, key: string | null = null) {
    super(playlistId, COLLECTION.LOBBIES, key);
    this.managerId = props.managerId;
    this.theme = props.theme;
    this.#name = props.name;
    this.#participants = props.participants ?? [props.managerId];
    this.#songIds = props.songIds ?? [];
    this.songMetadata = props.songMetadata ?? [];
  }

  /**
   * Converts the object into a form for the database
   * @returns a database entry
   */
  public toJson(): DatabaseEntry {
    const {collectionName: _c, ...entry} = this;
    return { ...entry, name: this.name, participants: this.participants, songIds: this.songIds };
  }

  /**
   * Add a user to the lobby
   */
  public async addUser(user: User, writeToDb = true): Promise<boolean> {
    this.#participants.push(user.id);
    const added = await user.addLobby(this.id);
    writeToDb && void this.writeToDatabase();
    return added;
  }

  /**
   * Removes a user from the lobby
   */
  public async removeUser(user: User, writeToDb = true): Promise<boolean> {
    const removeUserId = user.id;
    if (removeUserId === this.managerId || !this.#participants.includes(removeUserId)) return false;
    this.#participants = this.#participants.filter(uid => uid !== removeUserId);
    const removed = await user.removeLobby(this.id);
    writeToDb && void this.writeToDatabase();
    return removed;
  }

  /**
   * Update lobby name
   */
  public async updateName(name: string, writeToDatabase = true): Promise<void> {
    this.#name = name;
    writeToDatabase && void this.writeToDatabase();
  }

  /**
   * Synthesize playlist
   */
  public async synthesizePlaylist(writeToDatabase = true): Promise<boolean> {
    const songsMap = await this.participants.reduce(async (accP: Promise<Record<string, string[]>>, userId) => {
      const acc = await accP;

      const user = await User.fromId(userId);
      if (!user) return acc;

      user.topSongs.forEach((songId) => {
        if (!acc[songId]) acc[songId] = [];
        acc[songId].push(user.name);
      });

      return acc;
    }, Promise.resolve({}));

    const songScores: Song2Score[] = await Object.entries(songsMap).
      reduce(async (accP: Promise<Song2Score[]>, [id, contributors]) => {
        const acc = await accP;
        const song = await Song.fromId(id);
        if (!song || !song.audioFeatures) return acc;
        const score = computeScore(song.audioFeatures, this.theme) * (1 + contributors.length * .1);
        if (score === 0) return acc;
        acc.push({song, score});
        return acc;
      }, Promise.resolve([]));

    const topSongs = kLargest<Song2Score>(songScores, compareSongScores, 50);
    const isPlaylistUpdated = await updateSongs(this.id, ...topSongs.map(s => s.song.uri));

    if (!isPlaylistUpdated) return false;

    this.#songIds = topSongs.map(s => s.song.id);
    this.songMetadata = topSongs.map(s => ({
      id: s.song.id,
      name: s.song.name,
      artists: s.song.artists.map(a => a.name),
      contributors: songsMap[s.song.id],
    }));

    writeToDatabase && void this.writeToDatabase();

    return true;
  }

  /**
   * Formats the data in a client friendly manner
   *
   * @returns return a client response
   */
  public getClientResponse(): ClientResponse {
    return {name: this.name, theme: this.theme, participants: this.participants, songs: this.songMetadata};
  }

  /**
   * Determines is a User is in the Lobby
   */
  public containsParticipant(user: string | User): boolean {
    const userId = typeof user == 'string' ? user : user.id;
    return this.#participants.includes(userId);
  }
}
