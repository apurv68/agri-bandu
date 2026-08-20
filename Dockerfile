FROM php:8.2-apache

# Install system dependencies and PHP MySQL extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    curl \
    unzip \
    python3 \
    python3-pip \
    python3-pil \
    python3-numpy \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Enable Apache Mod Rewrite for Laravel
RUN a2enmod rewrite

# Set Apache Document Root to Laravel public/ directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/backend/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set Working Directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install Composer inside backend
WORKDIR /var/www/html/backend
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# Set directory permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache
RUN chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

# Expose HTTP Port
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
