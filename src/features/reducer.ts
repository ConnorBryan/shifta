import enemy from "./enemy/reducer";
import player from "./player/reducer";

export const reducer: GameReducer = {
  ...enemy,
  ...player
};

export default function(state: GameState, action: GameAction): GameState {
  const nextState = reducer[action.type];

  return nextState ? nextState(state, action) : state;
}
