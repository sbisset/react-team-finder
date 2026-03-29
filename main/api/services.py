import requests
from decouple import config
from steamid_converter import Converter
from django.core.cache import cache

STEAM_API_KEY = config("STEAM_API_KEY")
OPEN_DOTA_API = "https://api.opendota.com/api/players/"


def get_steam_profile(steam_id):
    url = f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={STEAM_API_KEY}&steamids={steam_id}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        players = data.get("response", {}).get("players", [])
        return players[0] if players else None
    except requests.RequestException as e:
        print(f"Steam profile fetch failed: {e}")
        return None


def get_hero_map():
    hero_map = cache.get("hero_map")
    if hero_map is None:
        try:
            resp = requests.get("https://api.opendota.com/api/heroes", timeout=10)
            resp.raise_for_status()
            heroes_list = resp.json()

            hero_map = {}
            for h in heroes_list:
                internal = h["name"].replace("npc_dota_hero_", "")
                hero_map[h["id"]] = {
                    "name": h["localized_name"],
                    "icon": f"https://cdn.dota2.com/apps/dota2/images/heroes/{internal}_sb.png",
                    "full": f"https://cdn.dota2.com/apps/dota2/images/heroes/{internal}_full.png",
                }

            cache.set("hero_map", hero_map, timeout=86400)
        except requests.RequestException as e:
            print(f"Hero map fetch failed: {e}")
            return {}
    return hero_map


def _steam64_to_steam32(steam_id):
    steam32_formatted = Converter.to_steamID3(steam_id)
    return steam32_formatted.split(":")[2].rstrip("]")


def update_player_dota_stats(player):
    if not player.steam_id:
        return None

    try:
        steam32 = _steam64_to_steam32(player.steam_id)
        url = f"{OPEN_DOTA_API}{steam32}"

        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        mmr_estimate = data.get("computed_mmr")
        if mmr_estimate is not None:
            player.mmr = mmr_estimate

        if not player.persona:
            profile = data.get("profile", {})
            player.persona = profile.get("personaname")

        player.save()
        return player

    except requests.RequestException as e:
        print(f"[OpenDota] Failed to fetch stats for SteamID {player.steam_id}: {e}")
        return None
    except Exception as e:
        print(f"[OpenDota] Parse error for SteamID {player.steam_id}: {e}")
        return None


def get_hero_stats(player):
    if not player.steam_id:
        return None

    try:
        steam32 = _steam64_to_steam32(player.steam_id)
        url = f"{OPEN_DOTA_API}{steam32}/heroes"

        res = requests.get(url, timeout=10)
        res.raise_for_status()
        data = res.json()

        top5 = sorted(data, key=lambda x: x.get("games", 0), reverse=True)[:5]
        hero_map = get_hero_map()

        player.top_heroes = []
        for h in top5:
            hero_data = hero_map.get(h["hero_id"], {})
            player.top_heroes.append({
                "name": hero_data.get("name", "Unknown"),
                "games": h.get("games", 0),
                "wins": h.get("win", 0),
                "icon": hero_data.get("icon"),
            })

        player.save(update_fields=["top_heroes"])
        return player.top_heroes

    except requests.RequestException as e:
        print(f"OpenDota hero stats error: {e}")
        return None
    except Exception as e:
        print(f"Hero stats parse error: {e}")
        return None


def get_win_loss(player):
    if not player.steam_id:
        return None

    try:
        steam32 = _steam64_to_steam32(player.steam_id)
        url = f"{OPEN_DOTA_API}{steam32}/wl"

        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        wins = data.get("win")
        losses = data.get("lose")

        if wins is not None:
            player.wins = wins
        if losses is not None:
            player.losses = losses

        player.save(update_fields=["wins", "losses"])
        return {"wins": player.wins, "losses": player.losses}

    except requests.RequestException as e:
        print(f"OpenDota win/loss error: {e}")
        return None
    except Exception as e:
        print(f"Win/loss parse error: {e}")
        return None