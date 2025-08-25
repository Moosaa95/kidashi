# Run upon project setup
pre-commit install

# Run before each commit to ensure proper linting
pre-commit run --all-files


# start celery worker for background task
celery -A config worker -l info

# start celery beat for scheduled task
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
