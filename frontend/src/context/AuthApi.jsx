const BASE_URL = import.meta.env.VITE_API_URL;

export const getTeamMemberships = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}teams/my_dashboard/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw { status: response.status };
  }

  const teams = await response.json();
  return teams;
};

export const getInvites = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${BASE_URL}dashboard/my_dashboard/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch invites");
  }

  const data = await response.json();
  console.log(data); // optional, for debugging
  return data;
};





export const getProfile = async () => {
    const user = localStorage.getItem('access_token');
    

    const response = await fetch(`${BASE_URL}players/me/`,{
        method:"GET",
        headers: {
            "Content-Type":"application/json",
            "Authorization": `Bearer ${user}`
        }
    });
    const profile = await response.json()
    console.log(profile)
    return profile
}



export const updateProfile = async (data) => {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${BASE_URL}players/me/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to update profile");
    }

    const profile = await response.json();
    return profile;
}





export const getTeamManage = async(id)=> {
    const user = localStorage.getItem('access_token');

    const response  = await fetch(`${BASE_URL}teams/${id}/my_team/`,{
        method:'GET',
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${user}`
        }
    })
    const team = await response.json();
    return team
}






export const updateTeam = async (id,formData) => {
    const user = localStorage.getItem('access_token');
    const response  = await fetch(`${BASE_URL}teams/${id}/update_team/`,{
        method:'PATCH',
        body:JSON.stringify(formData),
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${user}`
        }
    })
    
    if (!response.ok) {
    throw new Error("Failed to update team");
    }

    return await response.json();
};



export const kickMember = async(id,playerId) => {
    const user = localStorage.getItem('access_token');
    console.log(id,playerId)
    const teamId= Number(id)
    const response = await fetch(`${BASE_URL}teams/${teamId}/kick/`,{
        method:"POST",
        body:JSON.stringify({
            player_id:Number(playerId)
        }),
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${user}`
        }
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to kick member");
    }

    const data = await response.json();
    return data.team; // returns updated team from backend

}


export const getOwnedTeams = async (id) =>{
    const user = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}teams/is_captain/`,{
        method:"GET",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${user}`,
        }
    })

     if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to kick member");
    }

    const data = await response.json();
    return data; // returns updated team from backend


}



export async function sendTeamInvite(payload) {
const user = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}invites/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json(); // <-- get the DRF response body
    const error = new Error("Request failed");
    error.response = { data: errorData, status: res.status };
    throw error;
  }

  return res.json();
}



export async function sendTeamApplication(payload){
    const user = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}applications/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json(); // <-- get the DRF response body
    const error = new Error("Request failed");
    error.response = { data: errorData, status: res.status };
    throw error;
  }

  return res.json();
};




export const createNewTeam = async (formData)=>{
  const user = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}teams/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user}`,
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const errorData = await res.json(); 
    const error = new Error("Request failed");
    error.response = { data: errorData, status: res.status };
    throw error;
  }

  return res.json();

};




export const deleteTeam = async(id)=>{
  const user = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}teams/${id}/delete_team/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user}`,
    },
    body: JSON.stringify(id),
  });

  if (!res.ok) {
    const errorData = await res.json(); 
    const error = new Error("Request failed");
    error.response = { data: errorData, status: res.status };
    throw error;
  }

  return res.json();

};