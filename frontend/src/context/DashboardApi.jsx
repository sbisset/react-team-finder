

const BASE_URL = import.meta.env.VITE_API_URL;

export const getInvite = async (id)=>{
    const user = localStorage.getItem('access_token')
    try {
        const res = await fetch(`${BASE_URL}dashboard/${id}/my_invite/`,{
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
        const res = await fetch(`${BASE_URL}dashboard/${id}/my_app/`,{
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



export const updateInvite = async (id, formData) => {
  const user = localStorage.getItem("access_token");

  try {
    const res = await fetch(`${BASE_URL}dashboard/${id}/my_invite/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user}`,
      },
      body: JSON.stringify(formData),
    });

    // Parse the response first
    const data = await res.json();

    // Throw proper error if request failed
    if (!res.ok) {
      const message =
        data.detail ||
        data[0] ||
        Object.values(data)[0]?.[0] ||
        "Failed to update invite";
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error("Update invite error:", err);
    throw err; // Important so your component can catch and display it
  }
};



export const updateApplication = async (id, formData) => {
    const user = localStorage.getItem("access_token");

    try {
        const res = await fetch(`${BASE_URL}dashboard/${id}/my_app/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();   // 👈 parse response first

        if (!res.ok) {
            throw new Error(data.detail || data[0] || "Failed to update application");
        }

        return data;

    } catch (err) {
        console.error("Update application error:", err);
        throw err;  // 👈 important so your component can catch it
    }
};