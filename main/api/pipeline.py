# api/pipeline.py
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from .models import Player
from .services import update_player_dota_stats, get_hero_stats, get_win_loss

def link_steam_account(backend, user, response, request, *args, **kwargs):
    """
    Pipeline to link Steam account to Player object after Steam auth callback.
    Only saves steam_id to player; runs OpenDota stats update.
    """
    if backend.name != "steam":
        return

    print("[DEBUG] link_steam_account hit")
    print("[DEBUG] SESSION:", dict(request.session.items()))

    connect_user_id = request.session.get("steam_connect_user_id")
    print("[DEBUG] connect_user_id:", connect_user_id)

    if not connect_user_id:
        print("[DEBUG] No connect_user_id in session!")
        return
    
    User = get_user_model()
    try:
        connect_user = User.objects.get(id=connect_user_id)
    except User.DoesNotExist:
        print(f"[Steam Pipeline] User ID {connect_user_id} not found")
        return

    # Ensure Player exists
    if not hasattr(connect_user, "player"):
        Player.objects.create(user=connect_user)

    player = connect_user.player

    # Extract SteamID from response
    steam_url = response.identity_url
    steam_id = steam_url.split("/")[-1]

    # Prevent duplicate linking
    if Player.objects.filter(steam_id=steam_id).exclude(user=connect_user).exists():
        print(f"[Steam Pipeline] Steam ID {steam_id} already linked")
        return

    player.steam_id = steam_id
    player.steam_verified = True
    player.steam_community = f"https://steamcommunity.com/profiles/{steam_id}"
    player.save()

    # Update OpenDota stats
    update_player_dota_stats(player)
    get_hero_stats(player)
    get_win_loss(player)

    # Remove session key
    del request.session["steam_connect_user_id"]
    request.session.modified = True
    print(f"[Steam Pipeline] Steam linked for user {connect_user_id}")