from django.contrib.auth import get_user_model
from .models import Player
from .services import update_player_dota_stats, get_hero_stats, get_win_loss

def link_steam_account(backend, user, response, request, *args, **kwargs):
    """
    Pipeline step to attach Steam ID to Player without creating a new user.
    """
    if backend.name != "steam":
        return

    # Only link if connect_steam was called
    connect_user_id = request.session.get("steam_connect_user_id")
    if not connect_user_id:
        return  # Skip if session missing

    User = get_user_model()
    try:
        connect_user = User.objects.get(id=connect_user_id)
    except User.DoesNotExist:
        return

    player = connect_user.player

    # Extract Steam ID from Steam OpenID response
    steam_url = response.identity_url
    steam_id = steam_url.rstrip("/").split("/")[-1]

    # Prevent relinking or duplicates
    if player.steam_id or Player.objects.filter(steam_id=steam_id).exclude(user=connect_user).exists():
        return

    player.steam_id = steam_id
    player.steam_verified = True
    player.steam_community = f"https://steamcommunity.com/profiles/{steam_id}"
    player.save()

    # Optionally fetch OpenDota stats
    update_player_dota_stats(player)
    get_hero_stats(player)
    get_win_loss(player)

    # Clear session key
    del request.session["steam_connect_user_id"]