import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../context/AuthApi";
import toast from "react-hot-toast";

const regionList = {
  1: "North America",
  2: "South America",
  3: "Europe",
  4: "Asia",
  5: "Africa",
  6: "Australia",
};

const roleOptions = ["Carry", "Mid", "Offlane", "Support", "Hard Support"];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [steamId, setSteamId] = useState("");
  const [steamVerified, setSteamVerified] = useState(false);
  const [region, setRegion] = useState(1);
  const [bio, setBio] = useState("");
  const [lft, setLft] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setLoading(true);
    getProfile()
      .then((data) => {
        setProfile(data);
        setSteamId(data.steam_id || "");
        setSteamVerified(data.steam_verified || false);
        setRegion(data.region || 1);
        setBio(data.bio || "");
        setLft(data.looking_for_team || false);
        setRoles(data.preferred_roles ?? []);
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = (roleOption) => {
    setRoles((prev) =>
      prev.includes(roleOption)
        ? prev.filter((r) => r !== roleOption)
        : [...prev, roleOption]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updatedProfile = await updateProfile({
        steam_id: steamId,
        steam_verified: steamVerified,
        region: Number(region),
        bio,
        looking_for_team: lft,
        preferred_roles: roles,
      });

      setProfile(updatedProfile);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-red-500">
        {error}
      </div>
    );
  }

  const mmr = profile?.mmr ?? null;
  const wins = profile?.wins ?? null;
  const losses = profile?.losses ?? null;

  const hasWinLoss =
    wins !== null &&
    wins !== undefined &&
    losses !== null &&
    losses !== undefined;

  const totalGames = hasWinLoss ? Number(wins) + Number(losses) : 0;

  const winrate =
    hasWinLoss && totalGames > 0
      ? ((Number(wins) / totalGames) * 100).toFixed(1)
      : "N/A";

  const topHeroes = Array.isArray(profile?.top_heroes)
    ? profile.top_heroes
    : [];

  // 🔥 Rank badge logic
  const getRankBadge = (mmr) => {
    if (mmr === null || mmr === undefined) return null;

    const value = Number(mmr);

    if (value < 770) return { name: "Herald", color: "bg-stone-700 text-white" };
    if (value < 1540) return { name: "Guardian", color: "bg-green-700 text-white" };
    if (value < 2310) return { name: "Crusader", color: "bg-yellow-700 text-white" };
    if (value < 3080) return { name: "Archon", color: "bg-cyan-700 text-white" };
    if (value < 3850) return { name: "Legend", color: "bg-emerald-700 text-white" };
    if (value < 4620) return { name: "Ancient", color: "bg-blue-700 text-white" };
    if (value < 5420) return { name: "Divine", color: "bg-purple-700 text-white" };
    return { name: "Immortal", color: "bg-red-700 text-white" };
  };

  const rankBadge = getRankBadge(mmr);

  return (
    <div className="min-h-screen text-slate-100 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-background-dark shadow-lg">
            <img
              src="/images/default_player_avatar.png"
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold">
                {profile?.user?.username}
              </h2>

              {steamVerified && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded">
                  Verified
                </span>
              )}

              {rankBadge && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded ${rankBadge.color}`}
                >
                  {rankBadge.name}
                </span>
              )}
            </div>

            <div className="flex gap-4 text-slate-400 text-sm flex-wrap">
              <div>🌍 {regionList[region]}</div>
              <div>🎯 {lft ? "Looking for Team" : "Not LFT"}</div>
              <div>
                📈 Winrate: {winrate === "N/A" ? "N/A" : `${winrate}%`}
              </div>
            </div>

            <div className="flex gap-4 text-sm text-slate-400">
              <div>🏆 MMR: {mmr ?? "N/A"}</div>
              <div>✅ Wins: {wins ?? "N/A"}</div>
              <div>❌ Losses: {losses ?? "N/A"}</div>
            </div>

            {!steamVerified && (
              <p className="text-xs text-yellow-400">
                Connect Steam to load your stats
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              {roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-slate-800 rounded-full text-xs"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Heroes */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Top Heroes</h3>

          {topHeroes.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {topHeroes.map((hero, i) => {
                const wr =
                  hero.games > 0
                    ? ((hero.wins / hero.games) * 100).toFixed(1)
                    : "N/A";

                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-[#1a1d25] p-4 rounded-lg border border-gray-700"
                  >
                    <img
                      src={hero.icon}
                      alt={hero.name}
                      className="w-14 h-14 rounded"
                    />
                    <div>
                      <div className="font-semibold">{hero.name}</div>
                      <div className="text-sm text-slate-400">
                        {hero.games} games • {hero.wins} wins •{" "}
                        {wr === "N/A" ? "N/A" : `${wr}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No hero stats available.
            </p>
          )}
        </div>

        {/* Edit Profile */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Edit Profile</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#1a1d25] border border-gray-700 rounded px-4 py-2"
              placeholder="Bio"
            />

            <select
              value={region}
              onChange={(e) => setRegion(Number(e.target.value))}
              className="w-full bg-[#1a1d25] border border-gray-700 rounded px-4 py-2"
            >
              {Object.entries(regionList).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>

            <div className="flex gap-2 flex-wrap">
              {roleOptions.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded ${
                    roles.includes(role)
                      ? "bg-red-600"
                      : "bg-slate-800"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <button className="bg-red-600 w-full py-2 rounded">
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;