import clamp from "lodash.clamp";
import cloneDeep from "lodash.clonedeep";
import generateUuid from "uuid/v4";
import Chance from "chance";

const chance = new Chance();

/* === Types */

type Grid = Tile[][];

type GridDimensions = [number, number];

interface GridData {
  id: string;
  layout: Grid;
}

enum TileTypes {
  Empty = 0,
  Wall = 1
}

interface Tile {
  type: TileTypes;
}

enum EnemyTypes {
  Sentinel = 0
}

interface Enemy {
  id: string;
  type: EnemyTypes;
  coordinates: GridCoordinates;
}

interface GameState {
  active: boolean;
  ticks: number;
  playerCoordinates: GridCoordinates;
  enemiesById: {
    [id: string]: Enemy;
  };
  allEnemies: string[];
  gridsById: {
    [id: string]: GridData;
  };
  allGrids: string[];
  activeGrid: string;
}

type GridCoordinates = [number, number];

interface OccupiedCoordinatesHash {
  [coordinates: string]: true;
}

enum PlayerActions {
  Move = 0
}

interface PlayerMoved {
  type: PlayerActions.Move;
  payload: { direction: Directions };
}

type PlayerAction = PlayerMoved;

enum EnemyActions {
  Generate = 0
}

interface EnemyGenerated {
  type: EnemyActions.Generate;
}

type EnemyAction = EnemyGenerated;

type GameAction = PlayerAction | EnemyAction;

enum Directions {
  North = 0,
  East = 1,
  South = 2,
  West = 3
}

/* === Logic */

//#region Utils
const generateEmptyTile = (): Tile => ({
  type: TileTypes.Empty
});

const generateEmptyGrid = (rows: number, columns: number): Grid =>
  Array.from({ length: rows }, () =>
    Array.from({ length: columns }, generateEmptyTile)
  );

const getGridDimensions = (grid: Grid): GridDimensions => [
  grid.length,
  grid[0].length
];

const generateRandomCoordinates = (
  gridDimensions: GridDimensions
): GridCoordinates => {
  const [yMax, xMax] = gridDimensions;
  return [
    chance.integer({ min: 0, max: yMax - 1 }),
    chance.integer({ min: 0, max: xMax - 1 })
  ];
};

const selectAvailableCoordinates = (
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

const generateEnemy = (coordinates: GridCoordinates): Enemy => ({
  id: generateUuid(),
  type: EnemyTypes.Sentinel,
  coordinates
});

const generateNewGame = (): GameState => {
  const initialGridId = generateUuid();
  const initialGrid: GridData = {
    id: initialGridId,
    layout: generateEmptyGrid(5, 5)
  };

  return {
    active: true,
    ticks: 0,
    playerCoordinates: [0, 0],
    enemiesById: {},
    allEnemies: [],
    gridsById: {
      [initialGridId]: initialGrid
    },
    allGrids: [initialGridId],
    activeGrid: initialGridId
  };
};

const directionDifferences = {
  [Directions.North]: [-1, 0],
  [Directions.East]: [0, 1],
  [Directions.South]: [1, 0],
  [Directions.West]: [0, -1]
};

const generateNextCoordinates = (
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
//#endregion

//#region Reducer

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
const initialState: GameState = generateNewGame();

const reducers = {
  [PlayerActions.Move]: (state: GameState, action: PlayerMoved): GameState => {
    const { playerCoordinates } = state;
    const grid = getActiveGridLayout(state);
    const {
      payload: { direction }
    } = action;
    const nextState = cloneDeep(state);
    const dimensions: GridDimensions = getGridDimensions(grid);
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
};

const reduce = (
  state: GameState = initialState,
  action: GameAction
): GameState => {
  const nextState = (reducers as any)[action.type];
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
    activeState = reduce(activeState, action);
  };

  console.log(
    "\n\n\n",
    "activeState.gridsById[activeState.activeGrid]",
    activeState.gridsById[activeState.activeGrid],
    "\n\n\n"
  );
};
//#endregion

/* === Script */

initializeGame();
