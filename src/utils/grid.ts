import Chance from "chance";
import clamp from "lodash.clamp";

import { Directions } from "./movement";

const chance = new Chance();

export enum TileType {
  Empty = 0,
  Wall = 1
}

export const directionDifferences = {
  [Directions.North]: [-1, 0],
  [Directions.East]: [0, 1],
  [Directions.South]: [1, 0],
  [Directions.West]: [0, -1]
};

export const getRandomEntry = (array: any[]): any =>
  array[chance.integer({ min: 0, max: array.length - 1 })];

export const generateEmptyTile = (): Tile => ({
  type: TileType.Empty,
  planeKey: null
});

export const generateEmptyGrid = (rows: number, columns: number): Grid =>
  Array.from({ length: rows }, () =>
    Array.from({ length: columns }, generateEmptyTile)
  );

export const getGridDimensions = (grid: Grid): GridDimensions => [
  grid.length,
  grid[0].length
];

export const generateRandomCoordinates = (
  gridDimensions: GridDimensions
): GridCoordinates => {
  const [yMax, xMax] = gridDimensions;
  return [
    chance.integer({ min: 0, max: yMax - 1 }),
    chance.integer({ min: 0, max: xMax - 1 })
  ];
};

export const selectAvailableCoordinates = (
  occupiedCoordinates: GridCoordinates[],
  gridDimensions: GridDimensions
): GridCoordinates => {
  const occupiedCoordinatesHash: OccupiedCoordinatesHash = occupiedCoordinates.reduce(
    (prev: OccupiedCoordinatesHash, next) => {
      prev[next.toString()] = true;
      return prev;
    },
    {}
  );
  let chosenCoordinates = generateRandomCoordinates(gridDimensions);

  while (occupiedCoordinatesHash[chosenCoordinates.toString()]) {
    chosenCoordinates = generateRandomCoordinates(gridDimensions);
  }

  return chosenCoordinates;
};

export const generateNextCoordinates = (
  coordinates: GridCoordinates,
  direction: Directions,
  dimensions: GridDimensions
): GridCoordinates => {
  const [y, x] = coordinates;
  const [yDifference, xDifference] = directionDifferences[direction];
  const [yMax, xMax] = dimensions;
  const nextY = clamp(y + yDifference, 0, yMax - 1);
  const nextX = clamp(x + xDifference, 0, xMax - 1);

  return [nextY, nextX];
};
