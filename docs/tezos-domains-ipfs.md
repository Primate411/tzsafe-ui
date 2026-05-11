# Publishing TzSafe at tzsafe.tez.page

This fork is configured to build a static TzSafe frontend for Tezos Domains IPFS hosting.

## Build

```sh
NEXT_PUBLIC_RPC_URL=https://mainnet.tezos.marigold.dev/ \
NEXT_PUBLIC_API_URL=https://api.tzkt.io \
NEXT_PUBLIC_NETWORK_TYPE=mainnet \
npm run build
```

The static export is written to `out/`.

## Publish to IPFS

Add a GitHub Actions secret named `PINATA_JWT`, then run the **Build and publish IPFS** workflow manually.

The workflow uploads `out/` to Pinata and prints a Tezos Domains content URL:

```text
ipfs://<CID>/
```

## Configure Tezos Domains

In `app.tezos.domains/domain/tzsafe.tez`, choose **Set up website** in the Decentralized Web section.

Select **Serve content**, paste the workflow output as the Content URL, and save:

```text
ipfs://<CID>/
```

After the record is saved, the frontend should be available at:

```text
https://tzsafe.tez.page/
```
