import { validateAddress, ValidationResult } from "@/utils/taquitoCompat";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BeaconEvent, BeaconWallet } from "@taquito/beacon-wallet";
import { LocalStorage, NetworkType } from "@tezos-x/octez.connect-sdk";
import type { AppProps } from "next/app";
import Head from "next/head";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useReducer, useEffect, useState } from "react";
import LoginModal from "../components/LoginModal";
import PoeModal from "../components/PoeModal";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Footer from "../components/footer";
import NavBar from "../components/navbar";
import P2PClient from "../context/P2PClient";
import { AliasesProvider } from "../context/aliases";
import { PREFERED_NETWORK, RPC_URL } from "../context/config";
import {
  tezosState,
  action,
  reducer,
  emptyState,
  init,
  AppStateContext,
  AppDispatchContext,
  contractStorage,
} from "../context/state";
import "../styles/globals.css";
import { fetchContract } from "../utils/fetchContract";

export default function App({ Component, pageProps }: AppProps) {
  const [state, dispatch]: [tezosState, React.Dispatch<action>] = useReducer(
    reducer,
    emptyState()
  );

  const [isFetching, setIsFetching] = useState(true);
  const [hasSidebar, setHasSidebar] = useState(false);
  const [data, setData] = useState<undefined | string>();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!path) return;

    const queryParams = new URLSearchParams(window.location.search);

    const isPairing = queryParams.has("type") && queryParams.has("data");

    if (isPairing) {
      setData(queryParams.get("data")!);
    }

    const contracts = Object.keys(state.contracts);

    if ((path === "/" || path === "") && contracts.length > 0) {
      const contract = contracts[0];

      router.replace(`/${contract}/dashboard`);
      return;
    } else if (path === "/" || path === "") {
      // Get rid of query in case it comes from beacon
      router.replace("/");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.currentContract,
    path,
    state.attemptedInitialLogin,
    state.contracts,
  ]);

  useEffect(() => {
    (async () => {
      if (
        router.pathname.includes("[walletAddress]") &&
        !router.query.walletAddress
      )
        return;

      if (
        !router.query.walletAddress ||
        Array.isArray(router.query.walletAddress) ||
        (router.query.walletAddress === state.currentContract &&
          !!state.currentStorage)
      ) {
        setIsFetching(false);
        return;
      }

      if (!!state.contracts[router.query.walletAddress]) {
        dispatch({
          type: "setCurrentContract",
          payload: router.query.walletAddress,
        });
        setIsFetching(false);
        return;
      }

      if (
        validateAddress(router.query.walletAddress) !== ValidationResult.VALID
      ) {
        setIsFetching(false);
        router.replace(
          `/invalid-contract?address=${router.query.walletAddress}`
        );
        return;
      }

      if (state.currentStorage?.address === router.query.walletAddress) {
        setIsFetching(false);
        return;
      }

      try {
        const storage = await fetchContract(
          state.connection,
          router.query.walletAddress
        );

        if (!storage) {
          setIsFetching(false);
          router.replace(
            `/invalid-contract?address=${router.query.walletAddress}`
          );
          return;
        }

        storage.address = router.query.walletAddress;

        dispatch({
          type: "setCurrentStorage",
          payload: storage as contractStorage & { address: string },
        });

        dispatch({
          type: "setCurrentContract",
          payload: router.query.walletAddress,
        });

        setIsFetching(false);
      } catch (e) {
        setIsFetching(false);

        router.replace(
          `/invalid-contract?address=${router.query.walletAddress}`
        );
      }
    })();
  }, [
    router.query.walletAddress,
    state.currentContract,
    dispatch,
    router,
    state.currentStorage,
    state.connection,
    state.contracts,
  ]);
  useEffect(() => {
    (async () => {
      if (state!.beaconWallet === null) {
        let a = init();
        dispatch({ type: "init", payload: a });

        const wallet = new BeaconWallet({
          name: "TzSafe",
          network: {
            type: PREFERED_NETWORK,
            rpcUrl: RPC_URL,
          },
          storage: new LocalStorage("WALLET"),
        });

        await wallet.client.subscribeToEvent(
          BeaconEvent.ACTIVE_ACCOUNT_SET,
          () => {}
        );

        dispatch!({ type: "beaconConnect", payload: wallet });

        if (state.attemptedInitialLogin) return;

        const activeAccount = await wallet.client.getActiveAccount();
        if (activeAccount && state?.accountInfo == null) {
          const userAddress = await wallet.getPKH();
          const balance = await state?.connection.tz.getBalance(userAddress);
          dispatch({
            type: "login",
            // TODO: FIX
            //@ts-ignore
            accountInfo: activeAccount!,
            address: userAddress,
            balance: balance!.toString(),
          });
        } else {
          dispatch({
            type: "setAttemptedInitialLogin",
            payload: true,
          });
        }
      }
    })();
  }, [state.beaconWallet]);

  useEffect(() => {
    (async () => {
      if (state.p2pClient !== null) return;

      const hasConnectedDapps = Object.values(state.connectedDapps).some(
        dapps => Object.keys(dapps).length > 0
      );
      const isBeaconRoute = path?.endsWith("/beacon") ?? false;
      const shouldConnectP2P = !!data || isBeaconRoute || hasConnectedDapps;

      if (!shouldConnectP2P) return;

      const p2pClient = new P2PClient({
        name: "TzSafe",
        storage: new LocalStorage("P2P"),
      });

      await p2pClient.init();
      await p2pClient.connect(p2pClient.handleMessages);

      // Connect stored peers only when the wallet side of TzSafe is needed.
      Object.entries(state.connectedDapps).forEach(async ([address, dapps]) => {
        Object.values(dapps).forEach(data => {
          p2pClient
            .addPeer(data)
            .catch(_ => console.log("Failed to connect to peer", data));
        });
      });

      dispatch!({ type: "p2pConnect", payload: p2pClient });
    })();
  }, [data, path, state.connectedDapps, state.p2pClient]);

  useEffect(() => {
    setHasSidebar(false);
  }, [path]);

  const isSidebarHidden =
    Object.values(state.contracts).length === 0 &&
    (path === "/" ||
      path === "/new-wallet" ||
      path === "/import-wallet" ||
      path === "/address-book");

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href={`${router.basePath}/favicon.ico`} />
      </Head>
      <AppStateContext.Provider value={state}>
        <AppDispatchContext.Provider value={dispatch}>
          <AliasesProvider aliasesFromState={state.aliases}>
            <div className="relative min-h-screen">
              <div id="modal" />
              {!!data && (
                <LoginModal
                  data={data}
                  onEnd={() => {
                    setData(undefined);
                  }}
                />
              )}
              <PoeModal />
              <NavBar />

              {isSidebarHidden ? null : (
                <Sidebar
                  isOpen={hasSidebar}
                  onClose={() => setHasSidebar(false)}
                  isLoading={isFetching}
                />
              )}

              <div
                className={`pb-28 pt-20 ${isSidebarHidden ? "" : "md:pl-72"}`}
              >
                <button
                  className="ml-4 mt-4 flex items-center space-x-2 text-zinc-300 md:hidden"
                  onClick={() => {
                    setHasSidebar(true);
                  }}
                >
                  <span className="text-xs">Open sidebar</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>

                {isFetching || !state.attemptedInitialLogin ? (
                  <div className="mt-12 flex w-full items-center justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <Component {...pageProps} />
                )}
              </div>
              <Footer shouldRemovePadding={isSidebarHidden} />
            </div>
          </AliasesProvider>
        </AppDispatchContext.Provider>
      </AppStateContext.Provider>
    </>
  );
}
