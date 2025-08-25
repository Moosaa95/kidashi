#!/bin/sh

until cd /app
do
    echo "Waiting for server volume..."
done

echo "checking if to restore db..."
echo "$RESTORED_DB"

if [ "$RESTORED_DB" = "True" ];
then
  echo "Running fake migration for newly restored db..."
  python manage.py migrate --fake
fi


until python manage.py migrate
do
    echo "Waiting for db to be ready..."
    sleep 2
done


python manage.py collectstatic --noinput

# python manage.py createsuperuser --noinput

gunicorn config.wsgi --bind 0.0.0.0:8000 --workers 4 --threads 4

# for debug
#python manage.py runserver 0.0.0.0:8000

exec "$@"
