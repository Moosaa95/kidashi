from django.contrib import admin
from modules.trust_circle.models import TrustCircle, CircleMembershipVote, CircleActivity

admin.site.register(TrustCircle)
admin.site.register(CircleMembershipVote)
admin.site.register(CircleActivity)
