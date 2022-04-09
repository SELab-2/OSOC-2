#!/usr/bin/env bash

# use same db as the one from env
dbname="osoc2"

# create custom config
customconf=/var/lib/postgresql/data/custom-conf.conf
echo "" > $customconf
echo "shared_preload_libraries = 'pg_cron'" >> $customconf
echo "cron.database_name = '$dbname'" >> $customconf
chown postgres $customconf
chgrp postgres $customconf

# include custom config from main config
conf=/var/lib/postgresql/data/postgresql.conf
echo "include = '$customconf'" >> $conf

pg_ctl restart
