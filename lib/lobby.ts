import { getClient } from '.';
import { DbItem, IDbItem } from './db-item';
import { COLLECTION } from './private/enums';

type DatabaseEntry = Omit<ILobby, 'collectionName' | 'existsInDb'>;
type ClientResponse = Omit<DatabaseEntry, 'users' | 'uri'>;

export interface LobbyProps {
  /**
   * The id of the lobby creator
   */
  readonly ownerId: string;

  /**
   * A lobby's users
   */
  readonly users: string[];

  /**
  * The spotify playlist id
  */
  readonly playlistId?: string;

  /**
  * The theme for the lobby
  */
  readonly theme: string;

  /**
  * The name of the lobby
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
    return new Lobby(id, content, true);
  }

  /**
   * Verify the user exists in the database and that the refresh token match
   *
   * @param id the user id
   * @param refreshToken the refresh token
   *
   * @returns the status to return and user if its verified
   */
  // public static async verifyRequest(id: string, refreshToken: string): Promise<VerifiedUser> {
  //   const user = await User.fromId(id);
  //   if (!user) return { status: 404 };
  //   else if (user.refreshToken !== refreshToken) return { status: 403 };
  //   else return { status: 200, user };
  // }

  /**
   * The id of the lobby creator
   */
  readonly ownerId: string;

  /**
   * The spotify playlist id
   */
  readonly playlistId?: string;

  /**
   * The theme for the lobby
   */
  readonly theme: string;

  /**
  * The name of the lobby
  */
  readonly name: string;

  /**
   * A lobby's users
   */
  get users(): string[] {
    return this.#users;
  }

  #users: string[];

  constructor(id: string, props: LobbyProps, existsInDb = false) {
    super(id, COLLECTION.LOBBIES, existsInDb);
    this.ownerId = props.ownerId;
    this.#users = props.users ?? [];
    this.playlistId = props.playlistId;
    this.theme = props.theme;
    this.name = props.name;
  }

  /**
   * Converts the object into a form for the database
   * @returns a database entry
   */
  public toJson(): DatabaseEntry {
    const {collectionName: _c, ...entry} = this;
    return { ...entry, users: this.#users };
  }

  /**
   * Add a user to the lobby
   */
  public AddUser(): void {
    // Validate user access token
    // Get uid to add
    // Update the users list portion of this
    void this.writeToDatabase();
  }

  /**
   * Removes a user from the lobby
   */
  public RemoveUser(): void {
    // Validate user access token
    // Get uid to remove
    // Update the users list portion of this
    void this.writeToDatabase();
  }

  /**
   * Update lobby theme
   */
  public UpdateTheme(): void {
    void this.writeToDatabase();
  }

  /**
   * Update lobby name
   */
  public UpdateName(): void {
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
