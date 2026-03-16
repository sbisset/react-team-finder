import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTeamDetail } from "../context/Api";
import TeamApplicationPop from "../components/TeamApplicationPop";

const roleIcons = {
  Carry: "🗡️",
  Mid: "🔥",
  Offlane: "🛡️",
  Support: "✨",
  "Hard Support": "💎",
};
const regionList = {
  1: "North America",
  2: "South America",
  3: "Europe",
  4: "Asia",
  5: "Africa",
  6: "Australia",
};
const TeamDetail = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [seen,setSeen] = useState(false);


  function togglePop(){
    setSeen(!seen);
  }
  useEffect(() => {
    getTeamDetail(id).then(setTeam);
  }, [id]);

  if (!team) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading team...
      </div>
    );
  }

  const members = team.memberships || [];

  const avgMmr =
    members.length > 0
      ? Math.round(
          members.reduce((acc, m) => acc + (m.player?.mmr ?? 0), 0) /
            members.length
        )
      : null;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white px-6 py-10">

      {/* TEAM HERO */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#111] border border-red-900/30 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-lg mb-10">

        {/* Logo */}
        <div className="w-24 h-24 bg-[#1f1f1f] rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
          <img
            src={team.image}
            alt={team.name}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{team.name}</h1>

          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
            <span>🌍 Region: {regionList[team.region]}</span>
            <span>⚔ Avg MMR: {avgMmr ?? "N/A"}</span>
            <span>👥 {members.length} Members</span>
          </div>

          <div className="mt-3 flex gap-3">

            <button className="px-4 py-2 bg-[#1f1f1f] border border-gray-700 rounded-md hover:border-red-600 transition">
              Contact Captain
            </button>

            {team.looking_for_members && (
              <>
              <button onClick={togglePop} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition">Apply to Join</button>
               {seen ? <TeamApplicationPop toggle={togglePop} teamId={id} /> : null}
              </>
            )}

          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* ACTIVE ROSTER */}
          <div className="bg-[#141414] border border-red-900/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6">Active Roster</h2>

            <div className="grid md:grid-cols-2 gap-4">

              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 bg-[#1f1f1f] border border-gray-800 rounded-lg p-4 hover:border-red-700 transition"
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-sm">
                    {m.player.user.username[0].toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">
                      {m.player.user.username}
                    </div>

                    <div className="text-xs text-gray-400">
                      {roleIcons[m.role]} {m.role}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {m.player.mmr ?? "N/A"} MMR
                  </div>
                </div>
              ))}

              {team.looking_for_members && (
                <div className="flex items-center justify-between bg-[#1f1f1f] border border-dashed border-red-700 rounded-lg p-4">

                  <span className="text-sm text-gray-400">
                    Open Position
                  </span>

                  <button onClick={togglePop} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1 rounded-md">
                    Apply
                  </button>

                </div>
              )}
            </div>
          </div>

          {/* ABOUT TEAM */}
          <div className="bg-[#141414] border border-red-900/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">About the Team</h2>

            <p className="text-gray-400 leading-relaxed text-sm">
              {team.description || "No team description yet."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* TEAM STATS */}
          <div className="bg-[#141414] border border-red-900/20 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Team Statistics</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div>
                <div className="text-gray-500">Members</div>
                <div className="font-semibold">{members.length}</div>
              </div>

              <div>
                <div className="text-gray-500">Avg MMR</div>
                <div className="font-semibold">{avgMmr ?? "N/A"}</div>
              </div>

              <div>
                <div className="text-gray-500">Region</div>
                <div className="font-semibold">{team.region}</div>
              </div>

              <div>
                <div className="text-gray-500">Created</div>
                <div className="font-semibold">
                  {new Date(team.created_at).toLocaleDateString()}
                </div>
              </div>

            </div>
          </div>

          {/* CAPTAIN */}
          <div className="bg-[#141414] border border-red-900/20 rounded-xl p-6">

            <h3 className="font-semibold mb-4">Team Captain</h3>

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                {team.owner.username[0].toUpperCase()}
              </div>

              <div>
                <div className="font-medium">
                  {team.owner.username}
                </div>
                <div className="text-xs text-gray-500">
                  Team Owner
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeamDetail;