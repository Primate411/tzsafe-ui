import LegacyStewardshipNotice from "../components/LegacyStewardshipNotice";
import Meta from "../components/meta";

const Migration = () => {
  return (
    <div className="min-h-content relative flex grow flex-col">
      <Meta title={"Migration guide - TzSafe"} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 text-white sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold">Migrate from TzSafe</h1>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-100">
          TzSafe will keep legacy KT1 multisig wallets usable. New multisig
          setups should move toward protocol-native Tezos multisig accounts when
          the participants, wallets, and signing process are ready.
        </p>

        <div className="mt-6 max-w-3xl">
          <LegacyStewardshipNotice />
        </div>

        <section className="mt-8 max-w-4xl rounded bg-graybg p-5">
          <h2 className="text-2xl font-bold">Recommended path</h2>
          <ol className="mt-4 list-decimal space-y-4 pl-6 leading-7 text-zinc-100">
            <li>
              Create and test the native multisig account with the full signer
              group before moving funds.
            </li>
            <li>
              Import the legacy KT1 TzSafe wallet here and review the balance,
              tokens, owners, and threshold.
            </li>
            <li>
              Move a small test amount first. Confirm every signer understands
              the proposal, signature, and execution flow.
            </li>
            <li>
              Transfer tez, FA1.2 assets, and FA2 assets out through normal
              TzSafe proposals. Check token support for the destination address
              before sending valuable assets.
            </li>
            <li>
              Verify the destination account, wait for confirmations, then
              repeat until the legacy safe is empty.
            </li>
            <li>
              Keep the old safe address and proposal history in your records. Do
              not delete local address-book entries until your team has finished
              reconciliation.
            </li>
          </ol>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded bg-graybg p-5">
            <h2 className="text-xl font-bold">For existing KT1 safes</h2>
            <p className="mt-3 leading-7 text-zinc-100">
              Keep using TzSafe to inspect assets, create proposals, collect
              signatures, execute transfers, and recover funds. This fork is
              maintained so legacy users are not forced into a rushed move.
            </p>
          </div>
          <div className="rounded bg-graybg p-5">
            <h2 className="text-xl font-bold">For new multisig setups</h2>
            <p className="mt-3 leading-7 text-zinc-100">
              Prefer native Tezos multisig accounts for new operations when the
              tooling fits your needs. Native accounts are the direction of the
              protocol and are not dependent on a custom KT1 wallet contract.
            </p>
          </div>
        </section>

        <section className="mt-8 max-w-4xl rounded bg-graybg p-5">
          <h2 className="text-2xl font-bold">References</h2>
          <div className="mt-4 flex flex-col gap-3 text-primary">
            <a
              href="https://docs.tezos.com/tutorials/native-multisig"
              target="_blank"
              rel="noreferrer"
              className="font-bold"
            >
              Tezos native multisig tutorial
            </a>
            <a
              href="https://docs.tezos.com/developing/octez-client/accounts"
              target="_blank"
              rel="noreferrer"
              className="font-bold"
            >
              Tezos account documentation
            </a>
            <a
              href="https://docs.tzsafe.org/"
              target="_blank"
              rel="noreferrer"
              className="font-bold"
            >
              TzSafe documentation
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Migration;
