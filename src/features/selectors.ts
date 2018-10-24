export const getEnemyData = ({ enemiesById, allEnemies }: GameState) => ({
  enemiesById,
  allEnemies
});

export const getGridData = ({
  gridsById,
  allGrids,
  activeGrid
}: GameState) => ({
  gridsById,
  allGrids,
  activeGrid
});

export const getActiveGridLayout = (state: GameState): Grid => {
  const { gridsById, activeGrid } = getGridData(state);
  return gridsById[activeGrid].layout;
};
