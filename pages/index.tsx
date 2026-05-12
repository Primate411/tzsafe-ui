import Link from "next/link";
import LegacyStewardshipNotice from "../components/LegacyStewardshipNotice";
import Meta from "../components/meta";

function Home() {
  return (
    <div className="min-h-content relative flex grow flex-col">
      <Meta title={"Welcome - TzSafe"} />

      <div>
        <div>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-white">
              TzSafe legacy wallet care
            </h1>
            <p className="mt-6 w-full text-white lg:w-3/5">
              TzSafe remains available for existing KT1 multisig wallets. Keep
              managing legacy safes here, and use the migration guide when you
              are ready to move to protocol-native Tezos multisig accounts.
            </p>
            <div className="mt-6 max-w-3xl">
              <LegacyStewardshipNotice />
            </div>
          </div>
        </div>
        <main className="grow">
          <div className="mx-auto max-w-7xl pb-6 sm:px-6 lg:px-8">
            <div className="md:py-6">
              <div className="grid min-h-fit gap-8 p-4 md:grid-cols-2 md:p-0">
                <div className="grid min-h-max grid-rows-5 rounded bg-graybg p-4">
                  <div className="row-span-6">
                    <h2 className="text-xl font-extrabold text-white md:text-2xl">
                      Create legacy TzSafe wallet
                    </h2>
                    <p className="md:text-l text-s my-2 break-words font-light text-white md:my-6 md:w-3/4">
                      Only create a KT1 TzSafe contract when you need legacy
                      compatibility. New multisig setups should prefer native
                      Tezos multisig accounts where possible.
                    </p>
                  </div>
                  <Link
                    type="button"
                    href={{ pathname: "/new-wallet" }}
                    className={
                      "text-md row-span-1 w-1/2 max-w-xs items-center justify-self-end rounded bg-primary px-2 py-2 text-center font-medium text-white hover:bg-red-500 hover:outline-none focus:bg-red-500  md:px-1 md:py-1.5 md:text-2xl "
                    }
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    Create
                  </Link>
                </div>
                <div className="grid min-h-max grid-rows-5 rounded bg-graybg p-4">
                  <div className="row-span-6">
                    <h2 className="text-xl font-extrabold text-white md:text-2xl">
                      Import existing TzSafe wallet
                    </h2>
                    <p className="md:text-l text-s my-2 break-words font-light text-white md:my-6 md:w-3/4">
                      Already have a KT1 TzSafe wallet? Load it by address to
                      inspect assets, sign proposals, and migrate carefully.
                    </p>
                  </div>
                  <Link
                    type="button"
                    href={{ pathname: "/import-wallet" }}
                    className={
                      "text-md row-span-1 w-1/2 max-w-xs items-center justify-self-end rounded bg-primary px-2 py-2 text-center font-medium text-white hover:bg-red-500 hover:outline-none focus:bg-red-500 md:px-1 md:py-1.5 md:text-2xl "
                    }
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    Import
                  </Link>
                </div>
                <div className="grid min-h-max grid-rows-5 rounded bg-graybg p-4 md:col-span-2">
                  <div className="row-span-6">
                    <h2 className="text-xl font-extrabold text-white md:text-2xl">
                      Migrate to native multisig
                    </h2>
                    <p className="md:text-l text-s my-2 break-words font-light text-white md:my-6 md:w-3/4">
                      Learn the responsible path: create the new account, move
                      assets out through normal TzSafe proposals, verify, then
                      retire the old safe.
                    </p>
                  </div>
                  <Link
                    type="button"
                    href={{ pathname: "/migration" }}
                    className={
                      "text-md row-span-1 w-1/2 max-w-xs items-center justify-self-end rounded bg-primary px-2 py-2 text-center font-medium text-white hover:bg-red-500 hover:outline-none focus:bg-red-500 md:px-1 md:py-1.5 md:text-2xl "
                    }
                    id="migration-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    Guide
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default Home;
