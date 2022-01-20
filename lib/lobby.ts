import { getClient } from '.';
import { createSpotifyPlaylist } from '../utils/createSpotifyPlaylist';
import { DbItem, IDbItem } from './db-item';
import { COLLECTION } from './private/enums';
import { User } from './user';

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

export interface LobbyProps extends LobbyCreateProps{
  /**
  * The spotify id of playlist
  */
  readonly spotifyPlaylistId: string;

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
}

/**
 * The class containing a user and their data
 */
export class Lobby extends DbItem implements ILobby {
  /**
   * A static function to query for a user from their id
   *
   * @returns a user object if the id exists in the database
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
    // create new spotify playlist
    const participants = [props.managerId];
    const songIds: string[] = [];
    const playlistId = await createSpotifyPlaylist();
    const newProps = {
      ...props,
      spotifyPlaylistId: playlistId,
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

  protected constructor(id: string, props: LobbyProps, key: string | null = null) {
    super(id, COLLECTION.LOBBIES, key);
    this.managerId = props.managerId;
    this.#participants = props.participants ?? [];
    this.#songIds = props.songIds ?? [];
    this.spotifyPlaylistId = props.spotifyPlaylistId;
    this.theme = props.theme;
    this.#name = props.name;
  }

  /**
   * Converts the object into a form for the database
   * @returns a database entry
   */
  public toJson(): DatabaseEntry {
    const {collectionName: _c, ...entry} = this;
    return { ...entry, name: this.#name, participants: this.#participants };
  }

  /**
   * validate that a calling user is the manager of a lobby
   */
  public async validateManagerAccess(user: User): Promise<boolean> {
    return this.managerId === user.id;
  }

  /**
   * Add a user to the lobby
   */
  public async addUser(user: User, addUserId: string, writeToDatabase = true): Promise<boolean> {
    const validate = await this.validateManagerAccess(user);
    if (!validate) return false;
    this.#participants.push(addUserId);
    writeToDatabase && void this.writeToDatabase();
    return true;
  }

  /**
   * Removes a user from the lobby
   */
  public async removeUser(user: User, removeUserId: string, writeToDatabase = true): Promise<boolean> {
    const validate = await this.validateManagerAccess(user);
    if (!validate) return false;
    this.#participants = this.#participants.filter(uid => uid !== removeUserId);
    writeToDatabase && void this.writeToDatabase();
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
