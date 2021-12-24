import { getClient } from '.';
import { DbItem, IDbItem } from './db-item';
import { COLLECTION } from './private/enums';
import { User } from './user';

type DatabaseEntry = Omit<ILobby, 'collectionName' | 'existsInDb'>;
type ClientResponse = Omit<DatabaseEntry, 'users' | 'uri'>;

export interface LobbyProps {
  /**
  * The spotify id of playlist
  */
  readonly spotifyPlaylistId?: string;

  /**
   * The manager of a lobby
   */
  readonly manager: User;

  /**
   * The participants in a lobby
   */
  readonly participants: string[];

  /**
   * The theme of a lobby
   */
  readonly theme: string;

  /**
   * The playlist name
   */
  readonly name: string;
}

export interface ILobby extends Omit<LobbyProps, 'topSongs'>, IDbItem {
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
   * The spotify id of playlist
   */
  readonly spotifyPlaylistId?: string;

  /**
   * The manager of a lobby
   */
  readonly manager: User;

  /**
   * The theme of a lobby
   */
  readonly theme: string;

  /**
   * The playlist name
   */
  readonly name: string;

  /**
   * The participants in a lobby
   */
  get participants(): string[] {
    return this.#users;
  }

  #users: string[];

  constructor(id: string, props: LobbyProps, key: string | null = null) {
    super(id, COLLECTION.LOBBIES, key);
    this.manager = props.manager;
    this.#users = props.participants ?? [];
    this.spotifyPlaylistId = props.spotifyPlaylistId;
    this.theme = props.theme;
    this.name = props.name;
  }

  /**
   * Converts the object into a form for the database
   * @returns a database entry
   */
  public toJson(): DatabaseEntry {
    const {collectionName: _c, ...entry} = this;
    return { ...entry, participants: this.#users };
  }

  /**
   * Add a user to the lobby
   */
  public async addUser(): Promise<void> {
    // Validate user access token
    // Get uid to add
    // Update the users list portion of this
    void this.writeToDatabase();
  }

  /**
   * Removes a user from the lobby
   */
  public async removeUser(): Promise<void> {
    // Validate user access token
    // Get uid to remove
    // Update the users list portion of this
    void this.writeToDatabase();
  }

  /**
   * Update lobby name
   */
  public async updateName(): Promise<void> {
    void this.writeToDatabase();
  }

  /**
   * Update the playlist based on the name and songs
   */
  public async updatePlaylist(): Promise<void> {
    void this.writeToDatabase();
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
