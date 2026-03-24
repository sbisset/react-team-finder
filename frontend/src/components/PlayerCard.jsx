import { Link } from "react-router-dom";
import TeamInvitePop from "../components/TeamInvitePopup";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const roleIcons = {
  Carry: "🗡️",
  Mid: "🔥",
  Offlane: "🛡️",
  Support: "✨",
  "Hard Support": "💎",
};

const regionLabels = {
  1: "North America",
  2: "South America",
  3: "Europe",
  4: "Asia",
  5: "Africa",
  6: "Australia",
};

const PlayerCard = ({ player }) => {
  const [seen, setSeen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef();

  const togglePop = () => {
    if (seen) {
      setSeen(false);
    } else {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
      setSeen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        seen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        !document.getElementById(`team-invite-${player.id}`)?.contains(event.target)
      ) {
        setSeen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [seen, player.id]);

  const displayedRoles =
    player.preferred_roles && player.preferred_roles.length > 0
      ? player.preferred_roles
      : [];

  return (
    <div
      className="group overflow-hidden rounded-2xl border border-red-500/10 bg-red-500/[0.04] transition duration-300 hover:-translate-y-1 hover:border-red-500/30"
    >
      {/* Top visual */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-red-500/20 via-[#1a120d] to-[#0f0d08]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_35%),linear-gradient(to_bottom_right,rgba(255,255,255,0.02),transparent)]" />
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(120deg,transparent,rgba(239,68,68,0.08),transparent)]" />

        <div className="absolute -bottom-6 left-5">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-4 border-[#120f0b] bg-[#1a1510] shadow-xl">
            <img
              src="/images/default_player_avatar.png"
              alt={`${player.user.username}'s avatar`}
              className="h-full w-full object-cover brightness-90"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pt-10">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight text-white group-hover:text-red-400 transition">
            {player.user.username}
          </h3>

          <span className="rounded bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
            {player.mmr ?? "N/A"} MMR
          </span>
        </div>

        <p className="mb-4 text-sm text-slate-400">
          {regionLabels[player.region] || player.region || "Unknown Region"}
        </p>

        <div className="mb-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Preferred Roles
          </p>

          <div className="flex flex-wrap gap-2">
            {displayedRoles.length > 0 ? (
              displayedRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 rounded-full border border-red-500/15 bg-[#18130d] px-3 py-1 text-xs font-medium text-slate-300"
                >
                  <span>{roleIcons[role] || "🎮"}</span>
                  {role}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No roles selected</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to={`/players/${player.id}`}>
            <button className="w-full rounded-xl border border-red-500/15 bg-[#18130d] py-3 text-sm font-semibold text-white transition hover:border-red-500/40">
              View Profile
            </button>
          </Link>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={togglePop}
              aria-label={`Invite ${player.user.username} to your team`}
              className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:brightness-110"
            >
              Invite
            </button>

            {seen &&
              createPortal(
                <div
                  id={`team-invite-${player.id}`}
                  style={{
                    position: "absolute",
                    top: popupPosition.top,
                    left: popupPosition.left,
                    zIndex: 1000,
                  }}
                >
                  <TeamInvitePop
                    playerId={player.id}
                    toggle={() => setSeen(false)}
                  />
                </div>,
                document.body
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;