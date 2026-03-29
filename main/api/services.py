import os 
import requests
from decouple import config
from steamid_converter import Converter
from django.core.cache import cache
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


def get_hero_map():
    hero_map = cache.get("hero_map")
    if hero_map is None:
        heroes_list = requests.get("https://api.opendota.com/api/heroes", timeout=10).json()
        hero_map = {}

        for h in heroes_list:
            internal = h["name"].replace("npc_dota_hero_", "")
            hero_map[h["id"]] = {
                "name": h["localized_name"],
                "icon": f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/{internal}.png",
                "full": f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/{internal}.png",
            }

        cache.set("hero_map", hero_map, timeout=86400)

    return hero_map


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
        mmr_estimate = data.get("computed_mmr")
        if mmr_estimate is not None:
            player.mmr = mmr_estimate

        

        # Optional: update persona if not already set
        if not player.persona:
            profile = data.get("profile", {})
            player.persona = profile.get("personaname")

        player.save()
        return player
    


    except requests.RequestException as e:
        print(f"[OpenDota] Failed to fetch stats for SteamID {player.steam_id}: {e}")
        return None
    

    

def get_hero_stats(player):
    if not player.steam_id:
        return None
    
    id = player.steam_id
    steam32_formatted = Converter.to_steamID3(id)
    steam32 = steam32_formatted.split(":")[2].rstrip("]")
    url = f'{OPEN_DOTA_API}{steam32}/heroes'
    try:
        # fetch hero stats
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()

        # sort + top 5
        top5 = sorted(data, key=lambda x: x["games"], reverse=True)[:5]

        # hero names
        hero_map = get_hero_map()

        # format
        player.top_heroes = [
            {
                "name": hero_map.get(h["hero_id"], "Unknown"),
                "games": h["games"],
                "wins": h["win"],
                "icon": hero_map[h["hero_id"]]["icon"]
            }
            for h in top5
        ]

        # ✅ save to DB
        player.save(update_fields=["top_heroes"])

    except requests.RequestException as e:
        print(f"OpenDota error: {e}")


def get_win_loss(player):
    if not player.steam_id:
         return None
    id = player.steam_id
    steam32_formatted = Converter.to_steamID3(id)
    steam32 = steam32_formatted.split(":")[2].rstrip("]")
    url = f'{OPEN_DOTA_API}{steam32}/wl'
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()
        print(data)

        wins = data.get("win")
        losses = data.get("lose")
        if wins is not None:
            player.wins = wins
        if losses is not None:
            player.losses = losses
    
        player.save(update_fields=["wins","losses"])

    except requests.RequestException as e:
        print(f"OpenDota error: {e}")