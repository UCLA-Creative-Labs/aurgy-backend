import oracledb from 'oracledb';
import {logger} from '../utils';

// To make sure all writes are saved
oracledb.autoCommit = true;

/**
 * A Client for managing database connections.
 */
export class DbClient {
  /**
   * The Oracle DB connection.
   *
   * @throws if the Client is not configured
   */
  get connection(): oracledb.Connection {
    if (this._connection == null) {
      throw new Error(
        'DbClient is not connected to Oracle JSON Database. ' +
        'Make sure you configure the client with DbClient.configure().',
      );
    }
    return this._connection;
  }

  /**
   * The soda database connection for Oracle DB.
   *
   * @throws if the Client is not configured
   */
  get soda(): oracledb.SodaDatabase {
    if (this._soda == null) {
      throw new Error(
        'SODA is not configured on DbClient. ' +
        'Make sure you configure the client with DbClient.configure().',
      );
    }
    return this._soda;
  }

  /**
   * Database collections where the key is the collection name.
   */
  public readonly collections: {[name: string]: oracledb.SodaCollection};

  /**
   * The password for the oracle db connection.
   */
  private readonly _password: string;
  /**
   * The connection string for the oracle db connection.
   */
  private readonly _connectionString: string;

  /**
   * The private variable containing the connection.
   */
  private _connection?: oracledb.Connection;
  /**
   * The private variable contianing the soda instance.
   */
  private _soda?: oracledb.SodaDatabase;

  public constructor() {
    oracledb.initOracleClient({configDir: '/home/opc/instantclient_19_10' });
    this._password = process.env.PASSWORD ?? '';
    this._connectionString = process.env.CONNECTION_STRING ?? '';
    this.collections = {};
  }

  /**
   * Configures the db client. You must run this function once.
   */
  public async configure(): Promise<void> {
    if (this._connection != null && this._soda != null) return;
    try {
      this._connection = await oracledb.getConnection({
        user: 'admin',
        password: this._password,
        connectionString: this._connectionString,
      });
      this._soda = await this._connection.getSodaDatabase();
      logger.info('Oracle DB connection established!');
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   * Open a database collection given the collection name.
   *
   * NOTE: When the app is not in production, this will look
   * for a collection with the prefix 'test_'.
   *
   * For example:
   * ```
   * client.openCollection('users')  // looks up `test_users`
   * ```
   *
   * @param pCollectionName the name of the collection
   */
  public async openCollection(pCollectionName: string): Promise<oracledb.SodaCollection> {
    const collectionName = process.env.NODE_ENV === 'PROD'
      ? pCollectionName
      : `test_${pCollectionName}`;

    if (this.collections[collectionName] != null)
      return this.collections[collectionName];

    const collection = await this.soda.openCollection(collectionName);
    if (collection == undefined) {
      throw new Error('Collection not found. Make sure you provide the correct collection name.');
    }
    this.collections[collectionName] = collection;

    return collection;
  }

  /**
   * Query for a document by the id and collection name
   *
   * @param id the id of the document
   * @param collectionName the collection to query from
   * @returns the soda document associated with the query
   */
  public async findDocument(id: string, collectionName: string): Promise<oracledb.SodaDocument | null> {
    const collection = await this.openCollection(collectionName);
    const item = await collection.find().filter({id}).getOne();
    return item ?? null;
  }
}

let CLIENT: DbClient;

export async function getClient(): Promise<DbClient> {
  if (CLIENT != undefined) return CLIENT;

  CLIENT = new DbClient();
  try { await CLIENT.configure(); }
  catch (err) { logger.error(err); }

  return CLIENT;
}

