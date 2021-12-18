import { getClient } from "./db-client";
import { COLLECTION } from "./private/enums";

/**
 * The interface for a database item
 */
export interface IDbItem {
  readonly id: string;
  readonly collectionName: string;
  readonly existsInDb: boolean;
}

/**
 * A database item. All database items should extend this class.
 */
export abstract class DbItem implements IDbItem {
  /**
   * The id of the item in a collection
   */
  public readonly id: string;

  /**
   * The collection this database item belongs to
   */
  public readonly collectionName: COLLECTION;

  /**
   * Check if the object exists within the database already
   * 
   * Useful for determining whether or not to insert or replace an item.
   */
  get existsInDb(): boolean {
    return this._existsInDb;
  }

  constructor(id: string, collectionName: COLLECTION, private _existsInDb = false) {
    this.id = id;
    this.collectionName = collectionName;
  }

  /**
   * Writes the database item to the database
   */
  public async writeToDatabase(): Promise<void> {
    const client = await getClient();
    client.writeDbItems(this);
  }

  /**
   * Convert the class into a JSON object for storage
   */
  public abstract toJson(): Record<string, any>;
}
