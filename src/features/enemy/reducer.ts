import cloneDeep from "lodash.clonedeep";

import {
  getGridDimensions,
  selectAvailableCoordinates,
  generateEnemy
} from "../../utils";
import { getActiveGridLayout, getEnemyData } from "../selectors";
import { EnemyActions } from "./types";

export default {
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
