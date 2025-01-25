FROM nginx:stable

RUN apt update &&\
    apt upgrade -y &&\
    apt install jq -y

WORKDIR /application

COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/site.conf  /etc/nginx/conf.d/size.conf
COPY dist /application/www

EXPOSE 8080

CMD ["/application/docker-entrypoint.sh"]