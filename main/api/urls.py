from rest_framework.routers import DefaultRouter
from .views import (
    PlayerViewSet,
    TeamViewSet,
    TeamMembershipViewSet,
    TeamApplicationViewSet,
    TeamInviteViewSet,
    DashboardViewSet,
    
)
from django.urls import path

router = DefaultRouter()
router.register("players", PlayerViewSet)
router.register("teams", TeamViewSet)
router.register("memberships", TeamMembershipViewSet)
router.register("applications", TeamApplicationViewSet)
router.register("invites", TeamInviteViewSet)
router.register("dashboard", DashboardViewSet, basename="dashboard")



urlpatterns = router.urls + [
]