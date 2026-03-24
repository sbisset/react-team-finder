import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTeamMemberships, getInvites } from "../context/AuthApi";
import { Link, Navigate } from "react-router-dom";
import RequestDetail from "../components/RequestDetail";
import { leaveTeam } from "../context/DashboardApi";
import toast from "react-hot-toast";

const STATUS_LABELS = { 1: "Pending", 2: "Accepted", 3: "Rejected" };
const STATUS_COLORS = {
  1: "text-yellow-400",
  2: "text-green-400",
  3: "text-red-400",
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [teams, setTeams] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  /* ---------------- LOAD TEAMS ---------------- */

  const loadTeams = async (showErrorToast = true) => {
    try {
      const memberships = await getTeamMemberships();
      setTeams(memberships);
    } catch (err) {
      if (showErrorToast) {
        toast.error("Failed to load teams");
      }
      if (err?.status === 401) logout();
    }
  };

  useEffect(() => {
    if (!user) return;
    loadTeams(false);
  }, [user]);

  /* ---------------- LOAD DASHBOARD ---------------- */

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getInvites();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  /* ---------------- STEAM CONNECT ---------------- */

  const connectSteam = async () => {
    const toastId = toast.loading("Connecting to Steam...");

    try {
      const res = await fetch("http://localhost:8000/api/auth/steam/connect/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Redirecting to Steam...", { id: toastId });
        window.location.href = "http://localhost:8000/auth/steam/login/steam/";
      } else {
        toast.error("Failed to start Steam connection", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Steam connection failed", { id: toastId });
    }
  };

  /* ---------------- LEAVE TEAM ---------------- */

  const handleLeave = async (id) => {
    const toastId = toast.loading("Leaving team...");

    try {
      await leaveTeam(id);
      await loadTeams(false);
      toast.success("Left team successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave team", { id: toastId });
    }
  };

  /* ---------------- HELPERS ---------------- */

  const combineAndSortRequests = (applications = [], invites = []) => {
    const combined = [
      ...applications.map((item) => ({ ...item, type: "application" })),
      ...invites.map((item) => ({ ...item, type: "invite" })),
    ];

    return combined.sort((a, b) => a.status - b.status);
  };

  const openRequestDetail = (item) => {
    setSelectedRequest({
      id: item.id,
      type:
        item.type === "invite"
          ? item.player
            ? "sent_invites"
            : "received_invites"
          : item.player
            ? "sent_apps"
            : "received_apps",
    });
  };

  const renderRequestCard = (item) => {
    const playerRef = item.player || item.recipient;

    const badgeColor =
      item.type === "invite"
        ? "bg-blue-500/20 text-blue-300"
        : "bg-purple-500/20 text-purple-300";

    const badgeLabel = item.type === "invite" ? "Invite" : "Application";

    return (
      <div
        key={`${item.type}-${item.id}`}
        className="rounded-xl border border-[#2a2718] bg-[#2a2718]/30 p-4 hover:border-red-500/30 hover:bg-[#2a2718]/50 transition"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}
            >
              {badgeLabel}
            </span>

            <p className="mt-2 text-sm font-bold text-white">
              {item.team}
              {playerRef?.user?.username ? ` • ${playerRef.user.username}` : ""}
            </p>

            <p className="mt-1 text-xs text-slate-400">Role: {item.role}</p>
          </div>

          <span className={`text-xs font-semibold ${STATUS_COLORS[item.status]}`}>
            {STATUS_LABELS[item.status]}
          </span>
        </div>

        {playerRef?.preferred_roles?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {playerRef.preferred_roles.map((role, idx) => (
              <span
                key={`${role}-${idx}`}
                className="rounded-md bg-black/30 px-2 py-1 text-[10px] text-slate-300 border border-white/5"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {item.message && (
          <p className="mb-3 text-xs italic text-slate-500">"{item.message}"</p>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="text-[11px] text-slate-500">
            {playerRef?.mmr ? `MMR ${playerRef.mmr}` : "MMR N/A"}
          </div>

          <button
            onClick={() => openRequestDetail(item)}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition"
          >
            View
          </button>
        </div>
      </div>
    );
  };

  /* ---------------- GUARDS ---------------- */

  if (!user) return <Navigate to="/login" replace />;

  if (loading || !dashboardData) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  const player = dashboardData.player;
  const sentRequests = combineAndSortRequests(
    dashboardData.sent_applications,
    dashboardData.sent_invites
  );
  const receivedRequests = combineAndSortRequests(
    dashboardData.received_applications,
    dashboardData.received_invites
  );
  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 1).length;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative flex h-52 items-center overflow-hidden rounded-2xl group">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-black/75 to-transparent" />
        <div className="absolute inset-0 bg-[url('/images/bg.jpg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />

        <div className="relative z-20 w-full px-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-4xl font-black text-white">
              Welcome back,{" "}
              <Link to="/profile">
                <span className="text-red-500 hover:underline">
                  {user.username}
                </span>
              </Link>
            </h1>

            {player?.mmr && (
              <div className="flex items-center gap-2 rounded-xl border border-[#2a2718] bg-[#1c1a12]/90 px-4 py-2 backdrop-blur-sm">
                <span className="text-xs uppercase tracking-wider text-slate-400">
                  MMR
                </span>
                <span className="text-lg font-bold text-red-500">
                  {player.mmr}
                </span>
              </div>
            )}
          </div>

          <p className="mt-2 max-w-lg text-slate-300">
            You have {pendingReceivedCount} pending request
            {pendingReceivedCount === 1 ? "" : "s"} waiting for attention.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {player?.steam_verified ? (
              <span className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-bold text-emerald-400">
                ✔ Verified
              </span>
            ) : (
              <button
                onClick={connectSteam}
                className="rounded-lg border border-[#2a2f3a] bg-[#171a21] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1f2430]"
              >
                🟦 Connect Steam
              </button>
            )}

            <Link
              to="/teams"
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:scale-105"
            >
              Browse Teams
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="col-span-12 space-y-8 xl:col-span-8">
          {/* STATS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard title="Wins" value={player?.wins || "—"} />
            <StatCard title="Losses" value={player?.losses || "—"} />
            <StatCard
              title="Win Rate"
              value={player?.winrate ? `${player.winrate}%` : "—"}
            />
          </div>

          {/* HEROES */}
          {player?.top_heroes?.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Signature Heroes</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {player.top_heroes.slice(0, 4).map((hero, i) => {
                  const winRate =
                    hero.games > 0
                      ? Math.round((hero.wins / hero.games) * 100)
                      : 0;

                  return (
                    <div
                      key={`${hero.name?.localized_name || "hero"}-${i}`}
                      className="group overflow-hidden rounded-xl border border-[#2a2718] bg-[#1c1a12] transition hover:border-red-500/40"
                    >
                      <div className="relative h-28">
                        <img
                          src={hero.icon}
                          alt={hero.name?.localized_name || "Hero"}
                          className="h-full w-full object-cover transition group-hover:grayscale-0"
                        />
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent p-2">
                          <p className="text-xs font-bold text-white">
                            {hero.name?.localized_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between p-3 text-[10px] font-bold">
                        <span className="text-slate-400">{hero.games} games</span>
                        <span className="text-emerald-400">{winRate}% WR</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TEAMS */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">My Teams</h2>

              <Link
                to="/teams/create"
                className="rounded-lg bg-red-600/10 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-600/20"
              >
                + Create Team
              </Link>
            </div>

            {teams.length === 0 ? (
              <p className="text-slate-400">You are not a member of any teams yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="relative overflow-hidden rounded-2xl border border-[#2a2718] bg-[#1c1a12] p-5 transition hover:border-red-500/30"
                  >
                    <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-red-500/5 blur-3xl" />

                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {team.owner_id === user.id ? (
                            <Link
                              to={`/manage/${team.id}`}
                              className="text-red-500 hover:underline"
                            >
                              {team.name}
                            </Link>
                          ) : (
                            <Link
                              to={`/teams/${team.id}`}
                              className="text-red-500 hover:underline"
                            >
                              {team.name}
                            </Link>
                          )}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {team.members.length}/5 members
                        </p>
                      </div>

                      {team.owner_id !== user.id && (
                        <button
                          onClick={() => handleLeave(team.id)}
                          className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500 hover:text-white"
                        >
                          Leave
                        </button>
                      )}
                    </div>

                    <div className="flex -space-x-2">
                      {team.members.map((member) => {
                        const isMe = member.username === user.username;

                        return (
                          <img
                            key={member.id}
                            src="/images/default_player_avatar.png"
                            alt={member.username}
                            className={`h-10 w-10 rounded-full border-2 ${
                              isMe ? "border-red-500" : "border-gray-600"
                            }`}
                          />
                        );
                      })}

                      {team.members.length < 5 &&
                        Array.from({ length: 5 - team.members.length }).map((_, i) => (
                          <div
                            key={i}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-[#1a1813] text-xs text-gray-400"
                          >
                            +
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 space-y-8 xl:col-span-4">
          {/* RECEIVED */}
          <div className="rounded-2xl border border-[#2a2718] bg-[#1c1a12] p-6 shadow-xl">
            <h2 className="mb-6 flex items-center justify-between text-lg font-bold text-white">
              Received Requests
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {receivedRequests.length}
              </span>
            </h2>

            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <p className="text-sm text-slate-400">No received requests.</p>
              ) : (
                receivedRequests.map(renderRequestCard)
              )}
            </div>
          </div>

          {/* SENT */}
          <div className="rounded-2xl border border-[#2a2718] bg-[#1c1a12] p-6 shadow-xl">
            <h2 className="mb-6 flex items-center justify-between text-lg font-bold text-white">
              Sent Requests
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-white">
                {sentRequests.length}
              </span>
            </h2>

            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <p className="text-sm text-slate-400">No sent requests.</p>
              ) : (
                sentRequests.map(renderRequestCard)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedRequest && (
        <RequestDetail
          toggle={() => setSelectedRequest(null)}
          id={selectedRequest.id}
          request={selectedRequest.type}
          onActionSuccess={loadTeams}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="rounded-2xl border border-[#2a2718] bg-[#1c1a12] p-6 transition hover:border-red-500/30">
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
      {title}
    </p>
    <p className="mt-3 text-3xl font-bold text-white">{value}</p>
  </div>
);

export default Dashboard;