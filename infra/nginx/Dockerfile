FROM nginx:alpine

COPY  ./certs/nginx.crt /etc/ssl/certs/nginx.crt
COPY  ./certs/nginx.key /etc/ssl/private/nginx.key

COPY  nginx.conf /etc/nginx/nginx.conf
COPY  conf.d/default.conf  /etc/nginx/conf.d/default.conf
