import { getClient } from '.';
import { createSpotifyPlaylist } from '../utils/createSpotifyPlaylist';
import { DbItem, IDbItem } from './db-item';
import { COLLECTION } from './private/enums';

type DatabaseEntry = Omit<ILobby, 'collectionName'>;
type ClientResponse = Omit<DatabaseEntry, 'users' | 'uri'>;

export interface LobbyCreateProps {
  /**
    * The manager of a lobby
    */
  readonly managerId: string;

  /**
   * The theme of a lobby
   */
  readonly theme: string;

  /**
    * The playlist name
    */
  readonly name: string;
}

export interface LobbyProps extends LobbyCreateProps {
  /**
   * The participants in a lobby
   */
  readonly participants: string[];

  /**
   * The list of song ids in the playlist
   */
  readonly songIds: string[];
}

export interface ILobby extends LobbyProps, IDbItem {
  /**
  * The spotify id of playlist
  */
  readonly spotifyPlaylistId: string;
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
    const managerId = props.managerId;
    const playlistId = await createSpotifyPlaylist(managerId);
    if (!playlistId) return null;

    const exists = await Lobby.fromId(playlistId);
    if (exists) return null;
    const participants = [managerId];
    const songIds: string[] = [];
    const newProps = {
      ...props,
      participants: participants,
      songIds: songIds,
    };

    return new Lobby(playlistId, newProps, key);
  }

  /**
   * The spotify id of playlist
   */
  public readonly spotifyPlaylistId: string;

  /**
   * The manager user id of a lobby
   */
  public readonly managerId: string;

  /**
   * The theme of a lobby
   */
  public readonly theme: string;

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

  protected constructor(playlistId: string, props: LobbyProps, key: string | null = null) {
    super(playlistId, COLLECTION.LOBBIES, key);
    this.spotifyPlaylistId = playlistId;
    this.managerId = props.managerId;
    this.theme = props.theme;
    this.#name = props.name;
    this.#participants = props.participants ?? [];
    this.#songIds = props.songIds ?? [];
  }

  /**
   * Converts the object into a form for the database
   * @returns a database entry
   */
  public toJson(): DatabaseEntry {
    const {collectionName: _c, ...entry} = this;
    return { ...entry, name: this.#name, participants: this.#participants, songIds: this.#songIds };
  }

  /**
   * Add a user to the lobby
   */
  public async addUser(addUserId: string, writeToDb = true): Promise<boolean> {
    this.#participants.push(addUserId);
    writeToDb && void this.writeToDatabase();
    return true;
  }

  /**
   * Removes a user from the lobby
   */
  public async removeUser(removeUserId: string, writeToDb = true): Promise<boolean> {
    if (removeUserId === this.managerId || !this.#participants.includes(removeUserId)) return false;
    this.#participants = this.#participants.filter(uid => uid !== removeUserId);
    writeToDb && void this.writeToDatabase();
    return true;
  }

  /**
   * Update lobby name
   */
  public async updateName(name: string, writeToDatabase = true): Promise<void> {
    this.#name = name;
    writeToDatabase && void this.writeToDatabase();
  }

  /**
   * Formats the data in a client friendly manner
   *
   * @returns return a client response
   */
  public getClientResponse(): ClientResponse {
    const {collectionName: _c, ...response} = this;
    return response;
  }
}
