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
  const [inviteSeen,setInviteSeen] = useState(false); 
 const [appSeen,setAppSeen] = useState(false);


function inviteTogglePop(){
    setInviteSeen(!inviteSeen);
  };

function appTogglePop(){
    setAppSeen(!appSeen);
  };

  // Load teams
  useEffect(() => {
    if (!user) return;
    const loadTeams = async () => {
      try {
        const memberships = await getTeamMemberships();
        setTeams(memberships); // memberships API now returns full team objects with owner_id, owner_username, members
      } catch (err) {
        if (err?.status === 401) logout();
      }
    };
    loadTeams();
  }, [user, logout]);

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

  const handleUpdateStatus = async (type, id, status) => {
    console.log("Update", type, id, status);
    // TODO: Call API to update application/invite status and update local state
  };

  return (
    <div className="min-h-screen px-6 py-8 bg-background-dark text-slate-100">
      <h1 className="text-3xl font-black mb-6">
        Welcome back, <Link to="/profile" className="text-primary">{user.username}</Link>
      </h1>

      {/* Teams */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">My Teams</h2>
        {teams.length === 0 ? (
          <p className="text-slate-400">You are not a member of any teams yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map(team => (
              <div key={team.id} className="bg-card-dark p-6 rounded-2xl border border-accent-dark">
                <h3 className="text-lg font-bold mb-4">
                  {team.owner_id === user.id ? (
                    <Link to={`/manage/${team.id}`} className="text-primary">{team.name}</Link>
                  ) : (
                    <span>{team.name}</span>
                  )}
                </h3>

                {team.members.map(member => {
                  const isMe = member.username === user.username;
                  return (
                    <div key={member.id} className={`p-3 rounded-xl border mb-2 ${isMe ? "border-primary bg-primary/10" : "border-slate-700 bg-accent-dark/40"}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">
                            {member.username}{isMe && <span className="text-primary ml-2">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-400">Role: {member.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{member.mmr} MMR</p>
                          {member.is_captain && <span className="text-primary text-xs">⭐ Captain</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dashboard columns */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Sent */}
        <div>
          <h2 className="text-xl font-bold mb-4">Sent</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Team Applications </h3>
            {dashboardData.sent_applications.length === 0 ? (
              <p className="text-slate-400">No applications sent.</p>
            ) : (
              dashboardData.sent_applications.map(app => (
                <div key={app.id} className="bg-card-dark p-3 border border-slate-700 rounded-xl mb-2">
                  <p><strong>Team:</strong> {app.team} | <strong>Role:</strong> {app.role}</p>
                  <p className="text-slate-400">{app.message}</p>
                  <p className="text-xs text-slate-400">Status: {STATUS_LABELS[app.status]}</p>
                  <button onClick={appTogglePop} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition">View</button>
                  {appSeen ? <RequestDetail toggle={appTogglePop} id={app.id} request={"sent_apps"} /> : null}
                </div>
              ))
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Team Invites Sent</h3>
            {dashboardData.sent_invites.length === 0 ? (
              <p className="text-slate-400">No invites sent.</p>
            ) : (
              dashboardData.sent_invites.map(inv => (
                <div key={inv.id} className="bg-card-dark p-3 border border-slate-700 rounded-xl mb-2">
                  <p><strong>Player:</strong> {inv.recipient.user.username} | <strong>Role:</strong> {inv.role}</p>
                  <p className="text-slate-400">{inv.message}</p>
                  <p className="text-xs text-slate-400">Status: {STATUS_LABELS[inv.status]}</p>
                  <button onClick={inviteTogglePop} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition">View</button>
                  {inviteSeen ? <RequestDetail toggle={inviteTogglePop} id={inv.id} request={"sent_invites"} /> : null}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Received */}
        <div>
          <h2 className="text-xl font-bold mb-4">Received</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2"> Team Applications Received</h3>
            {dashboardData.received_applications.length === 0 ? (
              <p className="text-slate-400">No applications received.</p>
            ) : (
              dashboardData.received_applications.map(app => (
                <div key={app.id} className="bg-card-dark p-3 border border-slate-700 rounded-xl mb-2">
                  Applied for: {app.team}
                  <p>Application sent from:</p>
                  <p><strong></strong> {app.player.user.username} | <strong>Role:</strong> {app.role}</p>
                 <strong>Message:</strong>  <p className="text-slate-400">{app.message}</p>
                 
                  <p className="text-xs text-slate-400 mb-2">Status: {STATUS_LABELS[app.status]}</p>
                  {app.status === 1 && (
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        onClick={() => handleUpdateStatus("application", app.id, 1)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() => handleUpdateStatus("application", app.id, 2)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2"> Team Invites </h3>
            {dashboardData.received_invites.length === 0 ? (
              <p className="text-slate-400">No invites received.</p>
            ) : (
              dashboardData.received_invites.map(inv => (
                <div key={inv.id} className="bg-card-dark p-3 border border-slate-700 rounded-xl mb-2">
                  <p><strong>Team:</strong> {inv.team} | <strong>Role:</strong> {inv.role}</p>
                  <p className="text-slate-400">{inv.message}</p>
                  <p className="text-xs text-slate-400 mb-2">Status: {STATUS_LABELS[inv.status]}</p>
                  {inv.status === 1 && (
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        onClick={() => handleUpdateStatus("invite", inv.id, 1)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() => handleUpdateStatus("invite", inv.id, 2)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;