import cloneDeep from "lodash.clonedeep";

import {
  getGridDimensions,
  generateNextCoordinates,
  TileType
} from "../../utils";
import { getActiveGridLayout, getPlayerCoordinates } from "../selectors";
import { PlayerActions } from "./types";

export default {
  [PlayerActions.Move]: (state: GameState, action: GameAction): GameState => {
    const playerCoordinates = getPlayerCoordinates(state);
    const grid = getActiveGridLayout(state);
    const {
      payload: { direction }
    } = action;
    const nextState = cloneDeep(state);
    const dimensions = getGridDimensions(grid);

    let [y, x] = generateNextCoordinates(
      playerCoordinates,
      direction,
      dimensions
    );

    if (grid[y][x].type !== TileType.Empty) {
      return state;
    }

    nextState.playerCoordinates = [y, x];

    return nextState;
  }
};
