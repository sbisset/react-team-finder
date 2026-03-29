from django.contrib.auth import get_user_model
from .models import Player
from .services import update_player_dota_stats, get_hero_stats, get_win_loss

def link_steam_account(backend, user, response, request, *args, **kwargs):
    print("PIPELINE: link_steam_account called")
    print("PIPELINE backend:", getattr(backend, "name", None))
    print("PIPELINE session steam_connect_user_id:", request.session.get("steam_connect_user_id"))
    print("PIPELINE response:", response)

    if backend.name != "steam":
        print("PIPELINE: backend is not steam")
        return

    connect_user_id = request.session.get("steam_connect_user_id")
    if not connect_user_id:
        print("PIPELINE: no steam_connect_user_id in session")
        return

    steam_url = response.identity_url
    steam_id = steam_url.split("/")[-1]
    print("PIPELINE steam_id:", steam_id)

    User = get_user_model()
    connect_user = User.objects.get(id=connect_user_id)
    player, _ = Player.objects.get_or_create(user=connect_user)

    if player.steam_id:
        print("PIPELINE: player already has steam_id")
        request.session.pop("steam_connect_user_id", None)
        return

    if Player.objects.filter(steam_id=steam_id).exclude(user=connect_user).exists():
        print("PIPELINE: steam_id already linked to another user")
        request.session.pop("steam_connect_user_id", None)
        return

    player.steam_id = steam_id
    player.steam_verified = True
    player.steam_community = f"https://steamcommunity.com/profiles/{steam_id}"
    player.save()
    print("PIPELINE: player saved")

    try:
        update_player_dota_stats(player)
        get_hero_stats(player)
        get_win_loss(player)
        print("PIPELINE: stats sync complete")
    except Exception as e:
        print("PIPELINE: stats sync failed:", e)

    request.session.pop("steam_connect_user_id", None)
    print("PIPELINE: done")