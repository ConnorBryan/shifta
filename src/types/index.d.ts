declare type Grid = Tile[][];

declare type GridDimensions = [number, number];

declare interface GridInformation {
  gridsById: {
    [id: string]: GridData;
  };
  allGrids: string[];
  activeGrid: string;
}

declare interface GridData {
  id: string;
  type: PlaneType;
  layout: Grid;
}

declare interface Tile {
  type: TileType;
  planeKey: PlaneType | null;
}

declare interface Enemy {
  id: string;
  type: EnemyType;
  coordinates: GridCoordinates;
}

declare interface GameState extends GridInformation {
  active: boolean;
  ticks: number;
  playerCoordinates: GridCoordinates;
  enemiesById: {
    [id: string]: Enemy;
  };
  allEnemies: string[];
}

declare type GridCoordinates = [number, number];

declare interface OccupiedCoordinatesHash {
  [coordinates: string]: true;
}

declare interface PlayerMoved {
  type: PlayerActions.Move;
  payload: { direction: Directions };
}

declare type PlayerAction = PlayerMoved;

declare interface EnemyGenerated {
  type: EnemyActions.Generate;
}

declare type EnemyAction = EnemyGenerated;

declare type GameAction = PlayerAction | EnemyAction;
