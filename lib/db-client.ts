import oracledb from 'oracledb';
import {logger} from '../utils';

export interface IDbClient {
  readonly connection: oracledb.Connection;
  configure(): Promise<void>
}

export class DbClient {
  get connection(): oracledb.Connection {
    if (this._connection == null) {
      throw new Error(
        'DbClient is not connected to Oracle JSON Database. ' +
        'Make sure you configure the client with DbClient.configure().'
      );
    }
    return this._connection;
  }

  get soda(): oracledb.SodaDatabase {
    if (this._soda == null) {
      throw new Error(
        'SODA is not configured on DbClient. ' +
        'Make sure you configure the client with DbClient.configure().'
      );
    }
    return this._soda;
  }

  public readonly collections: {[name: string]: oracledb.SodaCollection};

  private _connection?: oracledb.Connection;
  private _soda?: oracledb.SodaDatabase;

  private _password: string;
  private _connectionString: string;

  public constructor() {
    this._password = process.env.PASSWORD ?? '';
    this._connectionString = process.env.CONNECTION_STRING ?? '';
  }

  public async configure(): Promise<void> {
    if (this.connection != null && this._soda != null) return;
    this._connection = await oracledb.getConnection({
      user: 'admin',
      password: this._password,
      connectionString: this._connectionString,
    });
    this._soda = await this._connection.getSodaDatabase();
    logger.success('Oracle DB connection established!');
  }

  public async openCollection(collectionName: string): Promise<oracledb.SodaCollection> {
    if (this.collections[collectionName] != null)
      return this.collections[collectionName];

    const collection = await this.soda.openCollection(collectionName);
    if (collection == undefined) {
      throw new Error('Collection not found. Make sure you provide the correct collection name.');
    }
    this.collections[collectionName] = collection;

    return collection;
  }
}
