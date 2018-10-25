import fs, { write } from "fs";
import { promisify } from "util";

import { TileType } from "./grid";

const writeToFile = promisify(fs.writeFile);

export const outputGameToFile = (game: GameState): void => {
  writeToFile("data.json", JSON.stringify(game, null, 2));
};

export const drawAsciiGrid = (layout: Grid): void => {
  let gridString = "";

  layout.forEach(row => {
    row.forEach(column => {
      switch (column.type) {
        case TileType.Empty:
          gridString += "_ ";
          break;
        case TileType.Wall:
          gridString += "X ";
          break;
        default:
          break;
      }
    });

    gridString += "\n";
  });

  writeToFile("grid.txt", gridString);
};
