# Publishing TzSafe at tzsafe.tez.page

TzSafe has separate static builds for GitHub Pages and IPFS. Publishing an IPFS
build does not deploy GitHub Pages or change Tezos Domains records. Domain changes
are a separate, explicit operation in the Tezos Domains application.

## Build and check IPFS content

```sh
npm run build:ipfs
npm run check:ipfs
```

The build uses mainnet, `https://us.rpc.tez.capital`, and `https://api.tzkt.io`.
It writes `out-ipfs/` with assets rooted at `/`, without the `/tzsafe-ui` base path.
Build targets share Next's `.next/` cache, so run builds sequentially.

The build generates an IPFS `_redirects` file mapping static and dynamic wallet
routes to their exported HTML pages. Direct links such as `/KT1…/dashboard`,
refreshes, and trailing slashes require these HTTP 200 rewrites. The app cannot
rely on GitHub Pages' custom 404 recovery when served by tez.page.

Use a CID subdomain or DNSLink gateway that supports
[IPFS `_redirects`](https://docs.ipfs.tech/how-to/websites-on-ipfs/redirects-and-custom-404s/)
(Kubo 0.16 or newer). A plain `/ipfs/<CID>/` path gateway does not provide the
origin-root routing required by this build.

For a local preview, follow the isolated, offline Kubo instructions in
[README.md](../README.md#ipfs-test-builds). Building and checking files does not
publish them.

## Pin a release

Configure the repository's `PINATA_JWT` Actions secret, then manually run
**Build and publish IPFS** for the intended commit. Pushes run the build job;
only manual dispatch runs the pinning job. The workflow uploads `out-ipfs/` and
saves its CID and proposed `ipfs://<CID>/` content URL as artifacts.

Alternatively, with `PINATA_JWT` set securely in the local environment:

```sh
npm run deploy:ipfs
```

This uploads the validated `out-ipfs/` directory and prints its CID. It makes the
files publicly retrievable, but does not change the live site or domain records.
The returned CID must identify the website directory: `index.html`, `_redirects`,
and `_next/` must be directly beneath it, without an extra `out-ipfs/` directory.
Pinning success alone does not establish that a gateway can serve the release.

## Validate before changing the live domain

Use the exact published CID and the matching export downloaded from the same
workflow run. Use an available recursive subdomain gateway, substituting its
actual hostname and the published CID below:

```sh
npm run check:ipfs:gateway -- https://<CID>.ipfs.<gateway-host>/ out-ipfs
```

This checks exported page/build identity, clean and trailing-slash routes,
query-bearing requests, `_redirects`, and missing-path HTTP status. Also check
that JavaScript, CSS, and images are served from the expected CID. In a browser,
test direct wallet dashboard links, refreshes, Settings, Proposals, History,
back/forward, and wallet connection. A passing HTTP check does not test signing
or transactions.

The [Tezos Domains content-server source](https://gitlab.com/tezos-domains/content-server)
constructs `/ipfs/<CID>/<path>` requests to its configured upstream. That upstream
must redirect to a compatible subdomain gateway, or otherwise support the
required rewrites. The checked-in source does not establish the production
gateway configuration. Validate the real tez.page delivery path using a test
domain when available before moving the live domain.

If `ipfs://<CID>/` delivery cannot resolve the routes, Tezos Domains also supports
an HTTPS content URL. A tested CID origin such as
`https://<CID>.ipfs.<gateway-host>/` can be used in **Serve content** mode. This keeps
`tzsafe.tez.page` in the address bar while proxying the IPFS gateway; it adds a
dependency on that gateway and must pass the same checks. This is a content URL,
not a redirect URL.

The gateway must return the actual files to server-side HTTP requests. A
service-worker gateway that requires browser JavaScript cannot serve as the
content-server's upstream. In particular, do not assume old `dweb.link` examples
remain usable: its [gateway retirement notice](https://gatewaychanges.ipfs.io/)
announces the end of recursive HTTP service on September 21, 2026.

Inspect `Cache-Control` on the domain's HTML responses as well as its assets.
Immutable caching suitable for a CID URL is unsuitable for mutable domain HTML:
it can keep existing browsers on an old release after a CID update. If the proxy
passes through a long-lived immutable policy for HTML, resolve the policy with
the hosting operator before relying on subsequent domain updates to reach users.

## Change Tezos Domains and verify

The [official hosting documentation](https://tezos.domains/en/about/publishing-websites)
describes supported IPFS, IPNS, and HTTP(S) content URLs. In the Tezos Domains
application, open `tzsafe.tez`, select **Set up website**, choose **Serve content**,
and set the validated URL:

```text
web:content_url = ipfs://<CID>/
```

Remove `web:redirect_url` in the same update because it takes priority over
`web:content_url`. Review and sign the domain operation with the authorized owner
wallet. Neither the build scripts nor the publishing workflow writes these
records automatically.

Once the operation is confirmed and served records have refreshed, verify
`https://tzsafe.tez.page/` stays at that origin and repeat the gateway and browser
checks there against the published export. Check the served build identity and
cache policy; an included domain transaction alone is not proof of a working
deployment.

Browser storage belongs to each origin. Saved wallets and address-book entries
from `primate411.github.io` do not automatically appear at `tzsafe.tez.page`.
Users must restore or re-add those entries and reconnect their wallet. On-chain
wallets are unchanged. This build does not implement a storage migration.

## GitHub Pages and rollback

The **Deploy GitHub Pages** workflow continues to build `out/` using:

```text
NEXT_PUBLIC_BASE_PATH=/tzsafe-ui
```

Its URL remains:

```text
https://primate411.github.io/tzsafe-ui/
```

Before cutover, verify that this existing deployment remains reachable and keep
the previous domain records. To restore forwarding, select **Redirect to a
different URL** and restore:

```text
web:redirect_url = https://primate411.github.io/tzsafe-ui/
```

That redirect takes priority even if `web:content_url` remains present. Verify the
result after the owner signs the rollback transaction and the service refreshes
its records. Cached HTML in browsers can delay what returning users see, so
rollback verification must include a fresh browser context and response headers.
