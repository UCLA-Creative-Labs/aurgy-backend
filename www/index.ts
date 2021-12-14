import express from 'express';
import { getClient } from '../lib';
import {logger} from '../utils';

// ROUTE
import { POST_login } from './login';

const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(express.json()); // for parsing application/json

app.get('/', async (_req, res) => {
  const client = await getClient();
  const collection = await client.openCollection('test');
  const count = await collection.find().count();
  res.send(`Connection to db established!! Count: ${JSON.stringify(count)}`);
});

// LOGIN
app.post('/post', POST_login);

app.listen(PORT, () => logger.info(`App listening on PORT ${PORT}`));

