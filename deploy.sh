#!/bin/sh

ssh -o StrictHostKeyChecking=no root@$DIGITAL_OCEAN_IP_ADDRESS << 'ENDSSH'
  cd /app
  docker login registry.hub.docker.com -u $DH_REGISTRY_USER -p $DH_REGISTRY_PASSWORD
  docker pull $WEB_IMAGE
  docker pull $NGINX_IMAGE
  docker pull $TASK_IMAGE
  docker pull $CRON_IMAGE

  docker compose -f docker-compose.ci.prod.yml up -d
ENDSSH
