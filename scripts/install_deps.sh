#!/bin/bash
cd /home/ubuntu/app

if [ ! -f backend/.env ]; then
  cat > backend/.env << EOF
PORT=5000
MONGODB_URL=mongodb://dbadmin:MetaverseWeb123!@metaverse-web-docdb-cluster.cluster-cbsmmceaoln6.ap-south-1.docdb.amazonaws.com:27017/metaversewebdb?ssl=false&authSource=admin&retryWrites=false
JWT_SECRET=changeme_secret_key
EOF
fi

chown -R ubuntu:ubuntu /home/ubuntu/app
