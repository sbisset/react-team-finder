import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { kickMember, updateTeam, getTeamManage } from "../context/AuthApi";

const TeamManagement = () => {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    looking_for_members: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Load team data
  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamManage(id);
      setTeam(data);
      setFormData({
        name: data.name,
        description: data.description,
        looking_for_members: data.looking_for_members,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  // 🔹 Update team info
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedTeam = await updateTeam(id, formData);
      setTeam(updatedTeam); // update UI immediately
      alert("Team updated successfully");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // 🔹 Remove member
  const handleRemove = async (membership) => {
    if (!membership?.player?.id) return;

    try {
      const updatedTeam = await kickMember(team.id, membership.player.id);
      setTeam(updatedTeam);
      alert("Member kicked successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to remove member");
    }
  };

  if (loading)
    return <div className="text-white text-center py-10">Loading...</div>;

  if (error)
    return <div className="text-red-500 text-center py-10">{error}</div>;

  if (!team) return null;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white px-10 py-10">
      {/* Header Card */}
      <div className="bg-[#141414] p-6 rounded-xl border border-red-900/20 flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[#1f1f1f] rounded-xl flex items-center justify-center text-black font-bold text-2xl">
            ⚔
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{team.name}</h1>
            <div className="flex gap-4 mt-1 text-gray-400 text-sm">
              <span>Team MMR: {team.mmr ?? "N/A"}</span>
              <span>{team.region}</span>
              <span>Est. {team.created_at?.slice(0, 4)}</span>
            </div>
          </div>
        </div>
        <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-bold mt-4 lg:mt-0">
          Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Roster Management */}
        <div className="bg-[#141414] p-6 rounded-xl border border-red-900/20">
          <h2 className="text-xl font-bold mb-4">Roster Management</h2>
          <p className="text-gray-400 text-sm mb-4">
            {team.memberships?.length ?? 0} / 7 Players
          </p>
          <div className="space-y-3">
            {team.memberships?.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white">
                    {m.player?.user?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {m.player?.user?.username}
                      {m.is_captain && (
                        <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">
                          CAPTAIN
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">{m.role}</p>
                  </div>
                </div>
                {!m.is_captain && (
                  <button
                    onClick={() => handleRemove(m)}
                    className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded-md text-xs font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button className="flex items-center justify-center mt-3 gap-2 text-red-500 text-sm font-semibold">
              + Invite New Player
            </button>
          </div>
        </div>

        {/* Team Settings */}
        <div className="bg-[#141414] p-6 rounded-xl border border-red-900/20">
          <h2 className="text-xl font-bold mb-4">Team Settings</h2>

          <form onSubmit={handleUpdate}>
            <div className="mb-4">
                <label className="mb-1 text-gray-300 text-sm font-medium" htmlFor="name">
    Name
  </label>
  <input
    id="name"
    type="text"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
    placeholder="Omni-potent"
  />
              <label className="block text-sm text-gray-400 mb-1">
                Recruitment Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, looking_for_members: true })
                  }
                  className={`px-4 py-1 rounded-md ${
                    formData.looking_for_members ? "bg-red-600" : "bg-gray-700"
                  }`}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, looking_for_members: false })
                  }
                  className={`px-4 py-1 rounded-md ${
                    !formData.looking_for_members
                      ? "bg-red-600"
                      : "bg-gray-700"
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">
                Team Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="4"
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-red-600 text-sm"
              />
            </div>

            

            <button
              type="submit"
              className="mt-4 w-full bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-bold text-sm"
            >
              Save Changes
            </button>
          </form>

          <button className="mt-4 w-full bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-md font-bold text-sm">
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;