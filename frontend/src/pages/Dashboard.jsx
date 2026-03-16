import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTeamMemberships, getInvites } from "../context/AuthApi";
import { Link, Navigate } from "react-router-dom";
import RequestDetail from "../components/RequestDetail";
import { leaveTeam } from "../context/DashboardApi";

const STATUS_LABELS = { 1: "Pending", 2: "Accepted", 3: "Rejected" };
const STATUS_COLORS = { 1: "text-yellow-400", 2: "text-green-400", 3: "text-red-400" };

const Dashboard = () => {

  const { user, logout } = useAuth();

  const [teams, setTeams] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  /* ---------------------------
     LOAD TEAMS
  ---------------------------- */

  const loadTeams = async () => {
    try {
      const memberships = await getTeamMemberships();
      setTeams(memberships);
      
    } catch (err) {
      if (err?.status === 401) logout();
    }
  };

  useEffect(() => {
    if (!user) return;
    loadTeams();
    
  }, [user]);

  /* ---------------------------
     LOAD REQUEST DATA
  ---------------------------- */

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getInvites();
        setDashboardData(data);
        console.log(teams)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  /* ---------------------------
     LEAVE TEAM
  ---------------------------- */

  const handleLeave = async (id) => {
    try {
      await leaveTeam(id);
      await loadTeams();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------------------
     PROTECTION
  ---------------------------- */

  if (!user) return <Navigate to="/login" replace />;
  if (loading || !dashboardData) return <div>Loading dashboard...</div>;

  /* ---------------------------
     COMBINE REQUESTS
  ---------------------------- */

  const combineAndSortRequests = (applications, invites) => {

    const combined = [
      ...applications.map(item => ({ ...item, type: "application" })),
      ...invites.map(item => ({ ...item, type: "invite" })),
    ];

    return combined.sort((a, b) => a.status - b.status);
  };

  /* ---------------------------
     REQUEST CARD
  ---------------------------- */

  const renderCard = (item) => {

    const player = item.player || item.recipient;

    const badgeColor = item.type === "invite"
      ? "bg-blue-500"
      : "bg-purple-500";

    const badgeIcon = item.type === "invite"
      ? "✉"
      : "📝";

    const pendingHighlight =
      item.status === 1
        ? "border-yellow-400/40 shadow-md"
        : "";
    
    return (

      <div
        key={item.id}
        className={`border border-[var(--color-accent-dark)] rounded-xl p-4 mb-4 hover:bg-black/20 transition group relative ${pendingHighlight}`}
      >

        {/* TYPE BADGE */}

        <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor} text-white mb-2`}>
          <span>{badgeIcon}</span>
          <span>{item.type === "invite" ? "Invite" : "Application"}</span>
        </div>

        {/* HEADER */}

        <div className="flex justify-between mb-2">
          <p className="font-semibold">
            {item.team}
            {player?.user?.username
              ? ` | ${player.user.username}`
              : ""}
          </p>

          <span className={`text-xs ${STATUS_COLORS[item.status]}`}>
            {STATUS_LABELS[item.status]}
          </span>
        </div>

        <p className="text-sm text-gray-400">
          Role: {item.role}
        </p>

        {/* PLAYER ROLES */}

        {player?.preferred_roles?.length > 0 && (

          <div className="flex flex-wrap gap-1 mt-1">
            {player.preferred_roles.map((r, idx) => (

              <span
                key={idx}
                className="text-xs bg-gray-700 px-2 py-0.5 rounded"
              >
                {r}
              </span>

            ))}
          </div>

        )}

        {/* MESSAGE */}

        {item.message && (

          <p className="text-sm text-gray-500 italic mt-1">
            "{item.message}"
          </p>

        )}

        {/* TOOLTIP */}

        <div className="absolute top-2 right-2 bg-gray-900 text-gray-200 text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 w-48">

          {player?.persona && <p>Persona: {player.persona}</p>}
          <p>MMR: {player?.mmr ?? "N/A"}</p>
          {player?.bio && <p>Bio: {player.bio}</p>}

        </div>

        {/* VIEW BUTTON */}

        <div className="flex justify-end mt-3">

          <button
            className="btn-primary text-sm"
            onClick={() =>
              setSelectedRequest({
                id: item.id,
                type:
                  item.type === "invite"
                    ? (item.player ? "sent_invites" : "received_invites")
                    : (item.player ? "sent_apps" : "received_apps")
              })
            }
          >
            View
          </button>

        </div>

      </div>

    );
  };

  /* ---------------------------
     RENDER
  ---------------------------- */

  return (

    <div className="space-y-10">

      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-black mb-1">
          Welcome back{" "}
          <Link
            to="/profile"
            className="text-[var(--color-primary)] hover:underline"
          >
            {user.username}
          </Link>
        </h1>

        <p className="text-gray-400 text-sm">
          Manage your teams, invitations, and applications.
        </p>

      </div>

      {/* TEAMS */}

      <div>

        <h2 className="text-xl font-bold mb-4">
          My Teams
        </h2>

        {teams.length === 0 && (
          <p className="text-gray-400">
            You are not a member of any teams yet.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* CREATE TEAM CARD */}

          <Link
            to="/teams/create"
            className="ui-card flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-600 hover:border-[var(--color-primary)] hover:bg-black/20 transition cursor-pointer"
          >

            <div className="text-4xl mb-2 text-[var(--color-primary)]">
              +
            </div>

            <p className="font-semibold">
              Create New Team
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Recruit players and start competing
            </p>

          </Link>

          {/* TEAM CARDS */}

          {teams.map(team => (

            <div
              key={team.id}
              className="ui-card"
            >

              <div className="flex justify-between items-start mb-4">

                <h3 className="font-bold text-lg">

                  {team.owner_id === user.id ? (

                    <Link
                      to={`/manage/${team.id}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {team.name}
                    </Link>

                  ) : team.name}

                </h3>

                {team.owner_id !== user.id && (

                  <button
                    onClick={() => handleLeave(team.id)}
                    className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
                  >
                    Leave
                  </button>

                )}

              </div>

              {/* TEAM MEMBERS */}

              <div className="flex -space-x-2">

                {team.members.map(member => {

                  const isMe = member.username === user.username;

                  return (

                    <img
                      key={member.id}
                      src="/images/default_player_avatar.png"
                      alt={member.username}
                      className={`w-10 h-10 rounded-full border-2 ${
                        isMe
                          ? "border-[var(--color-primary)]"
                          : "border-gray-600"
                      }`}
                    />

                  );

                })}

                {team.members.length < 5 &&
                  Array.from({
                    length: 5 - team.members.length
                  }).map((_, i) => (

                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border border-gray-700 bg-[#1a1813] flex items-center justify-center text-xs text-gray-400"
                    >
                      +
                    </div>

                  ))}

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* REQUESTS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <div className="ui-card">

          <h3 className="text-xl font-bold mb-5">
            Sent Requests
          </h3>

          {combineAndSortRequests(
            dashboardData.sent_applications,
            dashboardData.sent_invites
          ).map(renderCard)}

        </div>

        <div className="ui-card">

          <h3 className="text-xl font-bold mb-5">
            Received Requests
          </h3>

          {combineAndSortRequests(
            dashboardData.received_applications,
            dashboardData.received_invites
          ).map(renderCard)}

        </div>

      </div>

      {/* REQUEST MODAL */}

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

export default Dashboard;