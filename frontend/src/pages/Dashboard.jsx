import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTeamMemberships, getInvites } from "../context/AuthApi";
import { Link, Navigate } from "react-router-dom";
import RequestDetail from "../components/RequestDetail";

const STATUS_LABELS = {
  1: "Pending",
  2: "Accepted",
  3: "Rejected",
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Function to load teams (can be called after accepting invites)
  const loadTeams = async () => {
    try {
      const memberships = await getTeamMemberships();
      setTeams(memberships);
    } catch (err) {
      if (err?.status === 401) logout();
    }
  };

  // Load teams on mount
  useEffect(() => {
    if (!user) return;
    loadTeams();
  }, [user]);

  // Load dashboard (applications & invites)
  useEffect(() => {
    if (!user) return;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getInvites();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading || !dashboardData) return <div>Loading dashboard...</div>;

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--color-background-dark)", color: "#fff" }}>
      <h1 className="text-3xl font-black mb-6">
        Welcome back,{" "}
        <Link to="/profile" style={{ color: "var(--color-primary)" }} className="hover:underline">
          {user.username}
        </Link>
      </h1>

      {/* Teams Section */}
      <h2 className="text-xl font-bold mb-4">My Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {teams.length === 0 && <p className="text-gray-400">You are not a member of any teams yet.</p>}
        {teams.map((team) => (
          <div
            key={team.id}
            className="p-4 rounded-2xl border shadow-md hover:shadow-lg transition"
            style={{ backgroundColor: "var(--color-card-dark)", borderColor: "var(--color-accent-dark)" }}
          >
            <h3 className="font-bold text-lg mb-3">
              {team.owner_id === user.id ? (
                <Link to={`/manage/${team.id}`} style={{ color: "var(--color-primary)" }} className="hover:underline">
                  {team.name}
                </Link>
              ) : (
                <span>{team.name}</span>
              )}
            </h3>

            <div className="flex space-x-3">
              {team.members.map((member) => {
                const isMe = member.username === user.username;
                return (
                  <div key={member.id} className="relative">
                    <img
                      src="/images/default_player_avatar.png"
                      alt={member.username}
                      className={`w-10 h-10 rounded-full border-2 ${isMe ? "border-[var(--color-primary)]" : "border-gray-600"}`}
                    />
                    {isMe && (
                      <span className="absolute -bottom-1 right-0 bg-[var(--color-primary)] text-xs px-1 rounded text-white">
                        Me
                      </span>
                    )}
                  </div>
                );
              })}
              {team.members.length < 5 &&
                Array.from({ length: 5 - team.members.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-full border-2 border-gray-600 flex items-center justify-center text-gray-500"
                  >
                    +
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sent & Received Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sent Column */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Sent Applications</h3>
          {dashboardData.sent_applications.length === 0 && <p className="text-gray-400">No applications sent.</p>}
          {dashboardData.sent_applications.map((app) => (
            <div
              key={app.id}
              className="bg-[var(--color-card-dark)] p-4 rounded-2xl border border-[var(--color-accent-dark)] shadow-md hover:shadow-lg mb-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">{app.team} | <span className="font-normal">{app.role}</span></p>
                  <p className="text-gray-400 text-sm">{app.message}</p>
                </div>
                <span className="text-xs text-gray-400">{STATUS_LABELS[app.status]}</span>
              </div>
              {/* Only View button */}
              <button
                onClick={() => setSelectedRequest({ id: app.id, type: "sent_apps" })}
                className="mt-2 px-4 py-1 rounded-lg font-semibold"
                style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
              >
                View
              </button>
            </div>
          ))}

          <h3 className="font-semibold text-lg mt-6 mb-3">Sent Invites</h3>
          {dashboardData.sent_invites.length === 0 && <p className="text-gray-400">No invites sent.</p>}
          {dashboardData.sent_invites.map((inv) => (
            <div
              key={inv.id}
              className="bg-[var(--color-card-dark)] p-4 rounded-2xl border border-[var(--color-accent-dark)] shadow-md hover:shadow-lg mb-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{inv.recipient.user.username}</p>
                  <p className="text-gray-400 text-sm">{inv.role}</p>
                  <p className="text-gray-400 text-sm">{inv.message}</p>
                </div>
                <span className="text-xs text-gray-400">{STATUS_LABELS[inv.status]}</span>
              </div>
              {/* Only View button */}
              <button
                onClick={() => setSelectedRequest({ id: inv.id, type: "sent_invites" })}
                className="mt-2 px-4 py-1 rounded-lg font-semibold"
                style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
              >
                View
              </button>
            </div>
          ))}
        </div>

        {/* Received Column */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Received Applications</h3>
          {dashboardData.received_applications.length === 0 && <p className="text-gray-400">No applications received.</p>}
          {dashboardData.received_applications.map((app) => (
            <div
              key={app.id}
              className="bg-[var(--color-card-dark)] p-4 rounded-2xl border border-[var(--color-accent-dark)] shadow-md hover:shadow-lg mb-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">{app.player.user.username}</p>
                  <p className="text-gray-400 text-sm">Applied for: {app.team}</p>
                  <p className="text-gray-400 text-sm">Role: {app.role}</p>
                  <p className="text-gray-400 text-sm">{app.message}</p>
                </div>
                <span className="text-xs text-gray-400">{STATUS_LABELS[app.status]}</span>
              </div>
              <button
                onClick={() => setSelectedRequest({ id: app.id, type: "received_apps" })}
                className="mt-2 px-4 py-1 rounded-lg font-semibold"
                style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
              >
                View
              </button>
            </div>
          ))}

          <h3 className="font-semibold text-lg mt-6 mb-3">Received Invites</h3>
          {dashboardData.received_invites.length === 0 && <p className="text-gray-400">No invites received.</p>}
          {dashboardData.received_invites.map((inv) => (
            <div
              key={inv.id}
              className="bg-[var(--color-card-dark)] p-4 rounded-2xl border border-[var(--color-accent-dark)] shadow-md hover:shadow-lg mb-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">{inv.team}</p>
                  <p className="text-gray-400 text-sm">Role: {inv.role}</p>
                  <p className="text-gray-400 text-sm">{inv.message}</p>
                </div>
                <span className="text-xs text-gray-400">{STATUS_LABELS[inv.status]}</span>
              </div>
              <button
                onClick={() => setSelectedRequest({ id: inv.id, type: "received_invites" })}
                className="mt-2 px-4 py-1 rounded-lg font-semibold"
                style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
      {selectedRequest && (
        <RequestDetail
          toggle={() => setSelectedRequest(null)}
          id={selectedRequest.id}
          request={selectedRequest.type}
          onActionSuccess={loadTeams} // refresh teams after accepting invite
        />
      )}
    </div>
  );
};

export default Dashboard;