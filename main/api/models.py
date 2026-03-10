from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
# =====================================================
# ENUM / CHOICES
# =====================================================

class Region(models.IntegerChoices):
    NA = 1, "North America"
    SA = 2, "South America"
    EU = 3, "Europe"
    ASIA = 4, "Asia"
    AFRICA = 5, "Africa"
    AUS = 6, "Australia"


class Interest(models.IntegerChoices):
    CUP = 1, "Battle Cup"
    LEAGUE = 2, "Leagues"
    MM = 3, "MatchMaking"
    CASUAL = 4, "Casual Play"


class Role(models.TextChoices):
    CARRY = "Carry", "Hard Carry"
    MID = "Mid", "Mid Lane"
    OFFLANE = "Offlane", "Offlaner"
    SUPPORT = "Support", "Soft Support"
    HARD_SUPPORT = "Hard Support", "Hard Support"


class InviteStatus(models.IntegerChoices):
    PENDING = 1, "Pending"
    ACCEPTED = 2, "Accepted"
    REJECTED = 3, "Rejected"


# =====================================================
# PLAYER PROFILE
# =====================================================

class Player(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="player"
    )

    persona = models.CharField(max_length=60,blank=True,null=True)
    mmr = models.IntegerField(blank=True, null=True, db_index=True)
    wins = models.IntegerField(blank=True, null=True)
    losses = models.IntegerField(blank=True, null=True)
    
    steam_id = models.CharField(max_length=60, blank=True, null=True)
    steam_community = models.URLField(blank=True, null=True)
    steam_verified = models.BooleanField(default=False)
    region = models.IntegerField(
        choices=Region.choices,
        default=Region.NA,
        db_index=True
    )

    looking_for_team = models.BooleanField(default=True)

    bio = models.TextField(blank=True, null=True)

    # Store preferred roles as a list of strings:
    # Example: ["Mid", "Carry"]
    preferred_roles = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-mmr"]

    def __str__(self):
        if self.persona:
            return self.persona
        return self.user.username

    def dotabuff_url(self):
        if self.steam_id:
            return f"https://www.opendota.com/players/{self.steam_id}"
        return None

    @property
    def winrate(self):
        if self.wins is not None and self.losses is not None:
            total = self.wins + self.losses
            if total > 0:
                return round((self.wins / total) * 100, 2)
        return None


# =====================================================
# TEAM
# =====================================================

class Team(models.Model):   
    name = models.CharField(max_length=30, unique=True)

    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="owned_teams"
    )

    image = models.ImageField(
        upload_to="team_pics",
        default="default.png"
    )
   
    
    interests = models.IntegerField(
        choices=Interest.choices,
        default=Interest.MM,
    )

    region = models.IntegerField(
        choices=Region.choices,
        default=Region.EU,
        db_index=True
    )

    looking_for_members = models.BooleanField(default=True)

    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.memberships.count()


# =====================================================
# TEAM MEMBERSHIP (CORE RELATIONSHIP MODEL)
# =====================================================

class TeamMembership(models.Model):
    team = models.ForeignKey(
        "Team",
        on_delete=models.CASCADE,
        related_name="memberships"
    )

    player = models.ForeignKey(
        "Player",
        on_delete=models.CASCADE,
        related_name="memberships"
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    is_captain = models.BooleanField(default=False)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [

            # Prevent same player joining twice
            models.UniqueConstraint(
                fields=["team", "player"],
                name="unique_team_player"
            ),

            # Prevent duplicate roles in team
            models.UniqueConstraint(
                fields=["team", "role"],
                name="unique_team_role"
            ),

            # Only one captain per team
            models.UniqueConstraint(
                fields=["team"],
                condition=Q(is_captain=True),
                name="one_captain_per_team"
            ),
        ]

        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.player.user.username} - {self.team.name} ({self.role})"
        


# =====================================================
# TEAM APPLICATIONS (PLAYER → TEAM)
# =====================================================

class TeamApplication(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    message = models.CharField(max_length=250)

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    status = models.IntegerField(
        choices=InviteStatus.choices,
        default=InviteStatus.PENDING,
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        
        ordering = ["-created_at"]

    def __str__(self):
        if self.player.persona:
            return f"{self.player.persona} applied to {self.team.name}"
        return f"{self.player.user.username} applied to {self.team.name}"


# =====================================================
# TEAM INVITES (TEAM → PLAYER)
# =====================================================

class TeamInvite(models.Model):
    team = models.ForeignKey(
        "Team",
        on_delete=models.CASCADE,
        related_name="invites"
    )

    sender = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_invites"
    )

    recipient = models.ForeignKey(
        "Player",
        on_delete=models.CASCADE,
        related_name="received_invites"
    )

    message = models.CharField(max_length=100, blank=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    status = models.IntegerField(
        choices=InviteStatus.choices,
        default=InviteStatus.PENDING,
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

   
    class Meta:
        constraints = [

            # Only one pending invite per player per team
            models.UniqueConstraint(
                fields=["team", "recipient"],
                condition=Q(status=InviteStatus.PENDING),
                name="unique_pending_invite"
            ),

            # Only one pending invite per role
            models.UniqueConstraint(
                fields=["team", "role"],
                condition=Q(status=InviteStatus.PENDING),
                name="unique_pending_role_invite"
            )
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.team.name} invited {self.recipient.user.username}"

    def is_expired(self):
        return self.expires_at and timezone.now() > self.expires_at