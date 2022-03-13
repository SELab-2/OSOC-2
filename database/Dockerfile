FROM postgres:14.2

ENV POSTGRES_USER osoc2
ENV POSTGRES_PASSWORD password
# ENV POSTGRES_DB osoc2 # change the value of this if we want another default database name

EXPOSE 5432

ADD startupScripts /docker-entrypoint-initdb.d/