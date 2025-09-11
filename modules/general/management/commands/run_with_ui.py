import subprocess
import os
from django.core.management.commands.runserver import Command as RunserverCommand
from django.conf import settings


class Command(RunserverCommand):
    help = "Build Kidashi UI and run Django server"

    def handle(self, *args, **options):
        react_dir = os.path.join(settings.BASE_DIR, "frontend/kidashi_ui")

        try:
            # Run `npm run build` in the React directory
            self.stdout.write(self.style.NOTICE("Building React UI..."))
            subprocess.check_call(["npm", "run", "build"], cwd=react_dir)
            self.stdout.write(self.style.SUCCESS("React UI built successfully."))

        except subprocess.CalledProcessError as e:
            self.stderr.write(self.style.ERROR(f"Error building React UI: {e}"))
            return

        # Now run the regular Django development server
        super().handle(*args, **options)
