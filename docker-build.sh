 #!/bin/bash

set -x

docker rmi esimerkki-frontend:prev
docker tag esimerkki-frontend:latest esimerkki-frontend:prev
docker build -t esimerkki-frontend:latest .

set +x
