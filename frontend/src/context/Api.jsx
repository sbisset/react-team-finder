

const BASE_URL = import.meta.env.VITE_API_URL;

export const getTeamList = async (FILTERS = {}, customUrl = null) => {
    const user = localStorage.getItem('access_token');
    let url;

    if (customUrl) {
        url = customUrl;
    } else {
        const { LFM, REGION, INTEREST, NAME,MIN_MMR,MAX_MMR,ROLE } = FILTERS;

        const params = new URLSearchParams();

        if (LFM !== undefined ) params.append("looking_for_members", LFM);
        if (REGION) params.append("region", REGION);
        if (INTEREST) params.append("interests", INTEREST);
        if (NAME) params.append("search", NAME);
        if (MIN_MMR) params.append("min_mmr", MIN_MMR);
        if (MAX_MMR) params.append("max_mmr", MAX_MMR);
        if (ROLE) params.append("role", ROLE);

        url = params.toString()
            ? `http://localhost:8000/api/teams/?${params}`
            : `http://localhost:8000/api/teams/`;
    }
   
    const response = await fetch(url,{
        method:"GET",
        headers: {
            "Content-Type":"application/json",
            "Authorization": `Bearer ${user}`
        }
    });
    const teams = await response.json()
    console.log(teams)
    return teams
};

export const getTeamDetail = async (id)=>{
    const user = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}teams/${id}/`,{
        method:"GET",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${user}`
        }
    })
    const team = await response.json();
    return team
}




export const getPlayerList = async (FILTERS = {}, customUrl = null) => {
  const user = localStorage.getItem("access_token");
  let url;

  if (customUrl) {
    url = customUrl;
    console.log(url);
  } else {
    const { LFT, NAME, REGION, MIN_MMR, MAX_MMR, ROLE } = FILTERS;
    const params = new URLSearchParams();

    if (LFT !== undefined && LFT !== null) {
      params.append("looking_for_team", LFT);
    }

    if (REGION) params.append("region", REGION);
    if (MIN_MMR) params.append("min_mmr", MIN_MMR);
    if (MAX_MMR) params.append("max_mmr", MAX_MMR);
    if (NAME) params.append("username", NAME);
    if (ROLE) params.append("role", ROLE);

    url = params.toString()
      ? `${BASE_URL}players/?${params.toString()}`
      : `${BASE_URL}players/`;

    console.log(url);
  }

  console.log(url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user}`,
    },
  });

  console.log(response);

  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }

  const players = await response.json();
  console.log(players);

  return players;
};
    

export const getPlayerDetail = async (id)=>{
    const user = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}players/${id}/`,{
            method:"GET",
        headers: {
            "Content-Type":"application/json",
            "Authorization": `Bearer ${user}`
        }
        }
    )
    const player = await response.json();
    return player
}
