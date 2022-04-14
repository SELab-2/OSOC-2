#! /bin/bash

for i in 1 2 3 4 5 6 7
do
  filename="testform${i}.json"
  curl "http://localhost:4096/form" -X POST -d @${filename} -H "Content-Type: application/json"
done