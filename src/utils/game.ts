import Chance from "chance";
import generateUuid from "uuid/v4";
import difference from "lodash.difference";

import * as config from "../config";
import reducer, {
  getActiveGridLayout,
  getPlayerCoordinates,
  playerMovedNorth,
  playerMovedEast,
  playerMovedSouth,
  playerMovedWest
} from "../features";
import { outputGameToFile, drawAsciiGrid } from "./etc";
import {
  generateInitialGrid,
  getGridDimensions,
  getRandomEntry,
  selectAvailableCoordinates,
  createTunnels
} from "./grid";

const chance = new Chance();

export enum PlaneType {
  Mortal = 0,
  Fire = 1,
  Water = 2,
  Earth = 3,
  Wind = 4
}

export enum EnemyType {
  Sentinel = 0
}

export const allPlanes: PlaneType[] = [
  PlaneType.Mortal,
  PlaneType.Fire,
  PlaneType.Water,
  PlaneType.Earth,
  PlaneType.Wind
];

export const generateEnemy = (coordinates: GridCoordinates): Enemy => ({
  id: generateUuid(),
  type: EnemyType.Sentinel,
  coordinates
});

export const generateGrids = (
  playerCoordinates: GridCoordinates
): GridInformation => {
  const planes = [PlaneType.Mortal];
  const nonMortalPlanes = chance.shuffle(difference(allPlanes, planes));
  let availablePlaneKeys = [...allPlanes];

  planes.push(...nonMortalPlanes);

  const { gridsById, allGrids, activeGrid } = planes.reduce(
    (prev: GridInformation, next) => {
      const gridData = {
        id: generateUuid(),
        type: next,
        layout: generateInitialGrid(
          config.GRID_ROW_SIZE,
          config.GRID_COLUMN_SIZE
        )
      };
      const [planeKeyY, planeKeyX] = selectAvailableCoordinates(
        next === PlaneType.Mortal ? [playerCoordinates] : [],
        getGridDimensions(gridData.layout)
      );
      const planeKey = getRandomEntry(difference(availablePlaneKeys, [next]));
      const layoutWithTunnels = createTunnels(
        gridData.layout,
        playerCoordinates
      );

      gridData.layout = layoutWithTunnels;
      availablePlaneKeys = availablePlaneKeys.filter(key => key !== planeKey);
      gridData.layout[planeKeyY][planeKeyX].planeKey = planeKey;

      // Add the grid data.
      prev.gridsById[gridData.id] = gridData;
      prev.allGrids.push(gridData.id);

      if (next === PlaneType.Mortal) {
        prev.activeGrid = gridData.id;
      }

      return prev;
    },
    {
      gridsById: {},
      allGrids: [],
      activeGrid: ""
    }
  );

  return { gridsById, allGrids, activeGrid };
};

export const generateNewGame = (): GameState => {
  const [initialPlayerY, initialPlayerX] = selectAvailableCoordinates(
    [],
    [config.GRID_ROW_SIZE, config.GRID_COLUMN_SIZE]
  );

  const { gridsById, allGrids, activeGrid } = generateGrids([
    initialPlayerY,
    initialPlayerX
  ]);

  return {
    active: true,
    ticks: 0,
    playerCoordinates: [initialPlayerY, initialPlayerX],
    enemiesById: {},
    allEnemies: [],
    gridsById,
    allGrids,
    activeGrid
  };
};

export const initializeGame = (): Promise<void> => {
  let activeState = generateNewGame();

  const updateActiveState = (action: GameAction): void => {
    activeState = reducer(activeState, action);
  };

  let times = 0;

  return new Promise(resolve => {
    setInterval(() => {
      const movements = [
        playerMovedNorth(),
        playerMovedEast(),
        playerMovedSouth(),
        playerMovedWest()
      ];
      const movement = getRandomEntry(movements);

      updateActiveState(movement);

      const layout = getActiveGridLayout(activeState);
      const playerCoordinates = getPlayerCoordinates(activeState);

      outputGameToFile(activeState);
      drawAsciiGrid(layout, playerCoordinates);

      times++;

      if (times === 20) {
        resolve();
      }
    }, 200);
  });
};
