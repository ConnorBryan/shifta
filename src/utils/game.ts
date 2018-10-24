import Chance from "chance";
import generateUuid from "uuid/v4";
import difference from "lodash.difference";

import {
  generateEmptyGrid,
  getGridDimensions,
  getRandomEntry,
  selectAvailableCoordinates
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
        layout: generateEmptyGrid(5, 5)
      };
      const [planeKeyY, planeKeyX] = selectAvailableCoordinates(
        next === PlaneType.Mortal ? [playerCoordinates] : [],
        getGridDimensions(gridData.layout)
      );
      const planeKey = getRandomEntry(difference(availablePlaneKeys, [next]));

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
    [5, 5]
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
