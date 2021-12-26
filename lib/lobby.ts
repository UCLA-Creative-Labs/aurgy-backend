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
  readonly managerId: string;

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
   * The spotify id of playlist
   */
  readonly spotifyPlaylistId?: string;

  /**
   * The manager user id of a lobby
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

  constructor(id: string, props: LobbyProps, key: string | null = null) {
    super(id, COLLECTION.LOBBIES, key);
    this.managerId = props.managerId;
    this.#participants = props.participants ?? [];
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
    return { ...entry, participants: this.#participants };
  }

  /**
   * validate that a calling user is the manager of a lobby
   */
  public async validateManagerAccess(user : User) : Promise<boolean> {
    const manager = await User.fromId(this.managerId);
    const managerToken = await manager?.getAccessToken();
    const accessToken = await user.getAccessToken();
    return managerToken === accessToken;
  }

  /**
   * Add a user to the lobby
   */
  public async addUser(user : User, addUserId : string): Promise<void> {
    const validate = await this.validateManagerAccess(user);
    if (validate) {
      this.#participants = [...this.#participants, addUserId];
      void this.writeToDatabase();
    }
  }

  /**
   * Removes a user from the lobby
   */
  public async removeUser(user : User, removeUserId : string): Promise<void> {
    const validate = await this.validateManagerAccess(user);
    if (validate) {
      this.#participants = this.#participants.filter(uid => uid !== removeUserId);
      void this.writeToDatabase();
    }
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
