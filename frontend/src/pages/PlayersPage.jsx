import { useState } from "react";
import PlayerList from "../components/PlayerList";

const PlayersPage = () => {
  const [filters, setFilters] = useState({
    NAME: "",
    ROLE: "",
    MIN_MMR: "",
    MAX_MMR: "",
    LFT: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-slate-400 text-sm">
          Browse and filter available players
        </p>
      </div>

      {/* 🔥 Filter Bar */}
      <div className="bg-[#14120e] border border-[#1f1d18] 
        rounded-xl p-5">

        <div className="flex flex-wrap gap-6 items-end">

          {/* Search */}
          <div className="flex flex-col">
            <label className="text-xs uppercase text-slate-400 mb-1">
              Player Name
            </label>
            <input
              type="text"
              name="NAME"
              placeholder="Search player..."
              value={filters.NAME}
              onChange={handleChange}
              className="bg-[#1f1d18] border border-[#2c2922] 
                rounded-lg px-3 py-2 w-56 text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-red-500"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col">
            <label className="text-xs uppercase text-slate-400 mb-1">
              Role
            </label>
            <select
              name="ROLE"
              value={filters.ROLE}
              onChange={handleChange}
              className="bg-[#1f1d18] border border-[#2c2922] 
                rounded-lg px-3 py-2 text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-red-500"
            >
              <option value="">All Roles</option>
              <option value="Carry">Carry</option>
              <option value="Mid">Mid</option>
              <option value="Offlane">Offlane</option>
              <option value="Support">Support</option>
            </select>
          </div>

          {/* Min MMR */}
          <div className="flex flex-col">
            <label className="text-xs uppercase text-slate-400 mb-1">
              Min MMR
            </label>
            <input
              type="number"
              name="MIN_MMR"
              value={filters.MIN_MMR}
              onChange={handleChange}
              placeholder="0"
              className="bg-[#1f1d18] border border-[#2c2922] 
                rounded-lg px-3 py-2 w-24 text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-red-500"
            />
          </div>

          {/* Max MMR */}
          <div className="flex flex-col">
            <label className="text-xs uppercase text-slate-400 mb-1">
              Max MMR
            </label>
            <input
              type="number"
              name="MAX_MMR"
              value={filters.MAX_MMR}
              onChange={handleChange}
              placeholder="10000"
              className="bg-[#1f1d18] border border-[#2c2922] 
                rounded-lg px-3 py-2 w-24 text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-red-500"
            />
          </div>

          {/* LFT Status */}
          <div className="flex flex-col">
            <label className="text-xs uppercase text-slate-400 mb-1">
              Status
            </label>
            <select
              value={filters.LFT ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  LFT:
                    e.target.value === ""
                      ? null
                      : e.target.value === "true",
                }))
              }
              className="bg-[#1f1d18] border border-[#2c2922] 
                rounded-lg px-3 py-2 text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-red-500"
            >
              <option value="">All Players</option>
              <option value="true">Looking For Team</option>
              <option value="false">Not Looking</option>
            </select>
          </div>

        </div>
      </div>

      {/* 🔥 Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <PlayerList FILTERS={filters} />
      </div>

    </div>
  );
};

export default PlayersPage;
