#!/bin/sh

until cd /app
do
    echo "Waiting for server volume..."
done

# run a worker :)
celery -A config worker --loglevel=info --autoscale=10,3 -E
