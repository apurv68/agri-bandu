FROM php:8.2-apache

# Install dependencies (including PostgreSQL client and Python PyTorch for ML inference)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libonig-dev libxml2-dev zip unzip \
    sqlite3 libsqlite3-dev \
    libpq-dev \
    python3 python3-pip python3-pil python3-numpy \
    && pip install --no-cache-dir --break-system-packages torch --index-url https://download.pytorch.org/whl/cpu \
    && docker-php-ext-install pdo_mysql pdo_sqlite pdo_pgsql mbstring gd \
    && rm -rf /var/lib/apt/lists/*

# Configure Apache
RUN a2enmod rewrite && echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Set Apache Document Root
ENV APACHE_DOCUMENT_ROOT /var/www/html/backend/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copy application files
WORKDIR /var/www/html
COPY . /var/www/html

# Install Composer dependencies
WORKDIR /var/www/html/backend
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# CRITICAL: Copy .env.production as .env (Laravel REQUIRES this file to boot)
RUN cp .env.production .env

# Set permissions
RUN touch /var/www/html/backend/database/database.sqlite
RUN chown -R www-data:www-data /var/www/html/backend
RUN chmod -R 777 storage bootstrap/cache database

# Expose Port
EXPOSE 80 10000

# Start: prepare SQLite, run migrations safely, and launch Apache
CMD ["sh", "-c", "cd /var/www/html/backend && touch database/database.sqlite && chmod 666 database/database.sqlite && chmod 777 database && php artisan migrate --force || true && PORT_USE=${PORT:-80} && sed -i \"s/Listen 80/Listen ${PORT_USE}/g\" /etc/apache2/ports.conf && sed -i \"s/<VirtualHost \\*:80>/<VirtualHost \\*:${PORT_USE}>/g\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]
