# Standard Lib
import os

# Third-party lib

# Django
from django.shortcuts import render
from django.views.generic.base import View


class Index(View):
    template = "login/sign-in.html"
    context = {}

    def get(self, request):
        self.context.update(institution=os.getenv("INSTITUTION", "KIDASHI"))
        return render(request, self.template, self.context)
