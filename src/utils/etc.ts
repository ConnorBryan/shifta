import fs, { write } from "fs";
import { promisify } from "util";

const writeToFile = promisify(fs.writeFile);

export const outputGameToFile = (game: GameState): void => {
  writeToFile("data.json", JSON.stringify(game, null, 2));
};
