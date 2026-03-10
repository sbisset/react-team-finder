import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../context/AuthApi";

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

  // Form state
  const [mmr, setMmr] = useState("");
  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [steamId, setSteamId] = useState("");
  const [steamVerified, setSteamVerified] = useState(false);
  const [region, setRegion] = useState(1);
  const [bio, setBio] = useState("");
  const [lft, setLft] = useState(false);
  const [roles, setRoles] = useState([]);

  // Load profile on mount
  useEffect(() => {
    setLoading(true);
    getProfile()
      .then((data) => {
        setProfile(data);
        setMmr(data.mmr || "");
        setWins(data.wins || 0);
        setLosses(data.losses || 0);
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
        mmr,
        wins: Number(wins),
        losses: Number(losses),
        steam_id: steamId,
        steam_verified: steamVerified,
        region: Number(region),
        bio,
        looking_for_team: lft,
        preferred_roles: roles,
      });
      setProfile(updatedProfile);
      alert("Profile updated!");
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-red-500">
        {error}
      </div>
    );

  // Compute winrate
  const winrate =
    Number(wins) + Number(losses) > 0
      ? ((Number(wins) / (Number(wins) + Number(losses))) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6 flex items-center gap-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-background-dark shadow-lg">
            <img
              src="/images/default_player_avatar.png"
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold">{profile?.user.username}</h2>
              {steamVerified && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold uppercase rounded">
                  Verified
                </span>
              )}
            </div>
            <div className="flex gap-4 items-center text-slate-400 text-sm flex-wrap">
              <div className="flex items-center gap-1">🌍 {regionList[region]}</div>
              <div className="flex items-center gap-1">
                🎯 {lft ? "Looking for Team" : "Not LFT"}
              </div>
              <div className="flex items-center gap-1">📈 Winrate: {winrate}%</div>
            </div>
            <div className="flex gap-2 flex-wrap pt-1">
              {roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-slate-800 border border-border-dark rounded-full text-xs hover:bg-slate-700 transition"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold">Edit Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bio */}
            <div>
              <label className="block mb-1 text-sm text-slate-400">Bio</label>
              <textarea
                rows={3}
                className="w-full bg-[#1a1d25] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Region + LFT */}
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex-1">
                <label className="block mb-1 text-sm text-slate-400">Region</label>
                <select
                  className="w-full bg-[#1a1d25] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
                  value={region}
                  onChange={(e) => setRegion(Number(e.target.value))}
                >
                  {Object.entries(regionList).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={lft}
                  onChange={(e) => setLft(e.target.checked)}
                  id="lft-checkbox"
                  className="w-4 h-4"
                />
                <label htmlFor="lft-checkbox" className="text-sm text-slate-400">
                  Looking for Team
                </label>
              </div>
            </div>

            {/* Roles as clickable pills */}
            <div>
              <label className="block mb-1 text-sm text-slate-400">Preferred Roles</label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((roleOption) => (
                  <button
                    type="button"
                    key={roleOption}
                    onClick={() => toggleRole(roleOption)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      roles.includes(roleOption)
                        ? "bg-red-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats: MMR, Wins, Losses */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm text-slate-400">MMR</label>
                <input
                  type="number"
                  className="w-full bg-[#1a1d25] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
                  value={mmr}
                  onChange={(e) => setMmr(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-slate-400">Wins</label>
                <input
                  type="number"
                  className="w-full bg-[#1a1d25] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-slate-400">Losses</label>
                <input
                  type="number"
                  className="w-full bg-[#1a1d25] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600"
                  value={losses}
                  onChange={(e) => setLosses(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg w-full"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;