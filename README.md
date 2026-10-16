# TzSafe

TzSafe is a website to interact with multi-signatures wallets. The goal is to have a UI layer above the LIGO contracts that you can find [here](https://github.com/marigold-dev/tzsafe).

- This fork is maintained by Primate411 after the original Marigold-hosted service was retired.
- Documentation can be found [here](https://docs.tzsafe.org/).
- Mainnet version of this frontend UI can be found on [tzsafe.tez.page](https://tzsafe.tez.page/).
- TzSafe is now maintained as a legacy KT1 wallet care tool. For new multisig setups, prefer protocol-native Tezos multisig accounts when the signer group and tooling are ready.

## How to develop ?

First, clone the repository:

```bash
git clone https://github.com/Primate411/tzsafe-ui/
```

Then install the dependencies:

```bash
npm i
```

Finally you can develop with:

```bash
npm run dev
```

### How to run

There are two ways to run TzSafe, with or without docker.

#### Docker

```bash
docker build -t tzsafe .
docker run -p 8080:80 tzsafe
```

When building the application you can specify which node and which network you want to use:

```bash
docker build --build-arg="PUBLIC_RPC_URL=https://us.rpc.tez.capital" -t tzsafe .
```

You can override:

- PUBLIC_RPC_URL: the URL of the node you want to use (default: https://us.rpc.tez.capital; https://eu.rpc.tez.capital is also available)
- PUBLIC_API_URL: the URL of a tzkt instance (default: https://api.tzkt.io)
- PUBLIC_NETWORK_TYPE: the type of the network (default: mainnet)

### With NPM

```
npm i
npm run start:mainnet
```

You can override the variable by editing the file `/config/.env.mainnet`

## IPFS test builds

```sh
npm run build:ipfs
npm run check:ipfs
```

This produces a mainnet static build in `out-ipfs/`, with no `/tzsafe-ui`
base path. It does not upload files, deploy GitHub Pages, or update domain records.
The existing GitHub Pages build still uses `out/` and its configured base path.
Next shares its `.next/` build cache between these targets, so run builds sequentially.

The IPFS build generates `_redirects` from the exported Next pages. Static URLs
such as `/import-wallet` and dynamic URLs such as `/KT1…/dashboard` return the
corresponding page with HTTP 200. Next then reads the wallet address from the
browser URL. Both trailing-slash forms are covered; missing assets retain HTTP 404.
This avoids relying on GitHub Pages' custom 404 recovery.

**Gateway requirement:** use a CID subdomain or DNSLink gateway supporting
[IPFS `_redirects`](https://docs.ipfs.tech/how-to/websites-on-ipfs/redirects-and-custom-404s/)
(Kubo 0.16+). A plain `/ipfs/<CID>/` path gateway is not supported by this root-path
build. Before changing `tzsafe.tez`, verify that the tez.page content server's
upstream gateway supports these rewrites. Its checked-in source alone does not
establish the current production gateway configuration.

To test with Kubo, use a separate local IPFS repository and an offline daemon,
then add the contents without publishing them to the network:

```sh
# Set IPFS_PATH to your isolated test repository first.
ipfs add -r --cid-version=1 --quieter out-ipfs
# Open http://<returned-CID>.ipfs.localhost:<gateway-port>/
npm run check:ipfs:gateway -- http://<returned-CID>.ipfs.localhost:<gateway-port>/
```

The gateway check verifies HTML/build identity, clean and trailing-slash routes,
query-bearing requests, routing rules, and missing-path status. Also test in a
browser: open a wallet dashboard directly, refresh it, visit Settings/Proposals/
History, use back/forward, and reconnect your wallet. A new origin has separate
browser storage; existing saved wallets and address-book entries are not copied.
Preparing this build does not implement storage migration.

When a remote test pin is wanted, `PINATA_JWT` plus `npm run deploy:ipfs` uploads
the validated `out-ipfs/` directory and prints its CID. That command makes content
publicly retrievable but does not change the live site or Tezos Domains records.
The IPFS GitHub workflow builds on pushes and only pins on manual dispatch.

## Sandbox

Sandbox enables us to locally run Tezos-node and Tzkt. There are two modes: stateful and stateless. In stateful mode, the data of Tezos-node and the database of Tzkt are preserved when docker compose stops, while in stateless mode, both start from the genesis block.

```bash

# To start stateless node
docker-compose -f docker-compose.stateless.yml up --abort-on-container-exit

# To start stateful node
docker-compose -f docker-compose.stateful.yml up --abort-on-container-exit
```
