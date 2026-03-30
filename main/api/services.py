# api/services.py
import requests
from steamid_converter import Converter
from django.core.cache import cache

OPEN_DOTA_API = "https://api.opendota.com/api/players/"

def get_hero_map():
    hero_map = cache.get("hero_map")
    if hero_map is None:
        heroes_list = requests.get("https://api.opendota.com/api/heroes").json()
        hero_map = {}
        for h in heroes_list:
            internal = h["name"].replace("npc_dota_hero_", "")
            hero_map[h["id"]] = {
                "name": h["localized_name"],
                "icon": f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/heroes/{internal}_sb.png",
                "full": f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/heroes/{internal}_full.png"
            }
        cache.set("hero_map", hero_map, timeout=86400)
    return hero_map

def update_player_dota_stats(player):
    if not player.steam_id:
        return
    steam32 = Converter.to_steamID3(player.steam_id).split(":")[2].rstrip("]")
    url = f"{OPEN_DOTA_API}{steam32}"
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()
        player.mmr = data.get("computed_mmr") or 0
        if not player.persona:
            profile = data.get("profile", {})
            player.persona = profile.get("personaname", "")
        player.save()
    except Exception as e:
        print(f"[OpenDota] Failed to fetch stats: {e}")

def get_hero_stats(player):
    if not player.steam_id:
        return
    steam32 = Converter.to_steamID3(player.steam_id).split(":")[2].rstrip("]")
    url = f"{OPEN_DOTA_API}{steam32}/heroes"
    try:
        data = requests.get(url).json()
        top5 = sorted(data, key=lambda x: x["games"], reverse=True)[:5]
        hero_map = get_hero_map()
        player.top_heroes = [
            {
                "name": hero_map.get(h["hero_id"], {}).get("name", "Unknown"),
                "icon": hero_map.get(h["hero_id"], {}).get("icon", ""),
                "games": h["games"],
                "wins": h["win"]
            }
            for h in top5
        ]
        player.save(update_fields=["top_heroes"])
    except Exception as e:
        print(f"[OpenDota] Failed to fetch hero stats: {e}")

def get_win_loss(player):
    if not player.steam_id:
        return
    steam32 = Converter.to_steamID3(player.steam_id).split(":")[2].rstrip("]")
    url = f"{OPEN_DOTA_API}{steam32}/wl"
    try:
        data = requests.get(url).json()
        player.wins = data.get("win") or 0
        player.losses = data.get("lose") or 0
        player.save(update_fields=["wins", "losses"])
    except Exception as e:
        print(f"[OpenDota] Failed to fetch win/loss: {e}")