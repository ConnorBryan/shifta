import cloneDeep from "lodash.clonedeep";
import generateUuid from "uuid/v4";
import Chance from "chance";

import {
  getRandomEntry,
  generateEmptyGrid,
  getGridDimensions,
  generateRandomCoordinates,
  selectAvailableCoordinates,
  generateNextCoordinates,
  generateEnemy,
  generateNewGame,
  outputGameToFile
} from "./utils";

const chance = new Chance();

/* === Logic */
export enum EnemyActions {
  Generate = 0
}

export enum PlayerActions {
  Move = 0
}

export enum Directions {
  North = 0,
  East = 1,
  South = 2,
  West = 3
}

// Actions
const playerMoved = (direction: Directions) => ({
  type: PlayerActions.Move,
  payload: {
    direction
  }
});

const playerMovedNorth = () => playerMoved(Directions.North);
const playerMovedEast = () => playerMoved(Directions.East);
const playerMovedSouth = () => playerMoved(Directions.South);
const playerMovedWest = () => playerMoved(Directions.West);

const enemyGenerated = () => ({
  type: EnemyActions.Generate
});

// Reducer
const reducer = (state: GameState, action: GameAction): GameState => {
  const nextState = ({
    [PlayerActions.Move]: (
      state: GameState,
      action: PlayerMoved
    ): GameState => {
      const { playerCoordinates } = state;
      const grid = getActiveGridLayout(state);
      const {
        payload: { direction }
      } = action;
      const nextState = cloneDeep(state);
      const dimensions = getGridDimensions(grid);
      const [y, x] = generateNextCoordinates(
        playerCoordinates,
        direction,
        dimensions
      );

      nextState.playerCoordinates = [y, x];

      return nextState;
    },
    [EnemyActions.Generate]: (
      state: GameState,
      action: EnemyGenerated
    ): GameState => {
      const { playerCoordinates } = state;
      const grid = getActiveGridLayout(state);
      const { enemiesById, allEnemies } = getEnemyData(state);
      const nextState = cloneDeep(state);
      const offLimitCoordinates = allEnemies
        .map(id => enemiesById[id].coordinates)
        .concat(playerCoordinates);
      const gridDimensions = getGridDimensions(grid);
      const enemyCoordinates = selectAvailableCoordinates(
        offLimitCoordinates,
        gridDimensions
      );
      const enemy = generateEnemy(enemyCoordinates);

      nextState.enemiesById[enemy.id] = enemy;
      nextState.allEnemies.push(enemy.id);

      return nextState;
    }
  } as {
    [action: string]: (state: GameState, action: GameAction) => GameState;
  })[action.type];

  return nextState ? nextState(state, action) : state;
};
// Selectors
const getEnemyData = ({ enemiesById, allEnemies }: GameState) => ({
  enemiesById,
  allEnemies
});

const getGridData = ({ gridsById, allGrids, activeGrid }: GameState) => ({
  gridsById,
  allGrids,
  activeGrid
});

const getActiveGridLayout = (state: GameState): Grid => {
  const { gridsById, activeGrid } = getGridData(state);
  return gridsById[activeGrid].layout;
};
//#endregion

//#region Game
const initializeGame = (): void => {
  let activeState = generateNewGame();

  const updateActiveState = (action: GameAction): void => {
    activeState = reducer(activeState, action);
  };

  outputGameToFile(activeState);

  console.info("Done.");
};
//#endregion

/* === Script */

initializeGame();
