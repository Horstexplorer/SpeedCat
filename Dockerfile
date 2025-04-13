FROM nginx:stable

RUN apt update &&\
    apt upgrade -y &&\
    apt install jq dos2unix -y

WORKDIR /application

COPY docker-entrypoint.sh .
RUN dos2unix docker-entrypoint.sh &&\
    chmod +x docker-entrypoint.sh
COPY test-file-setup.sh .
RUN dos2unix test-file-setup.sh &&\
    chmod +x test-file-setup.sh

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/site.conf  /etc/nginx/conf.d/site.conf
COPY dist /application/www

EXPOSE 8080

CMD ["/application/docker-entrypoint.sh"]