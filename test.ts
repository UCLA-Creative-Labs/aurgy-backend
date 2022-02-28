import { Lobby } from "./lib/lobby"

async function main() {
  const id = '7fMyJBkQpK34kr6rotEqHX'
  const lobby = await Lobby.fromId(id);
  lobby?.synthesizePlaylist();
}

main();