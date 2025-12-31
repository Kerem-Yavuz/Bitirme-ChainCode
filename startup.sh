#!/bin/sh

# Hata olursa dur
set -e

echo "--> Container Başlatılıyor..."
echo "--> ID: $CHAINCODE_ID"
echo "--> ADRES: $CHAINCODE_SERVER_ADDRESS"

if [ -z "$CHAINCODE_ID" ]; then
    echo "HATA: CHAINCODE_ID environment variable'ı set edilmemiş!"
    exit 1
fi

if [ -z "$CHAINCODE_SERVER_ADDRESS" ]; then
    export CHAINCODE_SERVER_ADDRESS="0.0.0.0:9999"
fi

# NPM veya package.json scripti KULLANMIYORUZ.
# Direkt binary'i çağırıp parametreleri biz veriyoruz.
echo "--> Fabric Sunucusu Başlatılıyor..."
exec ./node_modules/.bin/fabric-chaincode-node server --chaincode-id="$CHAINCODE_ID" --chaincode-address="$CHAINCODE_SERVER_ADDRESS"