import os
import subprocess
from django.core.management.commands.runserver import Command as RunserverCommand
from django.conf import settings


class Command(RunserverCommand):
    def handle(self, *args, **options):
        react_dir = os.path.join(settings.BASE_DIR, "frontend", "kidashi_ui")

        print(f"📁 React directory: {react_dir}")

        if not os.path.isdir(react_dir):
            print("❌ React directory does not exist.")
            return

        # Add Node.js to PATH if it's missing (Windows only)
        node_path = r"C:\Program Files\nodejs"
        if node_path not in os.environ["PATH"]:
            os.environ["PATH"] = node_path + os.pathsep + os.environ["PATH"]

        npm_cmd = os.path.join(node_path, "npm.cmd")

        try:
            print("📦 Running React build...")
            subprocess.check_call([npm_cmd, "run", "build"], cwd=react_dir)
            print("✅ React UI built successfully.")
        except FileNotFoundError:
            print("❌ npm.cmd not found. Check Node.js installation.")
            return
        except subprocess.CalledProcessError as e:
            print(f"❌ npm build failed. Error: {e}")
            return

        # Run Django dev server
        super().handle(*args, **options)
