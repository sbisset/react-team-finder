import { useState, useEffect, useRef, useCallback } from "react";
import { getTeamList } from "../context/Api";
import { Link } from "react-router-dom";
import TeamApplicationPop from "../components/TeamApplicationPop";
import toast from "react-hot-toast";

const ALL_ROLES = [
  "Carry",
  "Mid",
  "Offlane",
  "Support",
  "Hard Support",
];

const roleIcons = {
  Carry: "🗡️",
  Mid: "🔥",
  Offlane: "🛡️",
  Support: "✨",
  "Hard Support": "💎",
};

const TeamList = ({ FILTERS }) => {
  const [teams, setTeams] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState(FILTERS);
  const [seenTeams, setSeenTeams] = useState({});

  const observer = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(FILTERS);
    }, 400);

    return () => clearTimeout(timeout);
  }, [FILTERS]);

  useEffect(() => {
    loadFirstPage();
  }, [debouncedFilters]);

  const loadFirstPage = async () => {
    try {
      setLoading(true);
      const data = await getTeamList(debouncedFilters);
      setTeams(data.results);
      setNextUrl(data.next);
    } catch (err) {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextUrl || loading) return;

    try {
      setLoading(true);
      const data = await getTeamList({}, nextUrl);
      setTeams((prev) => [...prev, ...data.results]);
      setNextUrl(data.next);
    } catch (err) {
      toast.error("Failed to load more teams");
    } finally {
      setLoading(false);
    }
  };

  const togglePop = (teamId) => {
    setSeenTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
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

  if (!teams.length && loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-lg">
        Loading teams...
      </div>
    );
  }

  const getTeamTier = (avgMmr) => {
    if (!avgMmr) return "OPEN";
    if (avgMmr >= 8000) return "PRO";
    if (avgMmr >= 6000) return "SEMI-PRO";
    if (avgMmr >= 4000) return "AMATEUR";
    return "OPEN";
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
            ...new Set(team.memberships?.map((m) => m.role).filter(Boolean)),
          ];

          const missingRoles = ALL_ROLES.filter(
            (role) => !filledRoles.includes(role)
          );

          const tier = getTeamTier(avgMmr);

          return (
            <div
              key={team.id}
              ref={isLast ? lastTeamRef : null}
              className="group overflow-hidden rounded-2xl border border-red-500/10 bg-red-500/[0.04] transition duration-300 hover:-translate-y-1 hover:border-red-500/30"
            >
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-red-500/20 via-[#1a120d] to-[#0f0d08]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_35%),linear-gradient(to_bottom_right,rgba(255,255,255,0.02),transparent)]" />
                <div className="absolute inset-0 opacity-40 bg-[linear-gradient(120deg,transparent,rgba(239,68,68,0.08),transparent)]" />

                <div className="absolute -bottom-6 left-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-[#120f0b] bg-[#1a1510] shadow-xl overflow-hidden">
                    {team.image ? (
                      <img
                        src="/images/default_team_logo.png"
                        alt={team.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-300">
                        {team.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-10">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {team.name}
                  </h3>

                  <span className="rounded bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                    {tier}
                  </span>
                </div>

                <p className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                  <span>↗</span>
                  Avg MMR:{" "}
                  <span className="font-semibold text-white">
                    {avgMmr ?? "N/A"}
                  </span>
                </p>

                <div className="mb-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Looking For
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {missingRoles.length > 0 ? (
                      missingRoles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 rounded-full border border-red-500/15 bg-[#18130d] px-3 py-1 text-xs font-medium text-slate-300"
                        >
                          <span>{roleIcons[role] || "•"}</span>
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No open roles
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/teams/${team.id}`}>
                    <button className="w-full rounded-xl border border-red-500/15 bg-[#18130d] py-3 text-sm font-semibold text-white transition hover:border-red-500/40">
                      View Team
                    </button>
                  </Link>

                  {team.looking_for_members ? (
                    <div className="relative">
                      <button
                        onClick={() => togglePop(team.id)}
                        className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:brightness-110"
                      >
                        Apply
                      </button>

                      {seenTeams[team.id] && (
                        <TeamApplicationPop
                          toggle={() => togglePop(team.id)}
                          teamId={team.id}
                        />
                      )}
                    </div>
                  ) : (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-500"
                    >
                      Full
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && teams.length > 0 && (
        <div className="col-span-full py-8 text-center text-sm text-slate-500">
          Loading more teams...
        </div>
      )}
    </div>
  );
};

export default TeamList;