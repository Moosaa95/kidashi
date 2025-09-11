from django.contrib import admin
from .models import State, LocalGovernment, GeoRegion, Country, Configurations, Bank, TaskScheduler

admin.site.register(State)
admin.site.register(LocalGovernment)
admin.site.register(GeoRegion)
admin.site.register(Configurations)
admin.site.register(Country)
admin.site.register(Bank)
admin.site.register(TaskScheduler)
