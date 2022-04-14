FROM postgres:14.2

RUN apt-get update && apt-get -y install git build-essential postgresql-server-dev-14
RUN apt-get -y install cron

RUN git clone https://github.com/citusdata/pg_cron.git
RUN cd pg_cron && make && make install

# Commands for backup:
# Make Backup folder 
RUN mkdir /home/backups

#RUN echo "* * * * * echo "Hello world" >> /var/log/cron.log 2>&1\n# An empty line is required at the end of this file for a valid cron file." >> /etc/cron.d/hello-cron
RUN echo "* * * * * pg_dump -U osoc2 osoc2 > /home/backups/osoc2.bak\n# An empty line is required at the end of this file for a valid cron file." >> /etc/cron.d/backup

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/backup

# Create the log file to be able to run tail
RUN touch /var/log/cron.log


#RUN crontab -u postgres -l > mycron
#RUN crontab 
#RUN echo "* * * * * pg_dump -U osoc2 osoc2 > /home/backups/osoc2.bak" > /home/backups/backup
#RUN crontab mycron
#(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/job -with args") | crontab -
#RUN (crontab -l 2>/dev/null; echo "'* * * * * pg_dump -U osoc2 osoc2 > /home/backups/osoc2.bak' > /home/backups/backup") | crontab -
#RUN crontab -l | { cat; echo "* * * * * pg_dump -U osoc2 osoc2 > /home/backups/osoc2.bak" > /home/backups/backup; } | crontab -


RUN cd / && \
        rm -rf /pg_cron && \
        apt-get remove -y git build-essential postgresql-server-dev-11 && \
        apt-get autoremove --purge -y && \
        apt-get clean && \
        apt-get purge

ENV POSTGRES_USER osoc2
ENV POSTGRES_PASSWORD password
# ENV POSTGRES_DB osoc2 # change the value of this if we want another default database name

EXPOSE 5432

ADD startupScripts /docker-entrypoint-initdb.d/

# Apply cron job
RUN crontab /etc/cron.d/backup