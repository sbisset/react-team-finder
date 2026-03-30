from django.contrib.auth import get_user_model
from .models import Player
from .services import update_player_dota_stats, get_hero_stats, get_win_loss
import logging

logger = logging.getLogger(__name__)

def link_steam_account(backend, user, response, request, *args, **kwargs):
    if backend.name != "steam":
        return

    connect_user_id = backend.strategy.session_get("steam_connect_user_id")
    logger.warning("steam_connect_user_id=%s", connect_user_id)

    if not connect_user_id:
        logger.warning("No steam_connect_user_id found in session")
        return

    steam_url = response.identity_url
    steam_id = steam_url.rstrip("/").split("/")[-1]

    User = get_user_model()
    connect_user = User.objects.get(id=connect_user_id)
    player, _ = Player.objects.get_or_create(user=connect_user)

    if Player.objects.filter(steam_id=str(steam_id)).exclude(user=connect_user).exists():
        logger.warning("Steam ID already linked to another user")
        return

    player.steam_id = str(steam_id)
    player.steam_verified = True
    player.steam_community = f"https://steamcommunity.com/profiles/{steam_id}"
    player.save()

    update_player_dota_stats(player)
    get_hero_stats(player)
    get_win_loss(player)

    backend.strategy.session_pop("steam_connect_user_id")
    logger.warning("Steam linked successfully for user=%s", connect_user.id)