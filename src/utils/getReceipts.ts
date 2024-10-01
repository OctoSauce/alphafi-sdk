import { SuiObjectResponse } from "@mysten/sui/client";
import { getSuiClient } from "../sui-sdk/client";
import { GetReceiptParams } from "./types";
import { poolInfo } from "../common/maps";

const receiptTypes: { [pool: string]: string } = {};
Object.entries(poolInfo).map(([poolName, info]) => {
  receiptTypes[poolName] = info.receiptType;
});
const suiClient = getSuiClient();

export async function getReceipts(params: GetReceiptParams) {
  const pools: string[] = params.poolNames
    ? params.poolNames
    : [
        "ALPHA",
        "ALPHA-SUI",
        "USDT-USDC",
        "NAVI-USDT",
        "WBTC-USDC",
        "CETUS-SUI",
      ];
  const uniqueStructTypes = new Set(pools.map((pool) => receiptTypes[pool]));
  const matchAnyArray = Array.from(uniqueStructTypes).map((structType) => ({
    StructType: structType,
  }));

  let receipts: SuiObjectResponse[] = [];
  for (const userAddress of params?.owners) {
    let hasNextPage: boolean = true;
    let nextCursor: null | string | undefined = null;
    while (hasNextPage) {
      const res = await suiClient.getOwnedObjects({
        cursor: nextCursor,
        owner: userAddress,
        options: {
          showContent: true,
        },
        filter: {
          MatchAny: matchAnyArray,
        },
      });
      receipts = receipts.concat(res.data);
      nextCursor = res.nextCursor;
      hasNextPage = res.hasNextPage;
    }
  }
  return receipts;
}
