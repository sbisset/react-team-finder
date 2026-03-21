from rest_framework.routers import DefaultRouter
from .views import (
    PlayerViewSet,
    TeamViewSet,
    TeamMembershipViewSet,
    TeamApplicationViewSet,
    TeamInviteViewSet,
    DashboardViewSet,
    request_password_reset,
    confirm_password_reset,
    connect_steam,
    refresh_top_heroes,
)
from django.urls import path,include

router = DefaultRouter()
router.register("players", PlayerViewSet)
router.register("teams", TeamViewSet)
router.register("memberships", TeamMembershipViewSet)
router.register("applications", TeamApplicationViewSet)
router.register("invites", TeamInviteViewSet)
router.register("dashboard", DashboardViewSet, basename="dashboard")



urlpatterns = router.urls + [
    path("auth/password-reset/", request_password_reset),
    path("auth/password-reset-confirm/<uidb64>/<token>/", confirm_password_reset),
    path("auth/steam/connect/", connect_steam),
    path("refresh-top-heroes/",refresh_top_heroes)
]