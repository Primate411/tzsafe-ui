import { Defi } from "../../utils/tzktHooks";
import { TryImg } from "../TryImg";

type AssetsProps = {
  tokens: Defi[];
};

const Assets = ({ tokens }: AssetsProps) => {
  return (
    <>
      <div className="mt-6 text-xl">Assets</div>
      <div className="max-h-[320px] overflow-y-auto">
        {tokens.map((token, i) => {
          return (
            <div key={i} className="mt-2 flex">
              <TryImg
                src={token.icon}
                alt={`${token.symbol} token icon`}
                className="h-6 w-6"
              />
              <span className="ml-2 font-light">
                {token.balance.toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}
              </span>
              <span className="ml-2 font-light">{token.symbol}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Assets;
