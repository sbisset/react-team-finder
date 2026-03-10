from django.contrib import admin
from . import models
# Register your models here.
class TeamInviteAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

class TeamApplicationAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

class TeamMembershipAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)



class TeamAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

class PlayerAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(models.TeamInvite,TeamInviteAdmin)
admin.site.register(models.TeamApplication,TeamApplicationAdmin)
admin.site.register(models.TeamMembership,TeamMembershipAdmin)
admin.site.register(models.Team,TeamAdmin)
admin.site.register(models.Player,PlayerAdmin)