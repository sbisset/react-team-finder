

const BASE_URL = import.meta.env.VITE_API_URL;

export const getInvite = async (id)=>{
    const user = localStorage.getItem('access_token')
    try {
        const res = await fetch(`${BASE_URL}dashboard/${id}/my_invite`,{
            method:"GET",
            headers:{
                "Content-Type": "application/json",
                Authorization: `Bearer ${user}`,
            }
        })
        if (!res.ok) throw new Error("Failed to fetch Invite")

        const data = await res.json();
        return data
    } catch (err){
        console.error(err)
    }
    
}


export const getApp = async(id)=>{
    const user = localStorage.getItem('access_token')
    try {
        const res = await fetch(`${BASE_URL}dashboard/${id}/my_app`,{
            method:"GET",
            headers:{
                "Content-Type": "application/json",
                Authorization: `Bearer ${user}`,
            }
        })
        if (!res.ok) throw new Error("Failed to fetch Invite")

        const data = await res.json();
        return data
    } catch (err){
        console.error(err)
    }
}