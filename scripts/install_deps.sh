#!/bin/bash
cd /home/ubuntu/app
if [ ! -f backend/.env ]; then
  cat > backend/.env << EOF
PORT=5000
MONGODB_URL=mongodb://dbadmin:MetaverseWeb123!@metaverse-web-docdb-cluster.cluster-cbsmmceaoln6.ap-south-1.docdb.amazonaws.com:27017/metaversewebdb?ssl=false&authSource=admin&retryWrites=false
JWT_SECRET=changeme_secret_key
JWT_EXPIRE=7d
OPENROUTER_API_KEY=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
EOF
fi
