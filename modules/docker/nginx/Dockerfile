#FROM nginx:1.25
FROM nginxproxy/nginx-proxy

#RUN rm /etc/nginx/conf.d/default.conf
#COPY default.conf.conf /etc/nginx/conf.d

COPY vhost.d/default /etc/nginx/vhost.d/default
COPY custom.conf /etc/nginx/conf.d/custom.conf
