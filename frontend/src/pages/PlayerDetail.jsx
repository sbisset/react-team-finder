import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlayerDetail } from "../context/Api";
import TeamInvitePop from "../components/TeamInvitePopup";

const regionList = {
  1: "North America",
  2: "South America",
  3: "Europe",
  4: "Asia",
  5: "Africa",
  6: "Australia",
};

const PlayerDetail = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seen,setSeen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPlayerDetail(id)
      .then((data) => setPlayer(data))
      .catch(() => setError("Failed to load player"))
      .finally(() => setLoading(false));
  }, [id]);


  function togglePop () {
        setSeen(!seen);
    };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-red-500">
        {error}
      </div>
    );

  if (!player) return null;

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Profile Header */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-8 relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>

          <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-end">

            {/* Avatar */}
            <div className="size-32 rounded-xl bg-slate-900 border-4 border-background-dark overflow-hidden shadow-2xl">
              <img
                src="/images/default_player_avatar.png"
                alt="player avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">

              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-bold">
                  {player.user?.username}
                </h2>

                {player.steam_verified && (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold uppercase rounded">
                    Verified
                  </span>
                )}
              </div>

              <div className="flex gap-6 text-slate-400 text-sm flex-wrap">

                <div className="flex gap-1 items-center">
                  🌍 {regionList[player.region] || "Unknown"}
                </div>

                <div className="flex gap-1 items-center">
                  📅 Member since{" "}
                  {new Date(player.created_at).getFullYear()}
                </div>

                <div className="flex gap-1 items-center">
                  🎯 {player.looking_for_team ? "Looking for Team" : "Not LFT"}
                </div>

              </div>

              {/* Roles */}
              <div className="flex flex-wrap gap-2 pt-2">
                {player.preferred_roles?.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-slate-800/50 border border-border-dark rounded-lg text-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>

            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              
              <button onClick={togglePop} className="bg-primary text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-primary/20">
                Invite to Team
              </button>
             
                  {seen ? <TeamInvitePop playerId={player.id} toggle={togglePop} /> : null}
                  
           
            </div>
                
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">About Me</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {player.bio || "No bio provided."}
          </p>
        </div>

        {/* Stats Grid (Dynamic placeholders for now) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <StatCard title="MMR" value={player.mmr || "—"} />
          <StatCard title="Win Rate" value={player.win_rate ? `${player.win_rate}%` : "—"} />
          <StatCard title="Matches" value={player.total_matches || "—"} />
          <StatCard title="Behavior" value={player.behavior_score || "—"} />

        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-card-dark border border-border-dark p-6 rounded-xl text-center">
    <p className="text-slate-500 text-xs uppercase tracking-widest">
      {title}
    </p>
    <p className="text-3xl font-bold text-white mt-2">
      {value}
    </p>
  </div>
);

export default PlayerDetail;