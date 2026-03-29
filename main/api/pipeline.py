from django.contrib.auth import get_user_model
from .models import Player
from .services import update_player_dota_stats, get_hero_stats, get_win_loss

def link_steam_account(backend, user, response, request, *args, **kwargs):
    print("PIPELINE: entered")

    try:
        print("PIPELINE: backend =", backend.name)
    except Exception as e:
        print("PIPELINE: backend print failed:", e)

    if backend.name != "steam":
        print("PIPELINE: not steam, returning")
        return

    try:
        connect_user_id = request.session.get("steam_connect_user_id")
        print("PIPELINE: connect_user_id =", connect_user_id)
        if not connect_user_id:
            print("PIPELINE: no connect_user_id, returning")
            return
    except Exception as e:
        print("PIPELINE: session read failed:", e)
        raise

    try:
        steam_url = response.identity_url
        steam_id = steam_url.split("/")[-1]
        print("PIPELINE: steam_id =", steam_id)
    except Exception as e:
        print("PIPELINE: steam_id parse failed:", e)
        raise

    try:
        User = get_user_model()
        connect_user = User.objects.get(id=connect_user_id)
        print("PIPELINE: connect_user loaded =", connect_user.id)
    except Exception as e:
        print("PIPELINE: loading connect_user failed:", e)
        raise

    try:
        player, created = Player.objects.get_or_create(user=connect_user)
        print("PIPELINE: player loaded, created =", created, "player_id =", player.id)
    except Exception as e:
        print("PIPELINE: get_or_create player failed:", e)
        raise

    try:
        print("PIPELINE: existing player.steam_id =", player.steam_id)
        if player.steam_id:
            print("PIPELINE: player already linked, returning")
            return
    except Exception as e:
        print("PIPELINE: checking existing steam_id failed:", e)
        raise

    try:
        conflict = Player.objects.filter(steam_id=str(steam_id)).exclude(user=connect_user).exists()
        print("PIPELINE: steam_id conflict =", conflict)
        if conflict:
            print("PIPELINE: steam_id already linked elsewhere, returning")
            return
    except Exception as e:
        print("PIPELINE: conflict check failed:", e)
        raise

    try:
        player.steam_id = str(steam_id)
        player.steam_verified = True
        player.steam_community = f"https://steamcommunity.com/profiles/{steam_id}"
        print("PIPELINE: about to save player")
        player.save()
        print("PIPELINE: player saved")
    except Exception as e:
        print("PIPELINE: player.save failed:", e)
        raise

    try:
        update_player_dota_stats(player)
        print("PIPELINE: update_player_dota_stats ok")
    except Exception as e:
        print("PIPELINE: update_player_dota_stats failed:", e)

    try:
        get_hero_stats(player)
        print("PIPELINE: get_hero_stats ok")
    except Exception as e:
        print("PIPELINE: get_hero_stats failed:", e)

    try:
        get_win_loss(player)
        print("PIPELINE: get_win_loss ok")
    except Exception as e:
        print("PIPELINE: get_win_loss failed:", e)

    try:
        request.session.pop("steam_connect_user_id", None)
        print("PIPELINE: session cleared")
    except Exception as e:
        print("PIPELINE: clearing session failed:", e)
        raise