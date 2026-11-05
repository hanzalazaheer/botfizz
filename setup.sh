#!/bin/bash
set -e

# Update and upgrade
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Configure PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE botfizz;"
sudo -u postgres psql -c "CREATE USER botfizz_user WITH ENCRYPTED PASSWORD 'botfizz_secure_password_123!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE botfizz TO botfizz_user;"
sudo -u postgres psql -c "ALTER DATABASE botfizz OWNER TO botfizz_user;"
sudo -u postgres psql -c "ALTER USER botfizz_user CREATEDB;"

# Allow Nginx through firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
yes | ufw enable

echo "SETUP_COMPLETED_SUCCESSFULLY"
