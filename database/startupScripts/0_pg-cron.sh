#!/usr/bin/env bash

# use same db as the one from env
dbname="osoc2"

# create custom config
customconf=/var/lib/postgresql/data/custom-conf.conf
# customconf=/var/lib/postgresql/data/postgresql.conf
echo "" > $customconf
echo "shared_preload_libraries = 'pg_cron'" >> $customconf
echo "cron.database_name = '$dbname'" >> $customconf
chown osoc2 $customconf
chgrp osoc2 $customconf

# include custom config from main config
conf=/var/lib/postgresql/data/postgresql.conf
found=$(grep "include = '$customconf'" $conf)
if [ -z "$found" ]; then
  echo "include = '$customconf'" >> $conf
fi

pg_ctl restart