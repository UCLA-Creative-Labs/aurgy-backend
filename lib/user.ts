import { getClient, SpotifySubscriptionType } from '.';
import { DbItem, IDbItem } from './db-item';
import { COLLECTION } from './private/enums';

type DatabaseEntry = Omit<IUser, 'collectionName' | 'existsInDb'>;
type ClientResponse = Omit<DatabaseEntry, 'topSongs' | 'refreshToken' | 'uri'>;

export interface UserProps {
  /**
   * The refresh token for the user
   */
  readonly refreshToken: string;

  /**
   * A user's top songs
   */
  readonly topSongs?: string[];

  /**
  * The user's spotify subscription type: premium/free
  */
  readonly accountType: SpotifySubscriptionType;

  /**
  * The user's name
  */
  readonly name: string;

  /**
  * The user's uniform resource identifier
  */
  readonly uri: string;

  /**
  * The user's profile images
  */
  readonly images: string[];

  /**
  * The user's country
  */
  readonly country: string;
}

export interface IUser extends Omit<UserProps, 'topSongs'>, IDbItem {
  /**
   * A user's top songs
   */
  readonly topSongs: string[];
}

export type VerifiedUser = { status: 403 | 404, user?: User } | { status: 200, user: User };

/**
 * The class containing a user and their data
 */
export class User extends DbItem implements IUser {
  /**
   * A static function to query for a user from their id
   *
   * @returns a user object if the id exists in the database
   */
  public static async fromId(id: string): Promise<User | null> {
    const client = await getClient();
    const document = await client.findDbItem(COLLECTION.USERS, id);
    if (!document) return null;
    const content: DatabaseEntry = document.getContent() as DatabaseEntry;
    return new User(id, content, true);
  }

  public static async verifyRequest(id: string, refreshToken: string): Promise<VerifiedUser> {
    const user = await User.fromId(id);
    if (!user) return { status: 404 };
    else if (user.id !== id || user.refreshToken !== refreshToken) return { status: 403 };
    else return { status: 200, user };
  }

  /**
   * A user's top songs
   */
  public readonly topSongs: string[];

  /**
   * The user's spotify subscription type: premium/free
   */
  public readonly accountType: SpotifySubscriptionType;

  /**
   * The user's name
   */
  public readonly name: string;

  /**
   * The user's uniform resource identifier
   */
  public readonly uri: string;

  /**
   * The user's profile images
   */
  public readonly images: string[];

  /**
   * The user's country
   */
  public readonly country: string;

  /**
   * The refresh token for the user
   */
  get refreshToken(): string {
    return this.#refreshToken;
  }

  #refreshToken: string;

  constructor(id: string, props: UserProps, existsInDb = false) {
    super(id, COLLECTION.USERS, existsInDb);
    this.#refreshToken = props.refreshToken;
    this.topSongs = props.topSongs ?? [];
    this.name = props.name;
    this.accountType = props.accountType;
    this.uri = props.uri;
    this.images = props.images;
    this.country = props.country;
  }

  /**
   * Converts the object into a form for the database
   * @returns a database entry
   */
  public toJson(): DatabaseEntry {
    const {collectionName: _c, ...entry} = this;
    return { ...entry, refreshToken: this.refreshToken };
  }

  /**
   * Updates a user's top songs
   */
  public updateTopSongs(): void {
    // Get user access token
    // Get top songs from user
    // Update the top songs portion of this
    void this.writeToDatabase();
  }

  /**
   * Formats the data in a client friendly manner
   *
   * @returns return a client response
   */
  public getClientResponse(): ClientResponse {
    const {collectionName: _c, topSongs: _t, uri: _u, ...response} = this;
    return response;
  }
}
