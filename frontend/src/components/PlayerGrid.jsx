import PlayerList from "./PlayerList";

const PlayerGrid = ({ filters }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <PlayerList FILTERS={filters} />
    </div>
  );
};

export default PlayerGrid;