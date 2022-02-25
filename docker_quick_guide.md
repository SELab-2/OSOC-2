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

## Configuration
Open a terminal and type following commands to set the remote context.
This context is used to push the local code to the server. The code is then deployed on the server.

set the context:
```
 docker context create --docker host=ssh://selab2@sel2-2.ugent.be remote-server
```

Here is `remote-server` the name of the context that we will use to push the local code to our remote server.
You are free to choose another name here (obviously use the name you chose for the commands later in this document)


## Running docker

### GUI
only available for macOS & windows with docker desktop.

### Commandline
for linux, mac & windows

#### Most important commands

list all running containers
```
docker containers ls --all
```

list all images
```
docker images
```

remove docker image (only possible if no container is running that is using this image)
```
docker rmi "image-name"
```
> :warning: This might fail due to conflicts that get created automatically. To remove the image in this case it needs to be forced,use the `-f` flag to do this

start the application **local** in docker (execute in root of project (same directory as `docker-compose.yml`-file))
```
docker-compose up -d --build
```

shut down the **local** application
 - shuts down the containers used in the application
 - removes the containers used in the application
```
docker-compose down
```

start/push the application to the **remote** server (do this in your local terminal (pn needs to be active)
```
docker-compose --context remote-server up -d
```

stop the **remote** application (do this in your local terminal, vpn needs to be active)
```
docker-compuse --context remote-server down
```
> :warning: this will probably throw errors that there was an error while removing, ignore this OR ssh to the server and remove the remaining images manually with `docker rmi "image-name"`

## IDE-related

### Visual Studio Code

#### Extentions
- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
    This allows to see the active images in the docker-extention tab inside vscode (but docker desktop for macOS and windows is better in my opinion)
- [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
    This is used to start up/connect to the docker containers used in the application and to develop in them.
    The green "square" completely in the bottom left of the windows allows you to choose to which container you want to connect