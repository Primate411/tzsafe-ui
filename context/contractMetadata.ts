import { buf2hex } from "@/utils/taquitoCompat";
import { MichelsonMap } from "@taquito/taquito";

export default async function buildContractMetadata(meta: any): Promise<{
  metadata: MichelsonMap<any, unknown>;
}> {
  const content = JSON.stringify(meta);

  return {
    metadata: MichelsonMap.fromLiteral({
      "": buf2hex(Buffer.from("tezos-storage:content")),
      content: buf2hex(Buffer.from(content)),
    }),
  };
}
