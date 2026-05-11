import { useEffect, useState } from "react";
import { TZKT_API_URL } from "../context/config";

/**
 * Returns the balance of the given address
 * @param address tz/kt Tezos address
 */
export const useTzktBalance = (address: string | null) => {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    if (!address) {
      setBalance(0);
      return;
    }
    (async () => {
      try {
        const response = await fetch(
          `${TZKT_API_URL}/v1/accounts/${encodeURIComponent(address)}/balance`
        );

        if (response.status === 200) {
          const json: number = await response.json();
          setBalance(json / 1_000_000); // Divided by the XTZ decimal
        } else {
          setBalance(0);
        }
      } catch {
        setBalance(0);
      }
    })();
  }, [address]);

  return balance;
};

/**
 * Token type returned by:
 * https://api.tzkt.io/v1/tokens/balances
 * Only useful fields are typed
 */
type Tzkt_token = {
  contract: {
    address: string;
  };
  token: {
    contract: {
      address: string;
    };
    metadata?: {
      name?: string;
      symbol?: string;
      decimals?: string;
      thumbnailUri?: string; // this is not documented in the Tzkt API
    };
  };
  balance: string;
};

export type Defi = {
  contract: string;
  balance: number;
  symbol: string;
  icon: string;
};

/**
 * Returns Defi Tokens of the given address
 * @param address tz/kt Tezos address
 */
export const useTzktDefiTokens = (address: string | null) => {
  const [defi, setDefi] = useState<Defi[]>([]);

  useEffect(() => {
    if (!address) {
      setDefi([]);
      return;
    }
    (async () => {
      try {
        const response = await fetch(
          `${TZKT_API_URL}/v1/tokens/balances?account=${encodeURIComponent(
            address
          )}&balance.ne=0&limit=1000`
        );
        // Check if the response is a success
        if (response.status !== 200) {
          setDefi([]);
          return;
        }
        const tokens: Array<Tzkt_token> = await response.json();
        // First removes what is not a DeFi token
        const defi = tokens
          .filter(token => {
            return (
              token.token.metadata &&
              token.token.metadata.decimals &&
              token.token.metadata.symbol // If this field is defined then it's a defi token
            );
          })
          .map(token => {
            const contract = token.token.contract.address;
            const decimals: number =
              10 ** Number.parseInt(token.token.metadata?.decimals || "0"); // Should be defined because of filter
            const balance = Number.parseInt(token.balance) / decimals; // the balance is now a float
            const symbol: string = token.token.metadata?.symbol as string; // Checked above to be non null
            const thumbnailUri = token.token.metadata?.thumbnailUri;
            let icon = `https://services.tzkt.io/v1/avatars/${contract}`;
            if (thumbnailUri && thumbnailUri.startsWith("ipfs://")) {
              icon = thumbnailUri.replace("ipfs://", "https://ipfs.io/ipfs/");
            } else if (thumbnailUri && thumbnailUri.startsWith("https://")) {
              icon = thumbnailUri;
            }
            return { contract, balance, symbol, icon };
          })
          .filter(token => Number.isFinite(token.balance) && token.balance > 0);
        setDefi(defi);
      } catch {
        setDefi([]);
      }
    })();
  }, [address]);
  return defi;
};

export type Price = {
  value: number; // A float
  evolution?: number; // evolution of XTZ price over 30 days
};

const quoteKeyByCurrency: Record<string, string> = {
  usd: "quoteUsd",
};

/**
 * Returns information about the price of the XTZ
 * - the current price
 * - the price evolution
 * */
export const useTzktPrice = (currency = "usd") => {
  const [price, setPrice] = useState<Price | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const headResponse = await fetch(`${TZKT_API_URL}/v1/head`);
        if (headResponse.status !== 200) {
          setPrice(null);
          return;
        }
        const headJson = await headResponse.json();
        const value = headJson[quoteKeyByCurrency[currency] ?? "quoteUsd"];

        if (typeof value !== "number") {
          setPrice(null);
          return;
        }

        setPrice({ value, evolution: undefined });
      } catch {
        setPrice(null);
      }
    })();
  }, [currency]);
  return price;
};
