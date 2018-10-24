import cloneDeep from "lodash.clonedeep";

import { getGridDimensions, generateNextCoordinates } from "../../utils";
import { getActiveGridLayout } from "../selectors";
import { PlayerActions } from "./types";

export default {
  [PlayerActions.Move]: (state: GameState, action: GameAction): GameState => {
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
  }
};
