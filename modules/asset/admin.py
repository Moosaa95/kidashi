from django.contrib import admin

from modules.asset.models import Asset, AssetActivity

admin.site.register(Asset)
admin.site.register(AssetActivity)
