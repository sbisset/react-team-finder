import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createNewTeam } from "../context/AuthApi";

const CreateTeam = () => {

  const navigate = useNavigate();

  const [formData,setFormData] = useState({
    name:"",
    interests:"1",
    region:"1",
    description:"",
    role:"Carry",
  });

  const handleSubmit = async (e)=>{
    e.preventDefault();

    const promise = createNewTeam(formData);

    toast.promise(
      promise,
      {
        loading: "Creating team...",
        success: "Team created successfully!",
        error: (err) => err.message || "Failed to create team",
      }
    );

    try {
      await promise;

      // redirect after success
      setTimeout(()=>{
        navigate("/dashboard");
      },800);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6  rounded-xl border border-slate-700 text-white">

      <h1 className="text-2xl font-bold mb-6">Create Team</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <label>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e)=>setFormData({...formData,name:e.target.value})}
          className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2"
        />

        <label>My Role</label>
        <select
          value={formData.role}
          onChange={(e)=>setFormData({...formData,role:e.target.value})}
          className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2"
        >
          <option value="Carry">🗡️ Carry</option>
          <option value="Mid">🔥 Mid</option>
          <option value="Offlane">🛡️ Offlane</option>
          <option value="Support">✨ Support</option>
          <option value="Hard Support">💎 Hard Support</option>
        </select>

        <label>Description</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e)=>setFormData({...formData,description:e.target.value})}
          className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2"
        />

        <label>Interest</label>
        <select
          value={formData.interests}
          onChange={(e)=>setFormData({...formData,interests:e.target.value})}
          className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2"
        >
          <option value="1">Battle Cup</option>
          <option value="2">Leagues</option>
          <option value="3">MatchMaking</option>
          <option value="4">Casual Play</option>
        </select>

        <label>Region</label>
        <select
          value={formData.region}
          onChange={(e)=>setFormData({...formData,region:e.target.value})}
          className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2"
        >
          <option value="1">North America</option>
          <option value="2">South America</option>
          <option value="3">Europe</option>
          <option value="4">Asia</option>
          <option value="5">Africa</option>
          <option value="6">Australia</option>
        </select>

        <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-md font-semibold">
          Create Team
        </button>

      </form>
    </div>
  );
};

export default CreateTeam;