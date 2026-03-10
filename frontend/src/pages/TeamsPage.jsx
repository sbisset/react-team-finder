import { useState } from "react";
import TeamList from "../components/TeamList";

const roles = [
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

const TeamPage = () => {
  const [filters, setFilters] = useState({
    NAME: "",
    ROLE: "",
    MIN_MMR: "",
    MAX_MMR: "",
    LFM: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white px-6 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Find Your Team
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Browse and join competitive squads
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-[#141414] border border-red-900/20 rounded-xl p-6 mb-10 shadow-lg">
        {/* Search + MMR Row */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            name="NAME"
            placeholder="Search team..."
            value={filters.NAME}
            onChange={handleChange}
            className="bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 w-56 focus:outline-none focus:border-red-600 transition"
          />

          <input
            type="number"
            name="MIN_MMR"
            placeholder="Min MMR"
            value={filters.MIN_MMR}
            onChange={handleChange}
            className="bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 w-28 focus:outline-none focus:border-red-600 transition"
          />

          <input
            type="number"
            name="MAX_MMR"
            placeholder="Max MMR"
            value={filters.MAX_MMR}
            onChange={handleChange}
            className="bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 w-28 focus:outline-none focus:border-red-600 transition"
          />

          <select
            value={filters.LFM ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                LFM:
                  e.target.value === ""
                    ? null
                    : e.target.value === "true",
              }))
            }
            className="bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-red-600 transition"
          >
            <option value="">All Teams</option>
            <option value="true">Recruiting</option>
            <option value="false">Full</option>
          </select>
        </div>

        {/* Role Selector */}
        <div>
          <p className="text-xs uppercase text-gray-500 mb-3 tracking-wide">
            Filter by Role
          </p>

          <div className="flex flex-wrap gap-3">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    ROLE: prev.ROLE === role ? "" : role,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${
                  filters.ROLE === role
                    ? "bg-red-600 border-red-600"
                    : "bg-[#1f1f1f] border-gray-700 hover:border-red-500"
                }`}
              >
                <span>{roleIcons[role]}</span>
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <TeamList FILTERS={filters} />
    </div>
  );
};

export default TeamPage;
