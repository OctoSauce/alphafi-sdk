import {
  getPoolExchangeRate,
  getReceipts,
} from "./sui-sdk/functions/getReceipts"
import {
  // GetPoolEarningsParams,
  // GetPoolEarningsResponse,
  GetUserAlphaMiningEarningsParams,
  GetUserAlphaMiningEarningsResponse,
  // GetCetusPoolEarningsParams,
  // GetCetusPoolEarningsResponse,
} from "./types";
import {
  PoolName,
  // SingleAssetPoolName,
  // DoubleAssetPoolName,
  // SingleAssetPoolAmounts,
  SingleTokenAmounts,
} from "./common/types";
// import { alphafiInceptionTime } from "./common/constants";
import { Decimal } from "decimal.js";
import { fetchAlphaDepositsAndWithdraws } from "./utils/poolEarnings/fetchUsersDepositsAndWithdraws";
import { conf, CONF_ENV } from "./common/constants";

// this goes to sui-alpha-sdk and uses multiUserAlphaPoolEarnings there
// export async function getPoolEarnings(
//   params: GetPoolEarningsParams,
// ): Promise<GetPoolEarningsResponse> {
//   const getPoolEarningsResponse: GetPoolEarningsResponse = {};

//   const now = Date.now();
//   const inception = alphafiInceptionTime;
//   const startTime = params.startTime ? params.startTime : inception;
//   const endTime = params.endTime ? params.endTime : now;
//   if (endTime <= startTime) {
//     throw new Error("startTime must be less than endTime");
//   }

//   const owners: string[] = params.owners
//     ? Array.isArray(params.owners)
//       ? params.owners
//       : [params.owners]
//     : [];

//   const poolNames: PoolName[] = params.poolNames
//     ? Array.isArray(params.poolNames)
//       ? params.poolNames
//       : [params.poolNames]
//     : [];
//   const pools: {
//     alpha?: "ALPHA";
//     navi?: Exclude<SingleAssetPoolName, "ALPHA">[];
//     cetus?: DoubleAssetPoolName[];
//   } = {};
//   for (const poolName of poolNames) {
//     if (poolName === "ALPHA") {
//       pools.alpha = "ALPHA";
//     } else if (poolName.split("-")[0] === "NAVI") {
//       const naviPools = pools.navi ? pools.navi : [];
//       naviPools.push(poolName as Exclude<SingleAssetPoolName, "ALPHA">);
//       pools.navi = naviPools;
//     } else {
//       const cetusPools = pools.cetus ? pools.cetus : [];
//       cetusPools.push(poolName as DoubleAssetPoolName);
//       pools.cetus = cetusPools;
//     }
//   }

//   // for 1 user only
//   if (owners.length === 1) {
//     return getPoolEarningsResponse;
//   }

//   // for some or all users
//   if (pools.alpha) {
//   }

//   if (pools.cetus) {
//     for (const pool of pools.cetus) {
//       if (pool === "ALPHA-SUI") {
//       } else {
//         console.log(`${pool} earnings coming soon`);
//       }
//     }
//   }

//   if (pools.navi) {
//     console.log("Navi Pool earnings coming soon");
//   }

//   return getPoolEarningsResponse;
// }

export async function getUserAlphaMiningEarnings(
  params: GetUserAlphaMiningEarningsParams,
): Promise<GetUserAlphaMiningEarningsResponse> {
  const { owner } = params;
  const alphaExchangeRate = await getPoolExchangeRate("ALPHA");
  if (!alphaExchangeRate)
    throw new Error("error getting Alpha pool exchange rate at the moment");
  const currentHolding = new Decimal(
    (await getReceipts("ALPHA", owner))[0].content.fields.xTokenBalance,
  )
    .mul(alphaExchangeRate)
    .div(1e9);
  const { usersInvestments, usersAlphaMiningRewards, usersWithdraws } =
    await fetchAlphaDepositsAndWithdraws({
      owners: [owner],
      startTime: conf[CONF_ENV].ALPHAFI_INCEPTION_TIME,
      endTime: Date.now(),
      options: { alphaMiningRewards: true, investments: true, withdraws: true },
    });
  const alphaPoolMiningEarnings = {
    tokens: currentHolding
      .sub(new Decimal(usersInvestments![owner]["ALPHA"].tokens))
      .add(new Decimal(usersWithdraws![owner]["ALPHA"].tokens))
      .toString(),
  } as SingleTokenAmounts;
  const otherPoolAlphaMiningEarnings = Object.fromEntries(
    Object.entries(usersAlphaMiningRewards![owner]).map(([key, amount]) => {
      return [key, { tokens: amount }];
    }),
  ) as { [key in Exclude<PoolName, "ALPHA"> | "TOTAL"]: SingleTokenAmounts };
  return {
    alphaPoolMiningEarnings,
    otherPoolAlphaMiningEarnings,
  };
}

// export async function getCetusPoolEarnings(
//   params: GetCetusPoolEarningsParams,
// ): Promise<GetCetusPoolEarningsResponse> {
//   const getCetusPoolEarningsResponse: GetCetusPoolEarningsResponse = {};
//   return getCetusPoolEarningsResponse;
// }
