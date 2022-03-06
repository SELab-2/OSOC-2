# Docker/Docker-compose

## Installation

### MacOS & Windows
Install docker desktop.
- [mac](https://docs.docker.com/desktop/mac/install/)
- [windows](https://docs.docker.com/desktop/windows/install/)
    - make sure WSL2 is enabled to be able to run linux-containers.

### Linux
Install [docker-Engine](https://docs.docker.com/engine/install/) & [docker-compose](https://docs.docker.com/compose/install/)

To execute docker in linux without `sudo`: https://docs.docker.com/engine/install/linux-postinstall/

## Configuration to push to remote server
Open a terminal and type following commands to set the remote context.
This context is used to push the local code to the server. The code is then deployed on the server.

set the context:
```
 docker context create --docker host=ssh://selab2@sel2-2.ugent.be remote-server
```

Here is `remote-server` the name of the context that we will use to push the local code to our remote server.
You are free to choose another name here (obviously use the name you chose for the commands later in this document).


## Running docker

### GUI
only available for macOS & windows with docker desktop.

### Commandline
for linux, mac & windows

#### Most important commands

list all running containers (shows their name, container ID,...)
```
docker container ls --all
```

list all images
```
docker images
```

remove unused images (will not remove images that have conflicts and that will need to be force removed)
```
docker image prune
```

remove docker image (only possible if no container is running that is using this image)
```
docker rmi "image-name"
```
> :warning: This might fail due to conflicts that get created automatically. To remove the image in this case it needs to be forced,use the `-f` flag to do this

start the application in **local** docker containers (execute in root of project (same directory as `docker-compose.yml`-file))
```
docker-compose up -d --build
```

start the application **WITH DEBUGGER PORTS OPEN** in **local** docker container
:warning: try to not run this on the remote server for security reasons
```
docker-compose -f "docker-compose.debug.yml"  up -d --build
```

shut down the **local** application
 - shuts down the containers used in the application
 - removes the containers used in the application
```
docker-compose down
```

start/push the application to the **remote** server (do this in your local terminal (vpn needs to be active)
```
docker-compose --context remote-server up -d --build
```

stop the **remote** application (do this in your local terminal, vpn needs to be active)
```
docker-compose --context remote-server down
```
> :warning: this will probably throw errors that there was an error while removing, ignore this OR ssh to the server and remove the remaining images manually with `docker rmi "image-name"`



## IDE-related

### Visual Studio Code
The debugger scripts for vscode are located in `.vscode/launcher.json`. there are 3 scripts:
- `Docker: backend`
- `Docker: frontend-server`
- `Docker: frontend-client`

###### Usage
1. Start the application in the docker containers by running the docker-compose file **WITH DEBUGGING ENABLED**
2. Run the appropriate debugger script:
    - `Docker: backend`: connect the debugger to the backend container and debug the code there.
    - `Docker: frontend-server`: connect the debugger to the frontend container and debug the code there.
    - `Docker: frontend-client`: automatically open a browser to the correct port on localhost to see the website.



### Webstorm
Define debug configurations following [this](https://www.developers-notebook.com/development/debugging-node-js-in-a-docker-container-with-webstorm/) small tutorial.

1.  - For the frontend the debugger port is `9119`
    - For the backend the debugger port is `9229`
    - Optionally: if you want a debugger that automatically opens a browser, make such a new preset and use the launch-script option to add a browser (port to connect to the frontend is `3000`)
2. check the box `Reconnect automatically`


Give the debugger presets a name to make it clear to yourself which debugger you are running :smiley:.

###### Usage
1. Start the application in the docker containers by running the docker-compose file **WITH DEBUGGING ENABLED**
2. start the right debugger

## Connect the containers in the application
The containers can reach each other with their respective hostname out of the `docker-compose.yml` file.
In our case these host names are:
- `db` (for the database)
- `frontend` (for frontend)
- `backend` (for backend)

A short tutorial with extra information can be found [here](https://www.youtube.com/watch?v=A9bA5HpOk30)


## Database

### Postgres startup scripts
The startup scripts **ONLY** get executed if the volume that is used by the database is completely empty.
This means that if you change something in the startup scripts and want to test it. You need to remove the volume manually (in CLI of docker desktop GUI),
then you can start te container and the scripts will execute.

:warning: the scripts get executed in alphabetical order, more info [here](https://hub.docker.com/_/postgres) under "initialization scripts"

### connecting manually

To check the database manually you need to connect a shell the the docker container.
- GUI: go to containers/apps, select the right container and then press the button "CLI"
- CLI: `docker exec -it "CONTAINER ID" /bin/sh` OR `docker exec -it "CONTAINER NAME" /bin/sh`

Once your terminal is connected with the container you can start up psql with:
```
psql -U osoc2
```
This means that we login into psql with the usor "osoc2". This user is created by default when starting up the docker container.

If you need the password of the osoc2 user in the database: the password is `password`.
I haven't needed this password yet, but it's here just in case.