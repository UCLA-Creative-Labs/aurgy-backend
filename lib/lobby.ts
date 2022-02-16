import { getClient, User } from '.';
import { DbItem, IDbItem } from './db-item';
import { COLLECTION } from './private/enums';
import { createSpotifyPlaylist } from './spotify/create-playlist';

type DatabaseEntry = Omit<ILobby, 'collectionName'>;
type ClientResponse = Omit<DatabaseEntry, 'users' | 'uri'>;

export interface LobbyCreateProps {
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
}

export interface ILobby extends Omit<LobbyProps, 'particapnts' | 'songIds'>, IDbItem {
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
    const playlistId = await createSpotifyPlaylist();
    if (!playlistId) return null;
    void manager.addLobby(playlistId);
    return new Lobby(playlistId, {...props, managerId: manager.id}, key);
  }

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
    this.managerId = props.managerId;
    this.theme = props.theme;
    this.#name = props.name;
    this.#participants = props.participants ?? [props.managerId];
    this.#songIds = props.songIds ?? [];
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
    void user.addLobby(this.id);
    writeToDb && void this.writeToDatabase();
    return true;
  }

  /**
   * Removes a user from the lobby
   */
  public async removeUser(user: User, writeToDb = true): Promise<boolean> {
    const removeUserId = user.id;
    if (removeUserId === this.managerId || !this.#participants.includes(removeUserId)) return false;
    this.#participants = this.#participants.filter(uid => uid !== removeUserId);
    void user.removeLobby(this.id);
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
    return {...response, name: this.name, participants: this.participants};
  }

  /**
   * Determines is a User is in the Lobby
   */
  public containsParticipant(user: string | User): boolean {
    const userId = typeof user == 'string' ? user : user.id;
    return this.#participants.includes(userId);
  }
}
