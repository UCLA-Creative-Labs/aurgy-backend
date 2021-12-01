import express from 'express';
import {logger} from '../utils';

import { DbClient } from '../lib';

const client = new DbClient();
const app = express();

async function main() {
  try { await client.configure(); }
  catch (err) { logger.error(err); }

  app.get('/', async (_req, res) => {
    const collection = await client.openCollection('test');
    const count = await collection.find().count();
    res.send(`Connection to db established!! Count: ${JSON.stringify(count)}.`); });

  const PORT = process.env.PORT ?? 3000;

  app.listen(PORT, () => logger.info(`App listening on PORT ${PORT}`));
}

main();
