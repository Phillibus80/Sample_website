FROM php:8.4-apache

RUN a2enmod rewrite
RUN docker-php-ext-install pdo_mysql

WORKDIR /var/www/html/api
COPY api /var/www/html/api
COPY ./api/.htaccess /var/www/html/api/.htaccess
RUN cat addon.conf >> ../../../../etc/apache2/apache2.conf

EXPOSE 80
