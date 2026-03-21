from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers
from django.contrib.auth.models import User

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import (
    Player,
    Team,
    TeamMembership,
    TeamApplication,
    TeamInvite,
    InviteStatus
)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "player":user.player.id

            
        }

        return data
    

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]



class PlayerSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    winrate = serializers.ReadOnlyField()

    class Meta:
        model = Player
        fields = [
            "id",
            "user",
            "persona",
            "mmr",
            "wins",
            "losses",
            "winrate",
            "region",
            "preferred_roles",
            "looking_for_team",
            "steam_verified",
            "bio",
            "created_at",
            "top_heroes",
        ]
        read_only_fields = ["id", "created_at"]



class PlayerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
            "persona",
            "mmr",
            "wins",
            "losses",
            "region",
            "bio",
            "looking_for_team",
            "preferred_roles",
            "steam_verified",
        ]
        read_only_fields = []  # Make sure nothing is read-only here

class TeamMembershipSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = [
            "id",
            "player",
            "role",
            "is_captain",
            "joined_at",
        ]


class TeamSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    memberships = TeamMembershipSerializer(many=True, read_only=True)
    member_count = serializers.ReadOnlyField()

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "owner",
            "image",
            "interests",
            "region",
            "looking_for_members",
            "description",
            "member_count",
            "memberships",
            "created_at",
        ]
        read_only_fields = ["id", "owner", "created_at"]


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        exclude = ["owner", "created_at"]

class TeamUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            "name",
            "description",
            "image",
            "looking_for_members",
            "region",
        ]
class TeamApplicationSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    team = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = TeamApplication
        fields = [
            "id",
            "team",
            "player",
            "message",
            "role",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "player", "status", "created_at"]


class TeamApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamApplication
        fields = ["team", "role", "message"]


class TeamInviteSerializer(serializers.ModelSerializer):
    team = serializers.StringRelatedField(read_only=True)
    sender = UserPublicSerializer(read_only=True)
    recipient = PlayerSerializer(read_only=True)

    class Meta:
        model = TeamInvite
        fields = [
            "id",
            "team",
            "sender",
            "recipient",
            "message",
            "role",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "sender", "status", "created_at"]


class TeamInviteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamInvite
        fields = ["team", "recipient", "role", "message"]


class StatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamInvite  # or TeamApplication
        fields = ["status"]






class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]

    # 👇 THIS GOES INSIDE THE SERIALIZER
    def validate(self, data):
        password = data.get("password")
        password2 = data.get("password2")

        # Check passwords match
        if password != password2:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )

        # Use Django's built-in password validation
        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                {"password": list(e.messages)}
            )

        return data

    def create(self, validated_data):
        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )

        return user
    


# dashboard serialisers 

class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='player.user.username')
    mmr = serializers.IntegerField(source='player.mmr')

    class Meta:
        model = TeamMembership
        fields = ['id', 'role', 'is_captain', 'username', 'mmr']

class TeamDashboardSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(source='memberships', many=True)
    owner_id = serializers.IntegerField(source='owner.id')
    owner_username = serializers.CharField(source='owner.username')

    class Meta:
        model = Team
        fields = ['id', 'name', 'owner_id', 'owner_username', 'members']



class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField()
    password2 = serializers.CharField()

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match")

        try:
            validate_password(data["password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        return data




