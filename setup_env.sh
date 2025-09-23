#!/bin/sh

# Create envs directory before write to envs/.env
mkdir -p envs

#DJANGO
echo SECRET_KEY=$SECRET_KEY >> envs/.env
echo DEBUG=True >> envs/.env
echo MODE=PROD >> envs/.env

#DATABASE
echo DB_NAME=$SQL_DATABASE >> envs/.env
echo PGUSER=$SQL_USER >> envs/.env
echo PGPASSWORD=$SQL_PASSWORD >> envs/.env
echo PGHOST=$SQL_HOST >> envs/.env
echo PGPORT=$SQL_PORT >> envs/.env

# CELERY
echo CELERY_BROKER_URL=redis://redis:6379/0  >> envs/.env
echo CELERY_RESULT_BACKEND=redis://redis:6379/0  >> envs/.env
