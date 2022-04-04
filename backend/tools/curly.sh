#!/bin/sh

function help() {
    echo " -> CURLY: a simple tool to interact with the OSOC2 backend from CLI <- "
    echo "PS: make sure the dockers are up and running..."
    echo "PS2: make sure to run this from the /backend/ directory..."
    echo ""
    echo "Usage:"
    echo "------"
    echo "Simply follow along with the steps."
    echo "Hint: if you want the curl command only, you can always reply with 'maybe' to the last question..."
    echo "Hint: endpoints start with a '/', and without the '/api/' part"
    echo "Hint: if you're using the 'old' API (without the /api/ prefix), use $1 -no"
}

function main() {
    printf 'Endpoint to access (or -h for help)? '
    read ep
    if [[ $ep = '-h' ]]; then help $1; exit 0; fi
    if [[ $2 = '-no' ]]; then api=''; else api='/api-osoc'; fi

    printf 'HTTP Verb? '
    read verb

    printf 'Session key (leave blank to pass no session key)? '
    read skey
    skey=`printf "$skey" | xargs`
    if [ -z ${skey//[:blank:]} ]; then
      skey=''
    else
      skey="-H \"Authorization: auth/osoc2 $skey\""
    fi

    echo 'You can now pass arguments. Use CTRL-D after you entered the last key-value pair.'
    args=''
    printf 'Key? '
    while read key; do
        printf 'Value? '
        read value
        if [[ $args = '' ]]; then
            args="\"$key\": \"$value\""
        else
            args="$args, \"$key\": \"$value\""
        fi
        printf 'Key? '
    done
    echo ''
    args="'{ $args }'"

    echo "Curl command: \`curl -X \"$verb\" \"http://localhost:4096$api$ep\" -i -d $args $skey -H \"Content-Type: application/json\"\`"
    printf 'Send this curl command (yes/y/no/n/maybe)? '
    read ans
    while [ $ans != 'yes' ] && [ $ans != 'no' ] && [ $ans != 'maybe' ] && [ $ans != 'y' ] && [ $ans != 'n' ]; do
        printf 'Invalid answer. Send this curl command (yes/y/no/n/maybe)? '
        read ans
    done

    if [ $ans = 'y' ] || [ $ans = 'yes' ]; then
        /bin/sh -c "curl -X \"$verb\" \"http://localhost:4096$api$ep\" -i -d $args $skey -H \"Content-Type: application/json\""
    elif [ $ans = 'maybe' ]; then
        printf 'Output file? '
        read f
        echo "#!/bin/sh" >f
        echo curl -X "$verb" "http://localhost:4096$api$ep" -i -d $args $skey -H "Content-Type: application/json" >>f
    fi
}

main $0 $1
