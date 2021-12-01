import express from 'express';
import {logger} from '../utils';

import { DbClient } from '../lib';

const client = new DbClient();
const app = express();

async function main() {
  try { await client.configure(); }
  catch (err) { logger.error(err); }

  app.get('/', (_req, res) => {
    res.send('Hello!!');
  });

  const PORT = process.env.PORT ?? 3000;

  app.listen(PORT, () => logger.info(`App listening on PORT ${PORT}`));
}

main();
