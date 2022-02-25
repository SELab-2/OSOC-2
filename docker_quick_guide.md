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
docker rmi "imageName"
```

start the application in docker (execute in root of project (same directory as `docker-compose.yml`-file))
```
docker-compose up -d --build
```

shut down the application
 - shuts down the containers used in the application
 - removes the containers used in the application
```
docker-compose down
```


## IDE-related

### Visual Studio Code

#### Extentions
- [docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
    This allows to see the active images in the docker-extention tab inside vscode (but docker desktop for macOS and windows is better in my opinion)
- [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
    This is used to start up/connect to the docker containers used in the application and to develop in them.
    The green "square" completely in the bottom left of the windows allows you to choose to which container you want to connect