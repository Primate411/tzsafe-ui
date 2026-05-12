import Link from "next/link";

type LegacyStewardshipNoticeProps = {
  compact?: boolean;
};

const LegacyStewardshipNotice = ({
  compact = false,
}: LegacyStewardshipNoticeProps) => {
  return (
    <section
      className={`rounded border border-zinc-600 bg-zinc-900 text-white ${
        compact ? "px-4 py-3" : "px-5 py-4"
      }`}
    >
      <p className="text-sm font-bold uppercase text-zinc-300">
        Legacy stewardship mode
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-100">
        TzSafe is maintained so existing KT1 multisig users can keep operating
        safely and migrate at their own pace. For new multisig setups, use
        protocol-native Tezos multisig accounts when your wallet and operational
        process support them.
      </p>
      <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:gap-4">
        <Link href="/migration" className="font-bold text-primary">
          Migration guide
        </Link>
        <a
          href="https://docs.tezos.com/tutorials/native-multisig"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-primary"
        >
          Native multisig docs
        </a>
      </div>
    </section>
  );
};

export default LegacyStewardshipNotice;
