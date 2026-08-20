FROM php:8.2-apache

# Install dependencies and extensions
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip curl unzip \
    python3 python3-pip python3-pil python3-numpy \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Configure Apache
RUN a2enmod rewrite
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

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

# Generate App Key if missing
RUN php artisan key:generate --force

# Storage permissions
RUN chown -R www-data:www-data /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache
RUN chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

# Expose Port
EXPOSE 80 10000

# Start command binding Apache dynamically to Render's $PORT
CMD ["sh", "-c", "PORT_USE=${PORT:-80}; sed -i \"s/Listen 80/Listen ${PORT_USE}/g\" /etc/apache2/ports.conf; sed -i \"s/<VirtualHost \\*:80>/<VirtualHost \\*:${PORT_USE}>/g\" /etc/apache2/sites-available/000-default.conf; apache2-foreground"]
