import express from 'express';
import {logger} from '../utils';

const app = express();

app.get('/', (_req, res) => {
  res.send('Hello!!');
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => logger.info(`App listening on PORT ${PORT}`));
