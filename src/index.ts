import clamp from "lodash.clamp";
import cloneDeep from "lodash.clonedeep";

/* === Types */

type Grid = Tile[][];

type GridDimensions = [number, number];

enum TileTypes {
  Empty = 0,
  Wall = 1
}

interface Tile {
  type: TileTypes;
}

interface GameState {
  active: boolean;
  ticks: number;
  grid: Grid;
  playerCoordinates: _Coordinates;
}

type _Coordinates = [number, number];

enum PlayerActions {
  Move = 0
}

interface PlayerMoved {
  type: PlayerActions.Move;
  payload: { direction: Directions };
}

type GameAction = PlayerMoved;

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

const generateNewGame = (): GameState => ({
  active: true,
  ticks: 0,
  grid: generateEmptyGrid(3, 3),
  playerCoordinates: [0, 0]
});

const directionDifferences = {
  [Directions.North]: [-1, 0],
  [Directions.East]: [0, 1],
  [Directions.South]: [1, 0],
  [Directions.West]: [0, -1]
};

const generateNextCoordinates = (
  coordinates: _Coordinates,
  direction: Directions,
  dimensions: GridDimensions
): _Coordinates => {
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

// Reducer
const initialState: GameState = generateNewGame();

const reducers = {
  [PlayerActions.Move]: (state: GameState, action: GameAction): GameState => {
    const { grid, playerCoordinates } = state;
    const {
      payload: { direction }
    } = action;
    const nextState = cloneDeep(state);
    const dimensions: GridDimensions = [grid.length, grid[0].length];
    const [y, x] = generateNextCoordinates(
      playerCoordinates,
      direction,
      dimensions
    );

    nextState.playerCoordinates = [y, x];

    return nextState;
  }
};

const reduce = (
  state: GameState = initialState,
  action: GameAction
): GameState => {
  const nextState = reducers[action.type];
  return nextState ? nextState(state, action) : state;
};
// Selectors

//#endregion

//#region Game
const initializeGame = (): void => {
  let activeState = generateNewGame();

  const updateActiveState = (action: GameAction): void => {
    activeState = reduce(activeState, action);
  };

  console.log("\n\n\n", "before", activeState.playerCoordinates, "\n\n\n");
  updateActiveState(playerMovedEast());
  console.log("\n\n\n", "after", activeState.playerCoordinates, "\n\n\n");
};
//#endregion

/* === Script */

initializeGame();
