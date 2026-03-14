import { useState } from "react";
import { createNewTeam } from "../context/AuthApi";


    
const CreateTeam = ()=>{
    const [formData,setFormData] = useState({
        name:"",
        interests:"1",
        region:"1",
        description:"",
        role:"Carry",
        });


const handleSubmit = async (e)=>{
    e.preventDefault();
    createNewTeam(formData)
    console.log(formData)
}
    return (
        <div>
        <h1>Create Team...</h1>

        <form onSubmit={handleSubmit}>
            <label>
                Name
            </label>
            <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})}/>



        <label className="block text-sm text-gray-400 mb-2">
              My Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData,role:e.target.value})}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-600 transition"
            >
              <option value="Carry">🗡️ Carry</option>
              <option value="Mid">🔥 Mid</option>
              <option value="Offlane">🛡️ Offlane</option>
              <option value="Support">✨ Support</option>
              <option value="Hard Support">💎 Hard Support</option>
            </select>



            <br/>
            <label>
                Description
            </label>
            <textarea rows={3} value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})}/>
            <br/>

            <label>
                Interest
            </label>
            <select  value={formData.interests} onChange={(e)=>setFormData({...formData,interests:e.target.value})}>
                
                <option value="1">Battle Cup</option>
                <option value="2">Leagues</option>
                <option value="3">MatchMaking</option>
                <option value="4">Casual Play</option>

            </select>
            <br/>
             <label>
                Region
            </label>
             <select value={formData.region} onChange={(e)=>setFormData({...formData,region:e.target.value})}>

                <option  value="1">North America</option>
                <option value="2">South America</option>
                <option value="3">Europe</option>
                <option value="4">Asia</option>
                <option value="5">Africa</option>
                <option value="6">Australia</option>

            </select>
            <br/>
            <button>Create</button>
        </form>
        </div>
    )
};

export default CreateTeam;
