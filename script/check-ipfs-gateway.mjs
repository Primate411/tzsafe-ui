import assert from "node:assert/strict";
import { lookup } from "node:dns";
import { readFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import path from "node:path";
import { validateIpfsExport } from "./ipfs-export.mjs";

// This checks HTTP delivery only. Browser hydration, wallet connections and
// transactions need separate testing before changing the live domain.
const walletAddress = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton";
const timeoutMs = 15000;

function requestText(url) {
  return new Promise((resolve, reject) => {
    const request = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = request(
      url,
      {
        signal: AbortSignal.timeout(timeoutMs),
        // Browsers resolve *.localhost without DNS; Node does not on every OS.
        // Resolve that reserved namespace locally while preserving the URL Host.
        lookup(hostname, options, callback) {
          if (hostname === "localhost" || hostname.endsWith(".localhost")) {
            if (options.all) {
              queueMicrotask(() =>
                callback(null, [{ address: "127.0.0.1", family: 4 }])
              );
            } else {
              queueMicrotask(() => callback(null, "127.0.0.1", 4));
            }
          } else {
            lookup(hostname, options, callback);
          }
        },
      },
      response => {
        const chunks = [];
        response.on("data", chunk => chunks.push(chunk));
        response.on("error", reject);
        response.on("end", () =>
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          })
        );
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function nextData(html, label) {
  const match = html.match(
    /<script\b[^>]*\bid="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s
  );
  assert(match, `No Next page data in ${label}`);
  return JSON.parse(match[1]);
}

async function main() {
  assert(
    process.argv[2],
    "Usage: node script/check-ipfs-gateway.mjs <gateway-origin> [export-directory]"
  );
  const origin = new URL(process.argv[2]);
  assert(
    ["http:", "https:"].includes(origin.protocol) &&
      origin.pathname === "/" &&
      !origin.search &&
      !origin.hash &&
      !origin.username &&
      !origin.password,
    "Use an HTTP(S) origin on a working subdomain gateway, such as https://<CID>.ipfs.<gateway-host>/; path gateways are unsupported"
  );
  const { root, redirects } = await validateIpfsExport(
    process.argv[3] ?? "out-ipfs"
  );
  const expectedPages = new Map();
  const cases = [{ pathname: "/", file: "index.html", status: 200 }];

  for (const line of redirects.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const match = line.match(/^(\S+)\s+(\S+)\s+(\d+)$/);
    assert(match, `Unsupported routing rule: ${line}`);
    const [, from, to, status] = match;
    if (status !== "200") continue;
    assert(!from.includes("*"), `Unsupported rewrite pattern: ${from}`);
    const pathname = from.replace(/:[^/]+/g, walletAddress);
    const file = to.replace(/^\//, "");
    cases.push({ pathname, file, status: 200 });
    cases.push({
      pathname: `${pathname}?ipfs_check=one%20two&data=a%2Bb%3D`,
      file,
      status: 200,
    });
  }

  for (const { file } of cases) {
    if (!expectedPages.has(file)) {
      expectedPages.set(
        file,
        nextData(await readFile(path.join(root, file), "utf8"), file)
      );
    }
  }
  cases.push(
    { pathname: "/_redirects", status: 200, body: redirects },
    { pathname: "/_next/static/chunks/ipfs-check-missing.js", status: 404 },
    { pathname: "/ipfs-check-missing/unknown-route", status: 404 }
  );

  async function check(test) {
    const url = new URL(test.pathname, origin);
    // Native requests do not follow redirects: a gateway rewrite must return 200.
    const response = await requestText(url);
    assert.equal(
      response.status,
      test.status,
      `${test.pathname}: expected HTTP ${test.status}, got ${response.status}` +
        (response.headers.location
          ? ` (Location: ${response.headers.location})`
          : "")
    );
    const { body } = response;
    if (test.body !== undefined) {
      assert.equal(body, test.body, `${test.pathname}: wrong routing file`);
    }
    if (test.file) {
      assert(
        response.headers["content-type"]?.includes("text/html"),
        `${test.pathname}: expected HTML content type`
      );
      const actual = nextData(body, test.pathname);
      const expected = expectedPages.get(test.file);
      assert.equal(actual.page, expected.page, `${test.pathname}: wrong page`);
      assert.equal(
        actual.buildId,
        expected.buildId,
        `${test.pathname}: stale or different build`
      );
      assert(!actual.assetPrefix, `${test.pathname}: unexpected asset prefix`);
    }
  }

  // Fail promptly if the supplied origin is unreachable or serves another build.
  await check(cases[0]);
  const failures = [];
  let next = 1;
  await Promise.all(
    Array.from({ length: Math.min(4, cases.length - 1) }, async () => {
      while (next < cases.length) {
        const test = cases[next++];
        try {
          await check(test);
        } catch (error) {
          failures.push(`${test.pathname}: ${error.message}`);
        }
      }
    })
  );
  assert.equal(
    failures.length,
    0,
    `${failures.length} of ${cases.length} HTTP checks failed:\n${failures.join(
      "\n"
    )}`
  );
  console.log(
    `PASS: ${cases.length} HTTP checks at ${origin.origin}: exported page/build mapping, ` +
      "clean and trailing-slash routes, query-bearing requests, routing rules, and missing-path status."
  );
  console.log(
    "Scope: HTTP delivery only; no JavaScript execution, wallet connection, transaction, or live-domain configuration checks."
  );
}

main().catch(error => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
