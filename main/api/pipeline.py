def link_steam_account(backend, user, response, request, *args, **kwargs):
    print("PIPELINE CALLED")
    print("backend:", getattr(backend, "name", None))
    print("session steam_connect_user_id:", request.session.get("steam_connect_user_id"))
    print("response:", response)

    if backend.name != "steam":
        print("Not steam backend")
        return

    connect_user_id = request.session.get("steam_connect_user_id")
    if not connect_user_id:
        print("No steam_connect_user_id in session")
        return

    steam_url = response.identity_url
    steam_id = steam_url.split("/")[-1]
    print("steam_id:", steam_id)

    User = get_user_model()
    connect_user = User.objects.get(id=connect_user_id)
    player, _ = Player.objects.get_or_create(user=connect_user)

    if player.steam_id:
        print("Player already linked")
        request.session.pop("steam_connect_user_id", None)
        return

    if Player.objects.filter(steam_id=steam_id).exclude(user=connect_user).exists():
        print("Steam ID already linked to another user")
        request.session.pop("steam_connect_user_id", None)
        return

    player.steam_id = steam_id
    player.steam_verified = True
    player.steam_community = f"https://steamcommunity.com/profiles/{steam_id}"
    player.save()
    print("Player saved successfully")

    try:
        update_player_dota_stats(player)
        get_hero_stats(player)
        get_win_loss(player)
    except Exception as e:
        print("Stats sync failed:", e)

    request.session.pop("steam_connect_user_id", None)
    print("Pipeline done")