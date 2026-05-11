import { appendFile, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.argv[2] ?? "out";
const pinataJwt = process.env.PINATA_JWT;

if (!pinataJwt) {
  throw new Error("PINATA_JWT is required to upload the static build to IPFS");
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(fullPath);
      if (entry.isFile()) return [fullPath];
      return [];
    })
  );

  return files.flat();
}

const rootStats = await stat(root);
if (!rootStats.isDirectory()) {
  throw new Error(`${root} must be a directory produced by next build`);
}

const files = await collectFiles(root);
if (files.length === 0) {
  throw new Error(`${root} is empty`);
}

const form = new FormData();
form.append(
  "pinataOptions",
  JSON.stringify({
    cidVersion: 1,
    wrapWithDirectory: true,
  })
);
form.append(
  "pinataMetadata",
  JSON.stringify({
    name: process.env.PINATA_NAME ?? "tzsafe-ui",
    keyvalues: {
      app: "tzsafe",
      domain: "tzsafe.tez",
      source: process.env.GITHUB_REPOSITORY ?? "Primate411/tzsafe-ui",
      commit: process.env.GITHUB_SHA ?? "local",
    },
  })
);

for (const filePath of files) {
  const relativePath = path.relative(root, filePath).split(path.sep).join("/");
  const bytes = await readFile(filePath);

  form.append("file", new Blob([bytes]), relativePath);
}

const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${pinataJwt}`,
  },
  body: form,
});

const body = await response.text();
if (!response.ok) {
  throw new Error(`Pinata upload failed (${response.status}): ${body}`);
}

const result = JSON.parse(body);
const cid = result.IpfsHash;
const contentUrl = `ipfs://${cid}/`;

console.log(`CID=${cid}`);
console.log(`Content URL=${contentUrl}`);
console.log("Tezos Domains URL=https://tzsafe.tez.page/");

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `cid=${cid}\ncontent_url=${contentUrl}\n`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "## TzSafe IPFS publish",
      "",
      `- CID: \`${cid}\``,
      `- Tezos Domains Content URL: \`${contentUrl}\``,
      "- Public URL after the domain record is updated: https://tzsafe.tez.page/",
      "",
    ].join("\n")
  );
}
