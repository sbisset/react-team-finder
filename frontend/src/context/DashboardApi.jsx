

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
    throw err; 
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

        const data = await res.json();   

        if (!res.ok) {
            throw new Error(data.detail || data[0] || "Failed to update application");
        }

        return data;

    } catch (err) {
        console.error("Update application error:", err);
        throw err;  
    }
};

// -----------------------------
// ACCEPT APPLICATION
// -----------------------------
export const acceptApplication = async (id) => {
  const user = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}applications/${id}/`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json",
                Authorization: `Bearer ${user}`},
    body: JSON.stringify({
      status: 2
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to accept application");
  }

  return data;
};


// -----------------------------
// REJECT APPLICATION
// -----------------------------
export const rejectApplication = async (id) => {
const user = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}applications/${id}/`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json",
                Authorization: `Bearer ${user}`},
    body: JSON.stringify({
      status: 3
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to reject application");
  }

  return data;
};


// -----------------------------
// ACCEPT INVITE
// -----------------------------
export const acceptInvite = async (id) => {
const user = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}invites/${id}/accept/`, {
    method: "POST",
    headers: {"Content-Type": "application/json",
                Authorization: `Bearer ${user}`},
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to accept invite");
  }

  return data;
};


// -----------------------------
// DECLINE INVITE
// -----------------------------
export const declineInvite = async (id) => {
const user = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}invites/${id}/decline/`, {
    method: "POST",
    headers: {"Content-Type": "application/json",
                Authorization: `Bearer ${user}`},
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Failed to decline invite");
  }

  return true;
};


export const deleteInvite = async (id) =>{
const user = localStorage.getItem("access_token");
 // DELETE accepted/rejected 
};

export const deleteApplication = async (id)=>{
const user = localStorage.getItem("access_token");

 // DELETE accepted/rejected 
};