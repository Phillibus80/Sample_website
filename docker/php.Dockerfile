FROM php:8.4-apache

RUN a2enmod rewrite

# Install GD dependencies and extension
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html/api
COPY api /var/www/html/api
COPY ./api/.htaccess /var/www/html/api/.htaccess
RUN cat addon.conf >> ../../../../etc/apache2/apache2.conf

EXPOSE 80
