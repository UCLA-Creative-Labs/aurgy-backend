import { getClient, SpotifySubscriptionType } from ".";
import { DbItem, IDbItem } from "./db-item";
import { COLLECTION } from "./private/enums";

export interface IUser extends Omit<UserProps, 'topSongs'>, IDbItem {
  /**
   * A user's top songs
   */
  readonly topSongs: string[];
}

type DatabaseEntry = Omit<IUser, 'collectionName'>;

export interface UserProps {
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

  constructor(id: string, props: UserProps, existsInDb: boolean = false) {
    super(id, COLLECTION.USERS, existsInDb);
    this.topSongs = props.topSongs ?? [];
    this.name = props.name;
    this.accountType = props.accountType;
    this.uri = props.uri;
    this.images = props.images;
    this.country = props.country;
  }

  public toJson(): Omit<IUser, 'collectionName'> {
    return this;
  }
}