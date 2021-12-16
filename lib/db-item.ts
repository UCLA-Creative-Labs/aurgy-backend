import {getClient} from './db-client';

/**
 * The interface for a database item
 */
export interface IDbItem extends Record<string, any> {
  readonly id: string;
}

/**
 * The attributes required to query a database item
 */
export interface DbItemAttributes {
  /**
   * The id of the database item
   */
  readonly id: string;

  /**
   * The collection the item lives in
   */
  readonly collectionName: string;
}

/**
 * A database item. All database items should extend this class.
 */
export class DbItem implements IDbItem {

  public static async findDbItemFromAttributes({id, collectionName}: DbItemAttributes): Promise<IDbItem | null> {
    const client = await getClient();
    const content = (await client.findDocument(collectionName, id))?.getContent();
    return content as IDbItem ?? null;
  }

  /**
   * The id of the item in a collection
   */
  public readonly id: string;

  /**
   * The collection this database item belongs to
   */
  public readonly collectionName: string;

  constructor(id: string, collectionName: string) {
    this.id = id;
    this.collectionName = collectionName;
  }
}