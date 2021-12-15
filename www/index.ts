import express from 'express';
import cors from 'cors';

import { getClient } from '../lib';
import {logger} from '../utils';

// ROUTE
import { POST_login } from './login';

const PORT = process.env.PORT ?? 3000;

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'PROD'
  ? 'https://aurgy.creativelabsucla.com'
  : 'http://localhost:3000';

app.use(cors({ origin: allowedOrigins }));

app.use(express.json()); // for parsing application/json

app.get('/', async (_req, res) => {
  const client = await getClient();
  const collection = await client.openCollection('test');
  const count = await collection.find().count();
  res.send(`Connection to db established!! Count: ${JSON.stringify(count)}`);
});

// LOGIN
app.post('/login', POST_login);

app.listen(PORT, () => logger.info(`App listening on PORT ${PORT}`));

