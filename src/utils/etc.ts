import fs, { write } from "fs";
import { promisify } from "util";

import { TileType } from "./grid";

const writeToFile = promisify(fs.writeFile);

export const outputGameToFile = (game: GameState): void => {
  writeToFile("data.json", JSON.stringify(game, null, 2));
};

export const drawAsciiGrid = (
  layout: Grid,
  [playerY, playerX]: GridCoordinates
): void => {
  let gridString = "";

  layout.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      if (rowIndex === playerY && columnIndex === playerX) {
        gridString += "O ";
      } else {
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
      }
    });

    gridString += "\n";
  });

  writeToFile("grid.txt", gridString);
};
