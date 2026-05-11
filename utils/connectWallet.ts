import { Dispatch } from "react";
import { action, tezosState } from "../context/state";

export const connectWallet = async (
  state: tezosState,
  dispatch: Dispatch<action>
): Promise<void> => {
  if (!state.beaconWallet) return;

  await state?.beaconWallet!.requestPermissions();

  const userAddress: string = await state?.beaconWallet!.getPKH()!;
  const balance = await state?.connection.tz.getBalance(userAddress);
  let s = await state?.beaconWallet!.client.getActiveAccount();
  dispatch!({
    type: "login",
    // TODO: Fix
    // @ts-ignore
    accountInfo: s!,
    address: userAddress,
    balance: balance!.toString(),
  });
};
