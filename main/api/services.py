import os 
import requests
from decouple import config
from steamid_converter import Converter
STEAM_API_KEY = config("STEAM_API_KEY")


OPEN_DOTA_API = "https://api.opendota.com/api/players/"

def get_steam_profile(steam_id):
    url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={STEAM_API_KEY}&steamids={steam_id}"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if data["response"]["players"]:
            return data["response"]["players"][0]
    return None





def update_player_dota_stats(player):
    """
    Fetch OpenDota stats (MMR, wins, losses) and update Player model.
    Requires player.steam_id to be set.
    """
    if not player.steam_id:
        return None
    id = player.steam_id
    print(id)
    steam32_formatted = Converter.to_steamID3(id)
    print(steam32_formatted)
    steam32 = steam32_formatted.split(":")[2].rstrip("]")
    print(steam32)
    url = f"{OPEN_DOTA_API}{steam32}"
    print(url)
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()
        print(data)

        # MMR estimate
        mmr_estimate = data.get("mmr_estimate", {}).get("estimate")
        if mmr_estimate is not None:
            player.mmr = mmr_estimate

        # Wins / losses
        wins = data.get("win")
        losses = data.get("lose")
        if wins is not None:
            player.wins = wins
        if losses is not None:
            player.losses = losses

        # Optional: update persona if not already set
        if not player.persona:
            profile = data.get("profile", {})
            player.persona = profile.get("personaname")

        player.save()
        return player

    except requests.RequestException as e:
        print(f"[OpenDota] Failed to fetch stats for SteamID {player.steam_id}: {e}")
        return None