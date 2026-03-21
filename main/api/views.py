from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAuthenticated,AllowAny
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied,NotFound
import json
from django.db import transaction
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404 , redirect
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import (
    Player,
    Team,
    TeamMembership,
    TeamApplication,
    TeamInvite,
    InviteStatus
)

from .serializers import (
    PlayerSerializer,
    PlayerCreateUpdateSerializer,
    TeamSerializer,
    TeamCreateSerializer,
    TeamMembershipSerializer,
    TeamApplicationSerializer,
    TeamApplicationCreateSerializer,
    TeamInviteSerializer,
    TeamInviteCreateSerializer,
    StatusUpdateSerializer,
    RegisterSerializer,
    TeamDashboardSerializer,
    TeamUpdateSerializer,
    PasswordResetConfirmSerializer,
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter,SearchFilter
from django.db.models import Count,Avg,Q,OuterRef, Subquery, Exists

from rest_framework.generics import ListCreateAPIView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data
        return Response(tokens)
    


class UserModelCreateView(ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]







class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter,SearchFilter]
    filterset_fields = ["looking_for_team", "region","mmr"]
    ordering_fields = ["mmr", "created_at"]
    search_fields = ['persona']

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PlayerCreateUpdateSerializer
        return PlayerSerializer


    @action(detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated])
    def me(self, request):
        player = Player.objects.get(user=request.user)

        if request.method == "PATCH":
            serializer = PlayerCreateUpdateSerializer(player, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            # Return full PlayerSerializer with nested user
            return Response(PlayerSerializer(player).data)

        return Response(PlayerSerializer(player).data)
        
    



    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = Player.objects.exclude(user=self.request.user)

        region = self.request.query_params.get("region")
        mmr_min = self.request.query_params.get("min_mmr")
        mmr_max = self.request.query_params.get("max_mmr")
        username = self.request.query_params.get("username")

        if region:
            queryset = queryset.filter(region=region)

        if mmr_min not in [None, ""]:
            mmr_min = int(mmr_min)
            queryset = queryset.filter(mmr__gte=mmr_min)
            print("min_mmr:", mmr_min)
            
        if mmr_max not in [None, ""]:
            mmr_max = int(mmr_max)
            queryset = queryset.filter(mmr__lte=mmr_max)
            print("max_mmr:", mmr_max)
        
        if username:
            queryset = queryset.filter(user__username__icontains=username)

        return queryset
    

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter,SearchFilter]
    filterset_fields = ["looking_for_members", "region"]
    ordering_fields = [ "created_at"]
    search_fields = ['name']

    def get_serializer_class(self):
        if self.action == "create":
            return TeamCreateSerializer
        return TeamSerializer
    
   
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_dashboard(self, request):
        teams = (
            Team.objects
            .filter(memberships__player__user=request.user)
            .prefetch_related(
                "memberships__player__user"
            )
            .distinct()
        )

        serializer = TeamDashboardSerializer(teams, many=True)
        return Response(serializer.data)
    
    @action(detail=False,methods=['get'],permission_classes=[IsAuthenticated])
    def is_captain(self,request):
        teams = Team.objects.filter(owner=request.user).distinct()
        serializer = TeamSerializer(teams,many=True)
        return Response(serializer.data)


    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def my_team(self, request, pk=None):
        team = get_object_or_404(Team, pk=pk)

        if team.owner != request.user:
            return Response(
                {"detail": "You are not the team owner."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TeamSerializer(team)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        with transaction.atomic():
            team = serializer.save(owner=self.request.user)
            role = self.request.data.get('role') or "Carry"
            # Auto-create captain membership
            TeamMembership.objects.create(
                team=team,
                player=self.request.user.player,
                role=role,
                is_captain=True
            )
            player = self.request.user.player
            player.looking_for_team = False
            player.save()
    

    def get_queryset(self):
        queryset = Team.objects.all()  # start with all teams
        
        # Only filter owner out for list (or other read-only actions)
        if self.action == "list":
            queryset = queryset.exclude(owner=self.request.user)
        
        
        # Apply filters
        region = self.request.query_params.get("region")
        role = self.request.query_params.get("role")
        min_mmr = self.request.query_params.get("min_mmr")
        max_mmr = self.request.query_params.get("max_mmr")

        queryset = queryset.annotate(
            avg_mmr=Avg("memberships__player__mmr")
        )

        if region:
            queryset = queryset.filter(region=region)

        if role:
            membership_qs = TeamMembership.objects.filter(
                team=OuterRef('pk'),
                role=role
            )
            queryset = queryset.annotate(has_role=Exists(membership_qs)).filter(has_role=False)

        if min_mmr:
            queryset = queryset.filter(avg_mmr__gte=float(min_mmr))
        if max_mmr:
            queryset = queryset.filter(avg_mmr__lte=float(max_mmr))

        return queryset.distinct()
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_team(self, request, pk=None):
        team = get_object_or_404(Team, pk=pk)

        # Only owner can update
        if team.owner != request.user:
            return Response(
                {"detail": "You are not the team owner."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TeamUpdateSerializer(
            team,
            data=request.data,
            partial=True  # THIS enables PATCH behavior
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        team = self.get_object()
        player = request.user.player

        membership = TeamMembership.objects.filter(
            team=team,
            player=player
        ).first()

        if not membership:
            return Response(
                {"detail": "You are not a member of this team."},
                status=400
            )

        if membership.is_captain:
            return Response(
                {"detail": "Captain cannot leave the team."},
                status=400
            )

        membership.delete()
        player.looking_for_team = True
        player.save()
        serializer =TeamSerializer(team)
        return Response({"detail": "Left team successfully.",
                         "team":serializer.data})
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def kick(self, request, pk=None):
        team = self.get_object()
        player_id = request.data.get("player_id")

        if not player_id:
            return Response(
                {"detail": "player_id is required."},
                status=400
            )

        # 🔒 Only owner can kick
        if team.owner != request.user:
            raise PermissionDenied("Only the team owner can kick members.")

        # Get membership
        membership = TeamMembership.objects.filter(
            team=team,
            player_id=player_id
        ).select_related("player").first()

        if not membership:
            return Response(
                {"detail": "Player is not a member of this team."},
                status=400
            )

        # Prevent owner from kicking themselves
        if membership.player.user == request.user:
            return Response(
                {"detail": "Owner cannot kick themselves."},
                status=400
            )

        # Prevent kicking captain 
        if membership.is_captain:
            return Response(
                {"detail": "Cannot kick the captain."},
                status=400
            )

        with transaction.atomic():
            membership.delete()
        
        team.refresh_from_db()
        serializer = TeamSerializer(team)

        return Response({"detail": "Member kicked successfully.","team":serializer.data})
    
    @action(detail=True,methods=['delete'])
    def delete_team(self,request,pk=None):
        try: 
            team = Team.objects.get(pk=pk)
        except Team.DoesNotExist:
            raise NotFound("Team not found")
        
        if team.owner != request.user:
            raise PermissionDenied("Only the team owner can delete this team.")
        
        with transaction.atomic():
            TeamMembership.objects.filter(team=team).delete()
            team.delete()
            
        return Response({"detail": "Team deleted successfully"})

        

class TeamMembershipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamMembership.objects.select_related("player", "team")
    serializer_class = TeamMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]


class TeamApplicationViewSet(viewsets.ModelViewSet):
    queryset = TeamApplication.objects.select_related("team", "player")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return TeamApplicationCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return StatusUpdateSerializer
        return TeamApplicationSerializer

    def perform_create(self, serializer):
        player = self.request.user.player
        team = serializer.validated_data["team"]
        role = serializer.validated_data["role"]

        
        # 2️⃣Prevent duplicate application to same team
        if TeamApplication.objects.filter(
            team=team,
            player=player
        ).exists():
            raise PermissionDenied("You have already applied to this team.")

        # Prevent applying for role that has member
        if TeamMembership.objects.filter(team=team, role=role).exists():
            raise ValidationError(f"The role '{role}' is already filled by a team member.")

        serializer.save(player=player)

    def update(self, request, *args, **kwargs):

        application = self.get_object()

        if application.team.owner != request.user:
            raise PermissionDenied("You do not own this team.")

        status_value = int(request.data.get("status"))

        if status_value == InviteStatus.ACCEPTED:

            with transaction.atomic():

                # Prevent player joining multiple teams
                if TeamMembership.objects.filter(
                    player=application.player
                ).exists():
                    return Response(
                        {"detail": "Player is already on a team."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Prevent multiple players filling same role
                if TeamMembership.objects.filter(
                    team=application.team,
                    role=application.role
                ).exists():
                    return Response(
                        {"detail": "This role is already filled."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create membership
                TeamMembership.objects.create(
                    team=application.team,
                    player=application.player,
                    role=application.role
                )

                # Mark this application accepted
                application.status = InviteStatus.ACCEPTED
                application.save()

                # Reject other pending applications for same role
                TeamApplication.objects.filter(
                    player=application.player,
                    role=application.role,
                    status=InviteStatus.PENDING
                ).exclude(
                    id=application.id
                ).update(
                    status=InviteStatus.REJECTED
                )

        elif status_value == InviteStatus.REJECTED:

            application.status = InviteStatus.REJECTED
            application.save()

        return Response(TeamApplicationSerializer(application).data)
        

class TeamInviteViewSet(viewsets.ModelViewSet):
    queryset = TeamInvite.objects.select_related("team", "recipient")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return TeamInviteCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return StatusUpdateSerializer
        return TeamInviteSerializer

    # -----------------------
    # CREATE INVITE
    # -----------------------
    def perform_create(self, serializer):
        team = serializer.validated_data.get("team")
        recipient = serializer.validated_data.get("recipient")
        role = serializer.validated_data.get("role")
        sender = self.request.user

        # 1️⃣ Ensure sender is team owner
        if team.owner != sender:
            raise PermissionDenied("You do not own this team.")

        # 2️⃣ Role already filled by a member
        if TeamMembership.objects.filter(team=team, role=role).exists():
            raise ValidationError(f"The role '{role}' is already filled by a team member.")

        # 3️⃣ Role already has a pending invite
        if TeamInvite.objects.filter(team=team, role=role, status=InviteStatus.PENDING).exists():
            raise ValidationError(f"There is already a pending invite for the role '{role}'.")

        # 4️⃣ Recipient already has a pending invite for this team
        if TeamInvite.objects.filter(team=team, recipient=recipient, status=InviteStatus.PENDING).exists():
            raise ValidationError(f"{recipient.user.username} already has a pending invite for this team.")

        # ✅ Save invite
        serializer.save(sender=sender)



   
    # -----------------------
    # ACCEPT INVITE
    # -----------------------
    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        invite = get_object_or_404(TeamInvite, pk=pk)

        if invite.recipient != request.user.player:
            raise PermissionDenied("This invite is not for you.")

        # 1️⃣ Check role availability again (race condition)
        if TeamMembership.objects.filter(team=invite.team, role=invite.role).exists():
            raise ValidationError(f"The role '{invite.role}' is already filled by a team member.")

        with transaction.atomic():
            # Create membership
            TeamMembership.objects.create(
                team=invite.team,
                player=invite.recipient,
                role=invite.role
            )
            # Update invite status
            invite.status = InviteStatus.ACCEPTED
            invite.save()

        serializer = TeamInviteSerializer(invite)
        return Response(serializer.data)

    # -----------------------
    # DECLINE INVITE
    # -----------------------
    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        invite = get_object_or_404(TeamInvite, pk=pk)

        if invite.recipient != request.user.player:
            raise PermissionDenied("This invite is not for you.")

        invite.status = InviteStatus.REJECTED
        invite.save()
        return Response({"detail": "Invite declined"}, status=status.HTTP_204_NO_CONTENT)
    







from rest_framework.decorators import action,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def my_dashboard(self, request):
        user = request.user

        # Applications
        sent_applications = TeamApplication.objects.filter(player__user=user)
        received_applications = TeamApplication.objects.filter(team__owner=user)

        # Invites
        sent_invites = TeamInvite.objects.filter(sender=user)
        received_invites = TeamInvite.objects.filter(recipient__user=user)

        return Response({
            "sent_applications": TeamApplicationSerializer(sent_applications, many=True).data,
            "received_applications": TeamApplicationSerializer(received_applications, many=True).data,
            "sent_invites": TeamInviteSerializer(sent_invites, many=True).data,
            "received_invites": TeamInviteSerializer(received_invites, many=True).data,
        })
    

  

    @action(detail=True, methods=["get", "patch", "delete"])
    def my_invite(self, request, pk=None):

        invite = get_object_or_404(TeamInvite, pk=pk)

        if request.user != invite.sender and request.user != invite.recipient.user:
            raise PermissionDenied("Not allowed.")

        # -----------------------
        # GET
        # -----------------------
        if request.method == "GET":
            serializer = TeamInviteSerializer(invite)
            return Response(serializer.data)

        # -----------------------
        # PATCH (edit invite)
        # -----------------------
        if request.method == "PATCH":

            # Only sender can edit
            if request.user != invite.sender:
                raise PermissionDenied("Only the sender can edit this invite.")

            if invite.status != InviteStatus.PENDING:
                raise ValidationError("Only pending invites can be edited.")

            allowed_fields = {"role", "message"}
            data = {k: v for k, v in request.data.items() if k in allowed_fields}

            role = data.get("role", invite.role)

            # Role already filled
            if TeamMembership.objects.filter(team=invite.team, role=role).exists():
                raise ValidationError(f"The role '{role}' is already filled.")

            # Pending invite already for role
            if TeamInvite.objects.filter(
                team=invite.team,
                role=role,
                status=InviteStatus.PENDING
            ).exclude(pk=invite.pk).exists():
                raise ValidationError(
                    f"There is already a pending invite for the role '{role}'."
                )

            serializer = TeamInviteSerializer(invite, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)

        # -----------------------
        # DELETE
        # -----------------------
        if request.method == "DELETE":

            # Only sender can cancel invite
            if request.user != invite.sender:
                raise PermissionDenied("Only the sender can cancel this invite.")

            invite.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        

    @action(detail=True, methods=["get", "patch", "delete"])
    def my_app(self, request, pk=None):

            app = get_object_or_404(TeamApplication, pk=pk)

            if request.user != app.player.user and request.user != app.team.owner:
                raise PermissionDenied("Not allowed.")

            # -----------------------
            # GET
            # -----------------------
            if request.method == "GET":
                serializer = TeamApplicationSerializer(app)
                return Response(serializer.data)

            # -----------------------
            # PATCH (edit application)
            # -----------------------
            if request.method == "PATCH":

                # Only player can edit
                if request.user != app.player.user:
                    raise PermissionDenied("Only the player can edit this application.")

                if app.status != InviteStatus.PENDING:
                    raise ValidationError("Only pending applications can be edited.")

                allowed_fields = {"role", "message"}
                data = {k: v for k, v in request.data.items() if k in allowed_fields}

                role = data.get("role", app.role)

                # Role already filled
                if TeamMembership.objects.filter(team=app.team, role=role).exists():
                    raise ValidationError(f"The role '{role}' is already filled.")

                serializer = TeamApplicationSerializer(app, data=data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()

                return Response(serializer.data)

            # -----------------------
            # DELETE
            # -----------------------
            if request.method == "DELETE":

                # Player can withdraw application
                if request.user != app.player.user:
                    raise PermissionDenied("Only the player can withdraw this application.")

                app.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)






from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.utils.http import urlsafe_base64_encode
from rest_framework.decorators import api_view


@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset by email.
    Sends a reset link to the user's email.
    """
    email = request.data.get("email")
    if not email:
        return Response({"detail": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)
        print(user)
    except User.DoesNotExist:
        # Do not reveal if email exists
        return Response({"detail": "If email exists, a reset link has been sent."})

    # Encode user ID
    uid = urlsafe_base64_encode(force_bytes(user.id))
    token = default_token_generator.make_token(user)

    # Create reset link (match your frontend route)
    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

    # Send email (for dev, we can just print)
    print("Reset link (dev):", reset_link)

    # In production, use real email
    # send_mail(
    #     subject="Reset your password",
    #     message=f"Click here to reset your password: {reset_link}",
    #     from_email="noreply@yourapp.com",
    #     recipient_list=[email],
    # )

    return Response({"detail": "If email exists, a reset link has been sent."})


@api_view(["POST"])
@permission_classes([AllowAny])
def confirm_password_reset(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(id=uid)
    except:
        return Response({"detail": "Invalid link"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"detail": "Invalid or expired token"}, status=400)

    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user.set_password(serializer.validated_data["password"])
    user.save()

    return Response({"detail": "Password reset successful"})



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def connect_steam(request):
    request.session["steam_connect_user_id"] = request.user.id
    return Response({"detail": "Ready"})

def steam_success(request):
    return redirect("http://localhost:5173/dashboard?steam=connected")

from .services import get_hero_stats

@api_view(["POST"])
def refresh_top_heroes(request):
    player = request.user.player
    get_hero_stats(player)
    return Response({"status":"updated","top_heroes":player.top_heroes})