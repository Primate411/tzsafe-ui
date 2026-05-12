# Publishing TzSafe at tzsafe.tez.page

This fork is configured to build a static TzSafe frontend for Tezos Domains hosting. IPFS is the more decentralized route; GitHub Pages is the simpler hosted route.

## Build

```sh
NEXT_PUBLIC_RPC_URL=https://us.rpc.tez.capital \
NEXT_PUBLIC_API_URL=https://api.tzkt.io \
NEXT_PUBLIC_NETWORK_TYPE=mainnet \
npm run build
```

The static export is written to `out/`.

Use `https://eu.rpc.tez.capital` instead if the EU endpoint is preferable for your hosting location.

## Host on GitHub Pages

The **Deploy GitHub Pages** workflow builds the app with:

```text
NEXT_PUBLIC_BASE_PATH=/tzsafe-ui
```

That makes the static export work at:

```text
https://primate411.github.io/tzsafe-ui/
```

Use this URL in Tezos Domains if you want GitHub Pages as the host.

## Publish to IPFS

Add a GitHub Actions secret named `PINATA_JWT`, then run the **Build and publish IPFS** workflow manually.

The workflow uploads `out/` to Pinata and prints a Tezos Domains content URL:

```text
ipfs://<CID>/
```

## Configure Tezos Domains

In `app.tezos.domains/domain/tzsafe.tez`, choose **Set up website** in the Decentralized Web section.

For IPFS hosting, select **Serve content**, paste the workflow output as the Content URL, and save:

```text
ipfs://<CID>/
```

For GitHub Pages forwarding, select **Redirect to a different URL** and use:

```text
https://primate411.github.io/tzsafe-ui/
```

You can also try **Serve content** with the same GitHub Pages URL if you want `tzsafe.tez.page` to stay in the browser address bar, but redirect mode is the safer GitHub Pages setup because the app is built for the `/tzsafe-ui/` project path.

After the record is saved, the frontend should be available at:

```text
https://tzsafe.tez.page/
```
