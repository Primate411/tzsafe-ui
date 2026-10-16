import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { prepareIpfsExport } from "./ipfs-export.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      TZSAFE_BUILD_TARGET: "ipfs",
      NEXT_PUBLIC_BASE_PATH: "",
      NEXT_PUBLIC_RPC_URL: "https://us.rpc.tez.capital",
      NEXT_PUBLIC_API_URL: "https://api.tzkt.io",
      NEXT_PUBLIC_NETWORK_TYPE: "mainnet",
    },
  }
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

await prepareIpfsExport(new URL("../out-ipfs/", import.meta.url));
