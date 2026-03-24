import { useState, useEffect, useRef, useCallback } from "react";
import { getPlayerList } from "../context/Api";
import PlayerCard from "./PlayerCard";
import toast from "react-hot-toast";

const PlayerList = ({ FILTERS }) => {
  const [players, setPlayers] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState(FILTERS);

  const observer = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(FILTERS);
    }, 400);

    return () => clearTimeout(timeout);
  }, [FILTERS]);

  const loadFirstPage = async () => {
    try {
      setLoading(true);
      const data = await getPlayerList(debouncedFilters);
      setPlayers(data.results || []);
      setNextUrl(data.next);
    } catch (err) {
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextUrl || loading) return;

    try {
      setLoading(true);
      const data = await getPlayerList({}, nextUrl);
      setPlayers((prev) => [...prev, ...data.results]);
      setNextUrl(data.next);
    } catch (err) {
      toast.error("Failed to load more players");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPlayers([]);
    setNextUrl(null);
    loadFirstPage();
  }, [debouncedFilters]);

  const lastPlayerRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextUrl) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, nextUrl]
  );

  if (!players.length && loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-lg">
        Loading players...
      </div>
    );
  }

  if (!players.length && !loading) {
    return (
      <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.04] p-10 text-center text-slate-400">
        No players found with the current filters.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {players.map((player, index) => {
          const isLast = index === players.length - 1;

          if (isLast) {
            return (
              <div ref={lastPlayerRef} key={player.id}>
                <PlayerCard player={player} />
              </div>
            );
          }

          return <PlayerCard key={player.id} player={player} />;
        })}
      </div>

      {loading && players.length > 0 && (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading more players...
        </div>
      )}
    </div>
  );
};

export default PlayerList;