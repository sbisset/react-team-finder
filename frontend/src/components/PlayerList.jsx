import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { getPlayerList } from "../context/Api";
import PlayerCard from "./PlayerCard";

const PlayerList = ({ FILTERS }) => {
  const { user } = useAuth();

  const [players, setPlayers] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState(FILTERS);

  const observer = useRef();

  //  Debounce filters
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(FILTERS);
    }, 400);

    return () => clearTimeout(timeout);
  }, [FILTERS]);

  //  Load first page
  const loadFirstPage = async () => {
    setLoading(true);

    const data = await getPlayerList(debouncedFilters);

    setPlayers(data.results || []);
    setNextUrl(data.next);
    setLoading(false);
  };

  //  Load more
  const loadMore = async () => {
    if (!nextUrl || loading) return;

    setLoading(true);

    const data = await getPlayerList({}, nextUrl);

    setPlayers(prev => [...prev, ...data.results]);
    setNextUrl(data.next);
    setLoading(false);
  };

  //  Reload when filters change
  useEffect(() => {
    setPlayers([]);
    setNextUrl(null);
    loadFirstPage();
  }, [debouncedFilters]);

  //  Intersection observer to trigger load more
  const lastPlayerRef = useCallback(
    node => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && nextUrl) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, nextUrl]
  );

  if (!players.length && loading) return <h2>Loading players...</h2>;

  return (
    <>
      {players.map((player, index) => {
        if (index === players.length - 1) {
          return (
            <div ref={lastPlayerRef} key={player.id}>
              <PlayerCard player={player} />
            </div>
          );
        }

        return <PlayerCard key={player.id} player={player} />;
      })}

      {loading && <p className="text-center py-4">Loading more...</p>}
    </>
  );
};

export default PlayerList;
