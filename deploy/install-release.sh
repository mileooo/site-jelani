#!/usr/bin/env bash
set -Eeuo pipefail

release_id="${1:?release id is required}"
release_dir="/opt/jjelani/releases/${release_id}"
staged_env="$(mktemp)"
trap 'rm -f "$staged_env"' EXIT

sudo install -d -o root -g root -m 755 /opt/jjelani /opt/jjelani/releases
sudo install -d -o jjelani -g jjelani -m 750 /var/lib/jjelani
sudo install -d -o jjelani -g jjelani -m 750 /var/backups/jjelani
sudo install -d -o root -g root -m 700 /etc/jjelani

sudo install -d -o root -g root -m 755 "$release_dir"
sudo tar -xzf /tmp/jjelani-release.tar.gz -C "$release_dir"
sudo chown -R root:root "$release_dir"
sudo find "$release_dir" -type d -exec chmod 755 {} +
sudo find "$release_dir" -type f -exec chmod 644 {} +
sudo ln -sfn "$release_dir" /opt/jjelani/current

auth_secret=""
if sudo test -f /etc/jjelani/jjelani.env; then
  auth_secret="$(sudo sed -n 's/^AUTH_SECRET=//p' /etc/jjelani/jjelani.env | head -n 1)"
fi
if [[ -z "$auth_secret" ]]; then
  auth_secret="$(openssl rand -hex 32)"
fi

cp /tmp/.env "$staged_env"
sed -i \
  -e '/^PERSONAL_DATA_LOCALIZED=/d' \
  -e '/^AUTH_SECRET=/d' \
  -e '/^NODE_ENV=/d' \
  -e '/^HOST=/d' \
  -e '/^PORT=/d' \
  -e '/^DATABASE_PATH=/d' \
  "$staged_env"
printf '%s\n' \
  'PERSONAL_DATA_LOCALIZED=true' \
  'NODE_ENV=production' \
  'HOST=127.0.0.1' \
  'PORT=8787' \
  'DATABASE_PATH=/var/lib/jjelani/jjelani.sqlite' \
  "AUTH_SECRET=${auth_secret}" >> "$staged_env"
sudo install -o root -g root -m 600 "$staged_env" /etc/jjelani/jjelani.env

sudo install -o root -g root -m 644 /tmp/jjelani.service /etc/systemd/system/jjelani.service
sudo install -o root -g root -m 755 "$release_dir/deploy/jjelani-backup" /usr/local/sbin/jjelani-backup
sudo install -o root -g root -m 644 "$release_dir/deploy/jjelani-backup.service" /etc/systemd/system/jjelani-backup.service
sudo install -o root -g root -m 644 "$release_dir/deploy/jjelani-backup.timer" /etc/systemd/system/jjelani-backup.timer
sudo install -o root -g root -m 644 /tmp/nginx-jjelani.conf /etc/nginx/sites-available/jjelani.conf
sudo ln -sfn /etc/nginx/sites-available/jjelani.conf /etc/nginx/sites-enabled/jjelani.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

sudo systemctl daemon-reload
sudo systemctl enable --now jjelani.service
sudo systemctl enable --now jjelani-backup.timer
sudo systemctl restart jjelani.service
sudo systemctl reload nginx.service

rm -f /tmp/jjelani-release.tar.gz /tmp/.env /tmp/jjelani.service /tmp/nginx-jjelani.conf

echo "RELEASE_INSTALLED=${release_id}"
sudo systemctl is-active jjelani.service nginx.service
