# Aurgy Backend - Design Doc

This document was created to outline the development of the Aurgy backend service.
At a high level, it should serve as guiding principles and **not** as a source
of truth. As we learn more about the Spotify API, we will understand the limitations
of the API and combat them in an ad hoc fashion.

## Table Of Contents

* [Overview](#Overview)
* [Database Interactions](#Database-Interactions)
  * [Database Client](#Database-Client)
  * [Database Items](#Database-Items)
  * [Songs](#Songs)
  * [Users](#Users)
  * [Lobbies](#Lobbies)
* [Spotify Interactions](#Spotify-Interactions)
  * [Access Token](#Access-Token)
  * [User Info](#User-Info)
  * [User Top Songs](#User-Top-Songs)
  * [Creating Playlists](#Creating-Playlists)
  * [Mutating Playlists](#Mutating-Playlists)
  * [Deleting Playlists](#Deleting-Playlists)
* [Express Endpoints](#Express-Endpoints)
  * [POST /me](#POST-me)
  * [GET /me](#GET-me)
  * [DELETE /me](#DELETE-me)
  * [POST /lobby](#POST-lobby)
  * [GET /lobby](#GET-lobby)
  * [DELETE /lobby](#DELETE-lobby)
  * [POST /lobby/:id](#POST-lobbyid)
  * [GET /lobby/:id](#GET-lobbyid)
  * [DELETE /lobby/:id](#DELETE-lobbyid)
* [Playlist Generation](#Playlist-Generation)
  * [Themes and Audio Features](#Themes-and-Audio-Features)


## Overview

Aurgy is a web app that creates and manages group playlists surrounding a theme. 
We are going to use a variation of the **MERN** stack. For our database, we are
using **Oracle Cloud Infrastructure's Autonomous JSON Database**. **Express** is
the Javascript library we are using for our server. **Next.js** is the framework
for our frontend. And finally, **node.js** is the runtime for our express server.

To build the backend, we will focus on four main components:
* Database Interactions
* Spotify Interactions
* Express Endpoints
* Playlist Generation

This document will outline a theoretical implementation and usage of each component.

**Note**: All notation in this document should serve as a foundation for building out
the backend service. Use it to understand how the multiple components align together,
but don't constrict yourself to the implementation discussed below.

## Database Interactions

Our database service is OCI's Autonomous JSON Database (AJD). When it comes to AJD, 
there are a couple of gotchas to note.

* Install the oracle client library
* Install `node-oracledb`
* Set config path of the client library
* Get wallet and put it in the client library at `instantclient_Xx_Xx/network/admin`

### Database Client

In order to interact with the database, we will use a **client** to perform all our
read and writes. This will allow us a method to standardize our writes and prevent
inconsistencies.

In order to do so, the database client should be built as a class in the following form:

```ts
/**
 * A Client for managing database connections.
 */
export class DbClient {
  /**
   * The Oracle DB connection.
   */
  get connection(): oracledb.Connection;

  /**
   * The soda database connection for Oracle DB.
   */
  get soda(): oracledb.SodaDatabase;

  /**
   * Database collections where the key is the collection name.
   */
  public readonly collections: {[name: string]: oracledb.SodaCollection};

  /**
   * Intializes oracle client library and save password/connection string.
   */
  public constructor();

  /**
   * Configures the db client. You must run this function once.
   */
  public async configure(): Promise<void>;

  /**
   * Open a database collection given the collection name.
   *
   * @param collectionName the name of the collection
   */
  public async openCollection(collectionName: string): Promise<oracledb.SodaCollection>;

  /**
   * Query for a database item by their id and collection name.
   *
   * @param collectionName the collection to query from
   * @param id the id of the document
   * @returns the soda document associated with the query
   */
  public async findDbItem(collectionName: string, id: string): Promise<oracledb.SodaDocument | null>;

  /**
   * Write a database item into a collection
   *
   * @param items the database items to write
   */
  public async writeDbItems(...items: DbItem[]): Promise<void>;
}
```

**Note**: During development, all writes and reads will come from test collections. 

### Database Items

A database item is the building block for every object that will be inserted
into the database. Every database item must have the following attributes:
* **id**: The id of the item (this helps with querying because each collection is indexed by `id`)
* **collectionName**: The collection the item belongs to

```ts
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
  public readonly collectionName: string;

  /**
   * Check if the object exists within the database already
   * 
   * Useful for determining whether or not to insert or replace an item.
   */
  public readonly existsInDb: boolean;

  /**
   * Writes the database item to the database
   */
  public readonly writeToDatabase(): void;

  /**
   * A function that converts the object into a JSON form
   */
  public abstract toJson(): Record<string, any>;
}
```

### Songs

Songs exist as objects that will be inserted into the database. Thus, it must
extend from Database Item.

The fundamental knowledge of a song should be the following:

```ts
/**
 * The class containing a song and it's audio features
 */
export class Song extends DbItem implements ISong {
  /**
   * A static function to query for a song from its id
   *
   * @returns a song object if the id exists in the database
   */
  public static async fromId(id: string): Promise<Song | null>;

  /**
   * The id of the song
   */
  public readonly id: string;

  /**
   * The collection name for a song is 'songs'
   */
  public readonly collectionName = 'songs';

  /**
   * The song name
   */
  public readonly name: string;

  /**
   * The song's uniform resource identifier
   */
  public readonly uri: string;

  /**
   * The song's duration in milliseconds
   */
  public readonly duration: number;

  /**
   * The song's popularity.. why not?
   */
  public readonly popularity?: number;

  /**
   * A list of artists for the song
   * 
   * ```json
   * {
   *   id: string
   *   uri: string
   *   name: string
   * }
   * ```
   */
  public readonly artists: Artist[];

  /**
   * The song's audio features
   */
  public readonly audioFeatures: AudioFeature;
}
```

### Users

Users exist as objects that will be inserted into the database. Thus, it must
extend from Database Item.

The fundamental knowledge the User class must have is the following:

```ts
/**
 * The class containing a user and their data
 */
export class User extends DbItem implements IUser {
  /**
   * A static function to query for a user from their id
   *
   * @returns a user object if the id exists in the database
   */
  public static async fromId(id: string): Promise<User | null>;

  /**
   * The id of the user
   */
  public readonly id: string;

  /**
   * The collection name for a user is 'users'
   */
  public readonly collectionName = 'users';

  /**
   * A user's top songs
   */
  public readonly topSongs: Song[];

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
}
```

### Lobbies

Lobbies exist as objects that will be inserted into the database. Thus, it must
extend from Database Item.

The fundamental knowledge the Lobby class must have is the following:

```ts
/**
 * The class containing a lobby and it's data
 */
export class Lobby extends DbItem implements ILobby {
  /**
   * A static function to query for a Lobby from it's id
   *
   * @returns a lobby object if the id exists in the database
   */
  public static async fromId(id: string): Promise<Lobby | null>;

  /**
   * The id of the lobby
   */
  public readonly id: string;

  /**
   * The collection name for a lobby is 'lobbys'
   */
  public readonly collectionName = 'lobbys';

  /**
   * A user's top songs
   */
  public readonly songs: Song[];

  /**
   * The spotify id of playlist
   */
  public readonly spotifyPlaylistId: string;

  /**
   * The manager of a lobby
   */
  public readonly manager: User;

  /**
   * The participants in a lobby
   */
  public readonly participants: User[];

  /**
   * The playlist name
   */
  public readonly name: string;

  /**
   * Update the playlist based on the name and songs
   */
  public async updatePlaylist(): Promise<void>;
}
```

## Spotify Interactions

The spotify

### Access Token

### User Info

### User's Top Songs

### Creating Playlists

### Populating Playlists

### Changing Playlists

## Express Endpoints

| Verb   | Route        | Description                                                         |
| ------ | ------------ | ------------------------------------------------------------------- |
| POST   | `/me`        | Creates an account for the user and returns the user's data         |
| GET    | `/me`        | Login given user cookies and verifies the data aligns w/ the server |
| DELETE | `/me`        | Removes a user's info from the database                             |
| ------ | ------------ | ------------------------------------------------------------------- |
| POST   | `/lobby`     | Creates a new lobby and returns the lobby id w/ lobby data          |
| GET    | `/lobby`     | Returns the lobbies a user is managing and participating in         |
| DELETE | `/lobby`     | Deletes a lobby a user owns                                         |
| ------ | ------------ | ------------------------------------------------------------------- |
| POST   | `/lobby/:id` | Join a lobby                                                        |
| GET    | `/lobby/:id` | Get lobby specific info                                             |
| DELETE | `/lobby/:id` | Leave a lobby                                                       |

### POST /me

### GET /me

### DELETE /me

### POST /lobby

### GET /lobby

### DELETE /lobby

### POST /lobby/:id

### GET /lobby/:id

### DELETE /lobby/:id

## Playlist Generation

### Themes and Audio Features


