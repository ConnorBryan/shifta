import Chance from "chance";
import clamp from "lodash.clamp";
import cloneDeep from "lodash.clonedeep";

import * as config from "../config";
import { Directions } from "./movement";

const chance = new Chance();

export enum TileType {
  Empty = "EMPTY",
  Wall = "WALL"
}

export const directionDifferences: {
  [direction: string]: GridCoordinates;
} = {
  [Directions.North]: [-1, 0],
  [Directions.East]: [0, 1],
  [Directions.South]: [1, 0],
  [Directions.West]: [0, -1]
};

export const reverseDirections: { [direction: string]: Directions } = {
  [Directions.North]: Directions.South,
  [Directions.East]: Directions.West,
  [Directions.South]: Directions.North,
  [Directions.West]: Directions.East
};

export const allDirections: Directions[] = [
  Directions.North,
  Directions.East,
  Directions.South,
  Directions.West
];

export const getRandomEntry = (array: any[]): any =>
  array[chance.integer({ min: 0, max: Math.max(array.length - 1, 0) })];

export const generateTile = (type: TileType): Tile => ({
  type,
  planeKey: null
});

export const generateEmptyTile = () => generateTile(TileType.Empty);
export const generateWallTile = () => generateTile(TileType.Wall);

export const generateInitialGrid = (rows: number, columns: number): Grid =>
  Array.from({ length: rows }, () =>
    Array.from({ length: columns }, generateWallTile)
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

export const atLeastHalfOfGridIsEmpty = (grid: Grid): boolean => {
  const gridSize = config.GRID_ROW_SIZE * config.GRID_COLUMN_SIZE;

  let emptyCount = 0;

  grid.forEach(row =>
    row.forEach(column => {
      if (column.type === TileType.Empty) {
        emptyCount++;
      }
    })
  );

  return emptyCount / gridSize >= 0.5;
};

export const getNeighboringTile = (
  grid: Grid,
  coordinates: GridCoordinates
): GridCoordinates => {
  const direction = getRandomEntry(allDirections);
  const [yDifference, xDifference] = directionDifferences[direction];
  const [yCurrent, xCurrent] = coordinates;
  const neighboringTile: GridCoordinates = [
    yCurrent + yDifference,
    xCurrent + xDifference
  ];
  const [neighboringY, neighboringX] = neighboringTile;
  const isValid = grid[neighboringY] && grid[neighboringY][neighboringX];

  return isValid ? neighboringTile : getNeighboringTile(grid, coordinates);
};

export const createTunnels = (grid: Grid, start: GridCoordinates) => {
  const [startY, startX] = start;

  let gridWithTunnels = cloneDeep(grid);
  let tunnelsRemaining = chance.integer({
    min: config.MIN_TUNNEL_COUNT,
    max: config.MAX_TUNNEL_COUNT
  });
  let activeCoordinates = [startY, startX];
  let lastDirection;

  do {
    // Select a random direction.
    const direction = getRandomEntry(allDirections);

    // Make sure it's not a) the reverse direction or b) the prior direction.
    const reverseDirection = lastDirection && reverseDirections[lastDirection];

    if (direction === reverseDirection || direction === lastDirection) {
      continue;
    }

    lastDirection = direction;

    // Generate a random length of the tunnel.
    let tunnelLength = chance.integer({
      min: 1,
      max: config.MAX_TUNNEL_LENGTH
    });

    // North
    if (direction === Directions.North) {
      let [coordinateToChange, staticCoordinate] = activeCoordinates;
      let tunneledDistance = 0;

      // Using the correct tunnel length, change all relevant tiles to empty.
      while (coordinateToChange > 0 && tunneledDistance < tunnelLength) {
        coordinateToChange--;
        tunneledDistance++;

        gridWithTunnels[coordinateToChange][
          staticCoordinate
        ] = generateEmptyTile();

        const [neighboringY, neighboringX] = getNeighboringTile(
          gridWithTunnels,
          [coordinateToChange, staticCoordinate]
        );

        gridWithTunnels[neighboringY][neighboringX] = generateEmptyTile();
      }

      activeCoordinates = [coordinateToChange, staticCoordinate];
    }

    // East
    if (direction === Directions.East) {
      let [staticCoordinate, coordinateToChange] = activeCoordinates;
      let tunneledDistance = 0;

      while (
        coordinateToChange < gridWithTunnels[0].length - 1 &&
        tunneledDistance < tunnelLength
      ) {
        coordinateToChange++;
        tunneledDistance++;

        gridWithTunnels[staticCoordinate][
          coordinateToChange
        ] = generateEmptyTile();

        const [neighboringY, neighboringX] = getNeighboringTile(
          gridWithTunnels,
          [staticCoordinate, coordinateToChange]
        );

        gridWithTunnels[neighboringY][neighboringX] = generateEmptyTile();
      }

      activeCoordinates = [staticCoordinate, coordinateToChange];
    }

    // South
    if (direction === Directions.South) {
      let [coordinateToChange, staticCoordinate] = activeCoordinates;
      let tunneledDistance = 0;

      // Using the correct tunnel length, change all relevant tiles to empty.
      while (
        coordinateToChange < gridWithTunnels[0].length - 1 &&
        tunneledDistance < tunnelLength
      ) {
        coordinateToChange++;
        tunneledDistance++;

        gridWithTunnels[coordinateToChange][
          staticCoordinate
        ] = generateEmptyTile();

        const [neighboringY, neighboringX] = getNeighboringTile(
          gridWithTunnels,
          [coordinateToChange, staticCoordinate]
        );

        gridWithTunnels[neighboringY][neighboringX] = generateEmptyTile();
      }

      activeCoordinates = [coordinateToChange, staticCoordinate];
    }

    // West
    if (direction === Directions.West) {
      let [staticCoordinate, coordinateToChange] = activeCoordinates;
      let tunneledDistance = 0;

      while (coordinateToChange > 0 && tunneledDistance < tunnelLength) {
        coordinateToChange--;
        tunneledDistance++;

        gridWithTunnels[staticCoordinate][
          coordinateToChange
        ] = generateEmptyTile();

        const [neighboringY, neighboringX] = getNeighboringTile(
          gridWithTunnels,
          [staticCoordinate, coordinateToChange]
        );

        gridWithTunnels[neighboringY][neighboringX] = generateEmptyTile();
      }

      activeCoordinates = [staticCoordinate, coordinateToChange];
    }

    tunnelsRemaining--;
  } while (tunnelsRemaining);

  if (!atLeastHalfOfGridIsEmpty(gridWithTunnels)) {
    gridWithTunnels = createTunnels(grid, start);
  }

  // Free up a space for the player.
  grid[startY][startX] = generateEmptyTile();

  return gridWithTunnels;
};
