#!/bin/zsh

# true/false verb url
function enable() {
  if [[ "$1" = "true" ]]; then
    echo "[Yes](#$2-$3)"
  else
    echo "No"
  fi
}

cat tmp | while read line; do
  endpoint=`echo "$line" | cut -d',' -f1`
  get=`[ $(echo "$line" | grep 'GET') ] && echo "true" || echo "false"`
  post=`[ $(echo "$line" | grep 'POST') ] && echo "true" || echo "false"`
  delete=`[ $(echo "$line" | grep 'DELETE') ] && echo "true" || echo "false"`
  # echo "Endpoint: $endpoint - Support GET? $get - Support POST? $post - Support DELETE? $delete"
  # url=`echo "$endpoint" | tr -d '/<>' | tr ' ' '-'`
  # vget=`enable "$get" "get" "$url"`
  # vpost=`enable "$post" "post" "$url"`
  # vdel=`enable "$delete" "delete" "$url"`

  # echo " \`$endpoint\` | $vget | $vpost | $vdel"

  modname=`echo "$endpoint" | sed 's/</\\\\</g'`
  if [[ $get = true ]]; then echo "### GET $modname"; echo "**Arguments:** TBD  "; echo "**Description:**  "; echo "**Response:**  "; echo "\`\`\`json"; echo "\`\`\`"; fi
  if [[ $post = true ]]; then echo "### POST $modname"; echo "**Arguments:** TBD  "; echo "**Description:**  "; echo "**Response:**  "; echo "\`\`\`json"; echo "\`\`\`"; fi
  if [[ $delete = true ]]; then echo "### DELETE $modname"; echo "**Arguments:** TBD  "; echo "**Description:**  "; echo "**Response:**  "; echo "\`\`\`json"; echo "\`\`\`"; fi
done
