FROM php:8.2-apache

# Install minimal dependencies fast
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libonig-dev libxml2-dev zip unzip \
    && docker-php-ext-install pdo_mysql mbstring gd \
    && rm -rf /var/lib/apt/lists/*

# Configure Apache
RUN a2enmod rewrite && echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Set Apache Document Root to Laravel public/ directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/backend/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Working directory & Copy application
WORKDIR /var/www/html
COPY . /var/www/html

# Composer install inside backend
WORKDIR /var/www/html/backend
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# Storage permissions
RUN chown -R www-data:www-data storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

# Expose Port
EXPOSE 80 10000

# Start command binding Apache dynamically to Render's $PORT
CMD ["sh", "-c", "PORT_USE=${PORT:-80}; sed -i \"s/Listen 80/Listen ${PORT_USE}/g\" /etc/apache2/ports.conf; sed -i \"s/<VirtualHost \\*:80>/<VirtualHost \\*:${PORT_USE}>/g\" /etc/apache2/sites-available/000-default.conf; apache2-foreground"]
