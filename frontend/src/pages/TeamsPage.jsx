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
    <div className="min-h-screen bg-[#0f0d08] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:px-10">
        <div className="mb-10">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3">
            Find your next <span className="text-red-500">competitive team</span>
          </h1>
          <p className="text-slate-400 text-sm lg:text-base max-w-2xl">
            Browse active rosters, filter by role and MMR, and apply to teams
            that match your competitive goals.
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-red-500/10 bg-red-500/[0.04] p-4 shadow-[0_0_0_1px_rgba(239,68,68,0.03)]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔎
              </span>
              <input
                type="text"
                name="NAME"
                placeholder="Search by team name or tag..."
                value={filters.NAME}
                onChange={handleChange}
                className="w-full rounded-xl border border-red-500/10 bg-[#18130d] py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-red-500/40"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="number"
                name="MIN_MMR"
                placeholder="Min MMR"
                value={filters.MIN_MMR}
                onChange={handleChange}
                className="w-28 rounded-xl border border-red-500/10 bg-[#18130d] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-red-500/40"
              />

              <input
                type="number"
                name="MAX_MMR"
                placeholder="Max MMR"
                value={filters.MAX_MMR}
                onChange={handleChange}
                className="w-28 rounded-xl border border-red-500/10 bg-[#18130d] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-red-500/40"
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
                className="rounded-xl border border-red-500/10 bg-[#18130d] px-4 py-3 text-sm text-white outline-none transition focus:border-red-500/40"
              >
                <option value="">All Teams</option>
                <option value="true">Recruiting</option>
                <option value="false">Full</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Roles Needed
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
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    filters.ROLE === role
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-red-500/10 bg-[#18130d] text-slate-300 hover:border-red-500/40"
                  }`}
                >
                  <span>{roleIcons[role]}</span>
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <TeamList FILTERS={filters} />
      </div>
    </div>
  );
};

export default TeamPage;