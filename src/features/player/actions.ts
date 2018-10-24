import { Directions } from "../../utils";
import { PlayerActions } from "./types";

export const playerMoved = (direction: Directions) => ({
  type: PlayerActions.Move,
  payload: {
    direction
  }
});

export const playerMovedNorth = () => playerMoved(Directions.North);
export const playerMovedEast = () => playerMoved(Directions.East);
export const playerMovedSouth = () => playerMoved(Directions.South);
export const playerMovedWest = () => playerMoved(Directions.West);
