#!/bin/sh

function help() {
    echo " -> DBDUMP: a simple tool to dump the contents of a single table <- "
    echo ""
    echo "PS: make sure your dockers are up!"
    echo ""
    echo "Usage:"
    echo "------"
    echo "  $1 -h"
    echo "    ~> gets this help message"
    echo "  $1 <table-name>"
    echo "    ~> attempts to dump the contents of <table-name> into your terminal"
}

function main() {
    if [ "$1" = '-h' ]; then help "$0"; return 0; fi

    id=`docker ps | grep 'osoc-2-db-1' | cut -d' ' -f1`
    docker exec -it $id /bin/sh -c "psql -U osoc2 -c \"table $2;\""
}

main $0 $1
