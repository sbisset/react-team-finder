const PlayerFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <aside className="w-full lg:w-72 lg:h-[calc(100vh-65px)] 
      lg:sticky lg:top-[65px] border-r border-primary/10 
      p-6 overflow-y-auto bg-slate-50 
      dark:bg-background-dark/50">

      <h3 className="text-lg font-bold uppercase tracking-wider mb-6">
        Filters
      </h3>

      <div className="space-y-6">

        {/* Name */}
        <div>
          <label className="text-xs font-bold uppercase text-slate-500">
            Player Name
          </label>
          <input
            name="NAME"
            value={filters.NAME}
            onChange={handleChange}
            className="w-full mt-2 bg-slate-200 dark:bg-[#27241b]
              border rounded-lg p-2 text-sm"
            placeholder="Search name..."
          />
        </div>

        {/* Role */}
        <div>
          <label className="text-xs font-bold uppercase text-slate-500">
            Role
          </label>
          <select
            name="ROLE"
            value={filters.ROLE}
            onChange={handleChange}
            className="w-full mt-2 bg-slate-200 dark:bg-[#27241b]
              border rounded-lg p-2 text-sm"
          >
            <option value="">All Roles</option>
            <option value="Carry">Carry</option>
            <option value="Mid">Mid</option>
            <option value="Offlane">Offlane</option>
            <option value="Support">Support</option>
          </select>
        </div>

        {/* MMR */}
        <div className="flex gap-2">
          <input
            type="number"
            name="MIN_MMR"
            placeholder="Min MMR"
            value={filters.MIN_MMR}
            onChange={handleChange}
            className="w-1/2 bg-slate-200 dark:bg-[#27241b]
              border rounded-lg p-2 text-sm"
          />
          <input
            type="number"
            name="MAX_MMR"
            placeholder="Max MMR"
            value={filters.MAX_MMR}
            onChange={handleChange}
            className="w-1/2 bg-slate-200 dark:bg-[#27241b]
              border rounded-lg p-2 text-sm"
          />
        </div>
      </div>
    </aside>
  );
};

export default PlayerFilters;