#!/usr/bin/env bash
apt-get -y install cron

# Commands for backup:
# Make Backup folder 
mkdir /home/backups

# Place cron job for backup in cron file
printf "30 0 * * * root docker exec -t osoc-2-db-1 pg_dump -U osoc2 osoc2 > /home/backups/osoc2-$(date +%d).bak\n# An empty line is required at the end of this file for a valid cron file." > /etc/cron.d/backup

# Give execution rights on the cron job
chmod 0644 /etc/cron.d/backup

# Apply cron job
crontab /etc/cron.d/backup
service cron start
service cron status
