from django.contrib.auth import get_user_model
from .models import Player
from .services import update_player_dota_stats, get_hero_stats, get_win_loss

def link_steam_account(backend, user, response, request, *args, **kwargs):
    if backend.name != "steam":
        return

    connect_user_id = request.session.get("steam_connect_user_id")
    if not connect_user_id:
        return

    steam_url = response.identity_url
    steam_id = steam_url.split("/")[-1]

    User = get_user_model()
    connect_user = User.objects.get(id=connect_user_id)
    player, _ = Player.objects.get_or_create(user=connect_user)

    if player.steam_id:
        return

    if Player.objects.filter(steam_id=steam_id).exclude(user=connect_user).exists():
        return

    player.steam_id = str(steam_id)
    player.steam_verified = True
    player.steam_community = f"https://steamcommunity.com/profiles/{steam_id}"
    player.save()

    try:
        update_player_dota_stats(player)
        get_hero_stats(player)
        get_win_loss(player)
    except Exception as e:
        print("OpenDota sync failed:", e)

    request.session.pop("steam_connect_user_id", None)