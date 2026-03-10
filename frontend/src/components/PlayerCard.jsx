import { Link } from "react-router-dom";
const roleIcons = {
  Carry: "🗡️",
  Mid: "🔥",
  Offlane: "🛡️",
  Support: "✨",
  "Hard Support": "💎",
};
const PlayerCard = ({ player }) => {
    console.log(player.preferred_roles)
  return (
    <div className="group bg-[#1c1a15] border border-[#2c2922] 
      rounded-xl overflow-hidden transition-all duration-300
      hover:-translate-y-1 hover:border-red-500/40 
      hover:shadow-lg hover:shadow-red-500/5">

      <div className="p-5">

        {/* Top Row */}
        <div className="flex justify-between items-start mb-4">

          <div className="w-16 h-16 rounded-lg bg-[#2c2922] border border-[#3a352c]" >
            <img
          src="/images/default_player_avatar.png"
          alt="Player"
          className="hero-bg w-full h-full object-cover brightness-75 contrast-125"
        />
          </div>

          <div className="text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
            {player.mmr ?? "N/A"} MMR
          </div>

        </div>

        {/* Name */}
        <h3 className="text-lg font-bold mb-1 group-hover:text-red-400 transition">
          { player.user.username}
        </h3>

        <p className="text-sm text-slate-400">
          {player.region }
        </p>
            <p className="text-sm text-slate-400">Preferred Roles:</p>
            {player.preferred_roles && player.preferred_roles.length > 0 ? (
            player.preferred_roles.map((role) => (
                <p key={role} className="text-sm text-slate-400 flex gap-2">
                <span>{roleIcons[role]}</span>
                {role}
                </p>
            ))
            ) : (
            <p className="text-sm text-slate-500">No Roles Selected</p>
            )}
         
        
      </div>

      {/* Footer */}
      <div className="flex border-t border-[#2c2922]">
        <Link
          to={`/players/${player.id}`}
          className="flex-1 text-center py-3 text-sm font-medium 
          hover:bg-[#2c2922] transition"
        >
          View Profile
        </Link>

        <button
          className="flex-1 bg-red-600 hover:bg-red-500 
          text-black font-semibold py-3 text-sm transition"
        >
          Invite
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
