import { Router } from 'express';
import { POST_create } from './create';
import { POST_join } from './join';
import { POST_leave } from './leave';
import { GET_ } from './get';

export const lobby_router = Router();

// Create a lobby
lobby_router.post("/create", POST_create);

// Join a lobby
lobby_router.post("/join", POST_join);

// Leave a lobby
lobby_router.post("/leave", POST_leave);

// Get information on the lobby
lobby_router.get("/:lobby_id", GET_);

