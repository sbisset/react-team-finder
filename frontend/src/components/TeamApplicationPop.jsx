import toast from "react-hot-toast";
import { useState } from "react";
import { sendTeamApplication } from "../context/AuthApi";

function TeamApplicationPop({toggle,teamId}) {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("Carry");

  const  handleSubmit = async (e)=> {
    e.preventDefault();
    console.log(role)
    console.log(message)
    console.log(teamId)
    if (!message.trim()) {
      toast.error("Please add a message");
      return;
    }
    try {
  await sendTeamApplication({
    role,
    team: Number(teamId),
    message,
  });

  toast.success("Invitation sent!");
  toggle();
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
  }
  
    
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">

      <div className="relative w-[460px] bg-[#0f1117] border border-red-900/30 rounded-xl p-7 shadow-xl">

        {/* Close button */}
        <button
          onClick={toggle}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-white mb-1">
          Team Application
        </h2>

        <p className="text-gray-400 text-sm mb-6">
          Send a team Application
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Message */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Message
            </label>

            <textarea
              rows="3"
              placeholder="Add a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#1a1d25] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-600"
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
              className="w-full bg-[#1a1d25] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-600"
            >
              <option value="Carry">🗡️ Carry</option>
              <option value="Mid">🔥 Mid</option>
              <option value="Offlane">🛡️ Offlane</option>
              <option value="Support">✨ Support</option>
              <option value="Hard Support">💎 Hard Support</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={toggle}
              className="px-4 py-2 rounded-md bg-[#2c3445] text-gray-200 hover:bg-[#3b4458]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              Send Invite
            </button>

          </div>

        </form>
      </div>
    </div>
  );

}
export default TeamApplicationPop;