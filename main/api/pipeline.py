from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from decouple import config
from .models import Player
from .services import update_player_dota_stats, get_hero_stats, get_win_loss
import logging

logger = logging.getLogger(__name__)

def link_steam_account(backend, uid, response=None, *args, **kwargs):
    if backend.name != "steam":
        return

    connect_user_id = backend.strategy.session_get("steam_connect_user_id")
    logger.warning("session user id=%s steam uid=%s", connect_user_id, uid)

    if not connect_user_id:
        return redirect(
            "https://dotateamfinder.netlify.app/dashboard?steam=missing-session"
        )

    try:
        User = get_user_model()
        connect_user = User.objects.get(id=connect_user_id)
        player, _ = Player.objects.get_or_create(user=connect_user)

        if Player.objects.filter(steam_id=str(uid)).exclude(user=connect_user).exists():
            backend.strategy.session_pop("steam_connect_user_id")
            return redirect(
                "https://dotateamfinder.netlify.app/dashboard?steam=already-linked"
            )

        player.steam_id = str(uid)
        player.steam_verified = True
        player.steam_community = f"https://steamcommunity.com/profiles/{uid}"
        player.save()

        update_player_dota_stats(player)
        get_hero_stats(player)
        get_win_loss(player)

        backend.strategy.session_pop("steam_connect_user_id")

        return redirect(
            config(
                "SOCIAL_AUTH_LOGIN_REDIRECT_URL",
                default="https://dotateamfinder.netlify.app/dashboard?steam=connected"
            )
        )

    except Exception:
        logger.exception("Steam link pipeline crashed")
        raise