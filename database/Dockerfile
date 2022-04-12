FROM postgres:14.2

RUN apt-get update && apt-get -y install git build-essential postgresql-server-dev-14

RUN git clone https://github.com/citusdata/pg_cron.git
RUN cd pg_cron && make && make install

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