import { Lobby } from "../lib/lobby";

async function main() {
  const lobbies = await Lobby.all();
  lobbies.forEach(lobby => lobby.synthesizePlaylist());
}

main();