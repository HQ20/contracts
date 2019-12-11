#!/usr/bin/env sh

# move to subfolder
# cd scripts/geth

# if geth was not started
# [ ! -d "./db/geth" ] && geth --datadir ./db init ../genesis.json
# start geth

geth --dev --rpc --rpcport 8545
# geth \
#     --datadir "./db" \
#     --networkid 5777 \
#     --rpc --rpcport "8545" --rpcaddr 0.0.0.0 --rpccorsdomain "*" \
#     --port 30303 --nodiscover \
#     --rpcapi="admin,db,eth,debug,miner,net,shh,txpool,personal,web3" \
#     --miner.gasprice 0 --miner.gastarget 0 --miner.gaslimit 0 \
#     --allow-insecure-unlock \
#     --miner.etherbase 0x25fc4ed33501e534699a205263d5686d71fa1eb5 \
#     --mine \
#     --unlock 0x25fc4ed33501e534699a205263d5686d71fa1eb5 --password password/main.pass \
#     --ipcdisable \
#     console
