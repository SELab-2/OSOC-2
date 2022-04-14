#!/usr/bin/env bash
whoami
echo "running backup cron"
service cron status
service cron start