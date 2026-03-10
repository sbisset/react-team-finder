import { useEffect, useState } from "react";
import { getOwnedTeams, sendTeamInvite } from "../context/AuthApi";
import toast from "react-hot-toast";

const TeamInvitePop = ({ toggle,teamId,playerId }) => {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("Carry");
  const [team,setTeam] = useState('')
  const [teams,setTeams] = useState(null)

 useEffect(() => {
  getOwnedTeams().then((fetchedTeams) => {
    setTeams(fetchedTeams);
    if (fetchedTeams.length > 0) {
      setTeam(fetchedTeams[0].id); // default to first team
    }
  });
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await sendTeamInvite({
      team: Number(team),
      recipient: Number(playerId),
      role,
      message,
    });

    toast.success("Invite sent!");
    toggle(); // close modal
  } catch (err) {
    console.error(err);

    const data = err.response?.data;

    if (!data) {
      toast.error("Failed to invite player. Try again.");
      return;
    }

    // Handle DRF field errors or detail message
    if (data.detail) {
      toast.error(data.detail);
    } else if (Array.isArray(data)) {
      toast.error(data.join("\n"));
    } else {
      // first field error
      const firstField = Object.keys(data)[0];
      const message = data[firstField];
      if (Array.isArray(message)) {
        toast.error(message.join("\n"));
      } else if (typeof message === "string") {
        toast.error(message);
      } else {
        toast.error("Failed to invite player.");
      }
    }
  }
};


  if (!teams){
    return (
      <div>
        Loading....
      </div>
    )
  }

  console.log(teams)
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      {/* Modal Card */}
      <div className="w-full max-w-md bg-[#141414] border border-red-900/30 rounded-xl shadow-2xl p-6 relative">

        {/* Close Button */}
        <button
          onClick={toggle}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-white mb-1">
          Invite Player
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Send a team invitation
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm text-gray-400 mb-2">
            Team
          </label>

          <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-600 transition"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
          {/* Message */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              placeholder="Add a message..."
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-600 transition"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Assign Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-600 transition"
            >
              <option value="Carry">🗡️ Carry</option>
              <option value="Mid">🔥 Mid</option>
              <option value="Offlane">🛡️ Offlane</option>
              <option value="Support">✨ Support</option>
              <option value="Hard Support">💎 Hard Support</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={toggle}
              className="px-4 py-2 rounded-md text-sm bg-gray-700 hover:bg-gray-600 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-md text-sm font-bold bg-red-600 hover:bg-red-700 transition"
            >
              Send Invite
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamInvitePop;