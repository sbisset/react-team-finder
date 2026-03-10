import { useState, useEffect, useRef, useCallback } from "react";
import { getTeamList } from "../context/Api";
import { Link } from "react-router-dom";

const TeamList = ({ FILTERS }) => {
  const [teams, setTeams] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState(FILTERS);

  const observer = useRef();

  /* ------------------ Debounce Filters ------------------ */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(FILTERS);
    }, 400);

    return () => clearTimeout(timeout);
  }, [FILTERS]);

  /* ------------------ Load First Page ------------------ */
  useEffect(() => {
    loadFirstPage();
  }, [debouncedFilters]);

  const loadFirstPage = async () => {
    setLoading(true);
    const data = await getTeamList(debouncedFilters);
    setTeams(data.results);
    setNextUrl(data.next);
    setLoading(false);
  };

  /* ------------------ Load More (Infinite Scroll) ------------------ */
  const loadMore = async () => {
    if (!nextUrl || loading) return;

    setLoading(true);
    const data = await getTeamList({}, nextUrl);
    setTeams((prev) => [...prev, ...data.results]);
    setNextUrl(data.next);
    setLoading(false);
  };

  const lastTeamRef = useCallback(
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

  /* ------------------ Loading State ------------------ */
  if (!teams.length && loading) {
    return (
      <div className="text-center py-20 text-slate-400 text-lg">
        Loading teams...
      </div>
    );
  }

  /* ------------------ UI ------------------ */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {teams.map((team, index) => {
        const isLast = index === teams.length - 1;

        const avgMmr =
          team.memberships?.length > 0
            ? Math.round(
                team.memberships.reduce(
                  (acc, m) => acc + (m.player?.mmr ?? 0),
                  0
                ) / team.memberships.length
              )
            : null;

        const filledRoles = [
          ...new Set(
            team.memberships?.map((m) => m.role).filter(Boolean)
          ),
        ];

        return (
          <div
            key={team.id}
            ref={isLast ? lastTeamRef : null}
            className="bg-card-dark border border-border-dark rounded-xl overflow-hidden hover:border-primary/40 transition"
          >
            {/* Top Section */}
            <div className="p-6 flex justify-between items-start">

              {/* Logo + Info */}
              <div className="flex gap-4">

                {/* Logo */}
                <div className="w-16 h-16 bg-background-dark border border-border-dark rounded-lg overflow-hidden flex items-center justify-center">
                  {team.image ? (
                    <img
                      src="/images/default_team_logo.png"
                      alt={team.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-500 font-bold text-sm">
                      {team.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Name + Roles */}
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {team.name}
                  </h3>

                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    Lineup
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {filledRoles.length > 0 ? (
                      filledRoles.map((role) => (
                        <span
                          key={role}
                          className="px-3 py-1 bg-slate-800 border border-border-dark rounded-md text-xs"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs">
                        No roles filled
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* MMR Badge */}
              <span className="bg-red-900/40 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                {avgMmr ?? "N/A"} MMR
              </span>

            </div>

            {/* Bottom Buttons */}
           <div className="grid grid-cols-2 border-t border-border-dark">
             <Link to={`/teams/${team.id}`}> <button className="py-3 text-sm font-medium text-white hover:bg-slate-800 transition">
                View Team
              </button></Link> 

              <button
                disabled={!team.looking_for_members}
                className={`py-3 text-sm font-bold transition ${
                  team.looking_for_members
                    ? "bg-primary text-white hover:bg-red-700"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                {team.looking_for_members ? "Apply" : "Not Recruiting"}
              </button>
            </div>
          </div>
        );
      })}

      {/* Loading More */}
      {loading && teams.length > 0 && (
        <div className="col-span-full text-center py-6 text-slate-500 text-sm">
          Loading more teams...
        </div>
      )}
    </div>
  );
};

export default TeamList;