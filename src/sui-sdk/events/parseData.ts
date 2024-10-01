import {
  CetusLiquidityChangeEvent,
  NaviLiquidityChangeEvent,
  AlphaLiquidityChangeEvent,
  LiquidityChangeEventNode,
  CommonEventAttributes,
  ParseInvestmentsfromDepositEventsParams,
  ParseAlphaRewardsFromDepositEventsParams,
  ParseWithdrawsFromWithdrawEventsParams,
  ParseInvestmentsFromLCEventsParams,
  ParseAlphaRewardsFromLCEventsParams,
} from "./types";
import { poolIdPoolNameMap, poolInfo } from "../../common/maps";
import {
  UsersInvestmentsInPools,
  UsersCollectedAlphaRewards,
  UsersWithdrawsFromPools,
} from "../../utils/poolEarnings/types";
import Decimal from "decimal.js";
import {
  SingleTokenAmounts,
  PoolName,
  SingleAssetPoolAmounts,
} from "../../common/types";

export function parseInvestmentsfromDepositEvents(
  params: ParseInvestmentsfromDepositEventsParams,
): UsersInvestmentsInPools {
  let usersInvestmentsInPools: UsersInvestmentsInPools = {};

  if (params.poolNames.some((poolName) => poolName !== "ALPHA")) {
    throw new Error(
      "Investments from Deposit Events only supported for ALPHA yet",
    );
  }

  for (const node of params.events) {
    if (node.txModule !== "alphapool") {
      continue;
    }
    const owner = node.sender;
    const investment = new Decimal(node.amount_deposited).div(1e9);
    if (owner in usersInvestmentsInPools) {
      const prevInvestment = (
        usersInvestmentsInPools[owner] as SingleAssetPoolAmounts
      ).ALPHA as SingleTokenAmounts;
      const newInvestment = new Decimal(prevInvestment.tokens)
        .add(investment)
        .toString();
      (usersInvestmentsInPools[owner] as SingleAssetPoolAmounts).ALPHA = {
        tokens: newInvestment,
      } as SingleTokenAmounts;
    } else {
      // This might fail
      usersInvestmentsInPools[owner]["ALPHA"] = {
        tokens: investment.toString(),
      };
    }
  }

  if (params.owners.length === 0) {
    return usersInvestmentsInPools;
  }
  usersInvestmentsInPools = Object.fromEntries(
    params.owners
      .filter((owner) => owner in usersInvestmentsInPools)
      .map((owner) => [owner, usersInvestmentsInPools[owner]]),
  );
  return usersInvestmentsInPools;
}

export function parseWithdrawsFromWithdrawEvents(
  params: ParseWithdrawsFromWithdrawEventsParams
): UsersWithdrawsFromPools {
  let usersWithdrawsFromPools: UsersWithdrawsFromPools = {};

  if (params.poolNames.some((poolName) => poolName !== "ALPHA")) {
    console.error(
      "Withdraws from Withdraw Events only supported for ALPHA yet",
    );
  }

  for (const node of params.events) {
    if (node.txModule !== "alphapool") {
      continue;
    }
    const owner = node.sender;
    const withdraw = new Decimal(node.amount_to_withdraw).div(1e9);
    if (owner in usersWithdrawsFromPools) {
      const prevWithdraws = (
        usersWithdrawsFromPools[owner] as SingleAssetPoolAmounts
      ).ALPHA as SingleTokenAmounts;
      const newWithdraws = new Decimal(prevWithdraws.tokens)
        .add(withdraw)
        .toString();
      (usersWithdrawsFromPools[owner] as SingleAssetPoolAmounts).ALPHA = {
        tokens: newWithdraws,
      } as SingleTokenAmounts;
    } else {
      usersWithdrawsFromPools[owner]["ALPHA"] = { tokens: withdraw.toString() };
      // usersWithdrawsFromPools[owner] = {
      //   ALPHA: { tokens: withdraw.toString() },
      // } as SingleAssetPoolAmounts;
    }
  }

  if (params.owners.length === 0) {
    return usersWithdrawsFromPools;
  }
  usersWithdrawsFromPools = Object.fromEntries(
    params.owners
      .filter((owner) => owner in usersWithdrawsFromPools)
      .map((owner) => [owner, usersWithdrawsFromPools[owner]]),
  );
  return usersWithdrawsFromPools;
}

export function parseHoldersFromLCEvents(events: LiquidityChangeEventNode[]) {
  const holders: Set<string> = new Set<string>();
  for (const event of events) {
    holders.add(event.sender);
  }
  return Array.from(holders);
}

// From descending order events
export function parseXTokensFromLCEvent(events: LiquidityChangeEventNode[]) {
  let userXTokens: [string, string, string][] = [];
  const ownerPoolTokensMap: { [owner_pool: string]: string } = {};
  for (const event of events) {
    const sender = event.sender;
    const xTokens = event.user_total_x_token_balance;
    const pool = poolIdPoolNameMap[event.pool_id];
    const key = `${sender}_${pool}`;
    if (!ownerPoolTokensMap[key]) {
      ownerPoolTokensMap[key] = xTokens;
    }
  }
  userXTokens = Object.entries(ownerPoolTokensMap).map(
    ([owner_pool, xToken]) => {
      return [owner_pool.split("_")[0], owner_pool.split("_")[1], xToken];
    },
  );
  return userXTokens;
}

/*
this function takes the deposits coming from other modules
checks the transaction digests for each of the event
finds out the pool that it came from using the input objects from the transactions
uses that to create the mapping
returs each users collected rewards from each pool
*/
export function parseAlphaRewardsFromDepositEvents(
  params: ParseAlphaRewardsFromDepositEventsParams,
): UsersCollectedAlphaRewards {
  let usersCollectedAlphaRewards: UsersCollectedAlphaRewards = {};

  for (const node of params.events) {
    if (node.type !== poolInfo["ALPHA"].depositEventType) {
      console.error(
        "parseAlphaRewardsFromDepositEvents expects only alphapool deposit events",
      );
      continue;
    }
    if (node.txModule === "alphapool") {
      continue;
    }
    const owner = node.sender;
    const reward = new Decimal(node.amount_deposited).div(1e9);

    // TODO add mapping, this is total collected rewards, filter based on user's ask (poolNames)
    if (owner in usersCollectedAlphaRewards) {
      const prevReward = usersCollectedAlphaRewards[owner]["TOTAL"];
      usersCollectedAlphaRewards[owner]["TOTAL"] = reward
        .add(new Decimal(prevReward))
        .toString();
    } else {
      usersCollectedAlphaRewards[owner] = {
        TOTAL: reward.toString(),
      } as { [key in Exclude<PoolName, "ALPHA"> | "TOTAL"]: string };
    }
  }

  usersCollectedAlphaRewards = Object.fromEntries(
    params.owners
      .filter((owner) => owner in usersCollectedAlphaRewards)
      .map((owner) => [owner, usersCollectedAlphaRewards[owner]]),
  );

  return usersCollectedAlphaRewards;
}

export function parseInvestmentsFromLCEvents(
  params: ParseInvestmentsFromLCEventsParams,
): UsersInvestmentsInPools {
  let usersInvestmentsInPools: UsersInvestmentsInPools = {};

  if (params.poolNames.some((poolName) => poolName !== "ALPHA")) {
    console.error(
      "Investments from Liquidity Change Events only supported for ALPHA yet",
    );
  }

  for (const node of params.events) {
    if (isAlphaLCEventNode(node)) {
      if (node.txModule !== "alphapool") {
        // this is collect reward
        continue;
      }
      if (node.event_type !== 0) {
        // this is withdraw
        continue;
      }
      const owner = node.sender;
      const investment = new Decimal(node.amount).div(1e9);
      if (owner in usersInvestmentsInPools) {
        const prevInvestment = (
          usersInvestmentsInPools[owner] as SingleAssetPoolAmounts
        ).ALPHA as SingleTokenAmounts;
        const newInvestment = new Decimal(prevInvestment.tokens)
          .add(investment)
          .toFixed(5)
          .toString();
        (usersInvestmentsInPools[owner] as SingleAssetPoolAmounts).ALPHA = {
          tokens: newInvestment,
        } as SingleTokenAmounts;
      } else {
        usersInvestmentsInPools[owner]["ALPHA"] = {
          tokens: investment.toFixed(5).toString(),
        };
        // usersInvestmentsInPools[owner] = {
        //   ALPHA: { tokens: investment.toFixed(5).toString() },
        // } as SingleAssetPoolAmounts;
      }
    } else if (isCetusLCEventNode(node)) {
      // TODO add investment functionality for cetus pools
      continue;
    } else if (isNaviLCEventNode(node)) {
      // TODO add investment functionality for navi pools
      continue;
    }
  }

  if (params.owners.length === 0) {
    return usersInvestmentsInPools;
  }
  usersInvestmentsInPools = Object.fromEntries(
    params.owners
      .filter((owner) => owner in usersInvestmentsInPools)
      .map((owner) => [owner, usersInvestmentsInPools[owner]]),
  );
  return usersInvestmentsInPools;
}

// Similar to parseAlphaRewardsFromDepositEvents
export function parseAlphaRewardsFromLCEvents(
  params: ParseAlphaRewardsFromLCEventsParams,
): UsersCollectedAlphaRewards {
  let usersCollectedAlphaRewards: UsersCollectedAlphaRewards = {};

  for (const node of params.events) {
    if (isAlphaLCEventNode(node)) {
      if (node.txModule === "alphapool") {
        // this is user deposit
        continue;
      }
      const owner = node.sender;
      const reward = new Decimal(node.amount).div(1e9);
      // TODO add mapping
      if (owner in usersCollectedAlphaRewards) {
        const prevReward = usersCollectedAlphaRewards[owner]["TOTAL"];
        const newReward = new Decimal(prevReward).add(reward).toString();
        usersCollectedAlphaRewards[owner]["TOTAL"] = newReward;
      } else {
        usersCollectedAlphaRewards[owner] = {
          TOTAL: reward.toFixed(5).toString(),
        } as { [key in Exclude<PoolName, "ALPHA"> | "TOTAL"]: string };
      }
    } else if (isCetusLCEventNode(node)) {
      continue;
    } else if (isNaviLCEventNode(node)) {
      continue;
    }
  }

  usersCollectedAlphaRewards = Object.fromEntries(
    params.owners
      .filter((owner) => owner in usersCollectedAlphaRewards)
      .map((owner) => [owner, usersCollectedAlphaRewards[owner]]),
  );

  return usersCollectedAlphaRewards;
}

export function parseWithdrawsFromLCEvents(params: {
  poolNames: PoolName[];
  owners: string[];
  events: LiquidityChangeEventNode[];
}): UsersWithdrawsFromPools {
  let usersWithdrawsFromPools: UsersWithdrawsFromPools = {};

  if (params.poolNames.some((poolName) => poolName !== "ALPHA")) {
    console.error(
      "Withdraws from Liquidity Change Events only supported for ALPHA yet",
    );
  }

  for (const node of params.events) {
    if (isAlphaLCEventNode(node)) {
      if (node.txModule !== "alphapool") {
        // this is collect reward
        continue;
      }
      if (node.event_type !== 1) {
        // this is deposit
        continue;
      }
      const owner = node.sender;
      const withdraw = new Decimal(node.amount).div(1e9);
      if (owner in usersWithdrawsFromPools) {
        const prevWithdraw = (
          usersWithdrawsFromPools[owner] as SingleAssetPoolAmounts
        ).ALPHA as SingleTokenAmounts;
        const newWithdraw = new Decimal(prevWithdraw.tokens)
          .add(withdraw)
          .toFixed(5)
          .toString();
        (usersWithdrawsFromPools[owner] as SingleAssetPoolAmounts).ALPHA = {
          tokens: newWithdraw,
        } as SingleTokenAmounts;
      } else {
        usersWithdrawsFromPools[owner]["ALPHA"] = { tokens: withdraw.toFixed(5).toString() }
      }
    } else if (isCetusLCEventNode(node)) {
      // TODO add investment functionality for cetus pools
      continue;
    } else if (isNaviLCEventNode(node)) {
      // TODO add investment functionality for navi pools
      continue;
    }
  }

  if (params.owners.length === 0) {
    return usersWithdrawsFromPools;
  }
  usersWithdrawsFromPools = Object.fromEntries(
    params.owners
      .filter((owner) => owner in usersWithdrawsFromPools)
      .map((owner) => [owner, usersWithdrawsFromPools[owner]]),
  );
  return usersWithdrawsFromPools;
}

function isCetusLCEventNode(
  event: LiquidityChangeEventNode,
): event is CetusLiquidityChangeEvent & CommonEventAttributes {
  return "amount_a" in event && "amount_b" in event;
}
function isNaviLCEventNode(
  event: LiquidityChangeEventNode,
): event is NaviLiquidityChangeEvent & CommonEventAttributes {
  return (
    !("amount_a" in event) && !("amount_b" in event) && "fee_collected" in event
  );
}
function isAlphaLCEventNode(
  event: LiquidityChangeEventNode,
): event is AlphaLiquidityChangeEvent & CommonEventAttributes {
  return (
    !("amount_a" in event) && !("amount_b" in event) && "fee_collected" in event
  );
}

// export function parseCetusAutoCompoundEarningsFromACEvents(params: {
//   autoCompoundingEvents: (CetusAutoCompoundingEvent & CommonEventAttributes)[];
//   liquidityChangeEvents: (CetusLiquidityChangeEvent & CommonEventAttributes)[];
//   poolNames: DoubleAssetPoolName[];
//   owners: string[];
//   // investorIdMap: Map<string, PoolName>,
//   // poolIdMap: Map<string, PoolName>
// }): { [sender: string]: DoubleAssetPoolAmounts } {
//   const doubleAssetInvestorIdPoolMap: Map<string, DoubleAssetPoolName> =
//     new Map(
//       Array.from(getInvestorPoolMap().entries())
//         .filter(([_, poolName]) => isCetusPool(poolName))
//         .map(([investorId, poolName]) => [
//           investorId,
//           poolName as DoubleAssetPoolName,
//         ]),
//     );
//   const doubleAssetPoolIdPoolNameMap = Object.entries(poolIdPoolNameMap)
//     .filter(([_, poolName]) => isCetusPool(poolName))
//     .reduce(
//       (acc, [key, poolName]) => {
//         acc[key] = poolName as DoubleAssetPoolName;
//         return acc;
//       },
//       {} as { [key: string]: DoubleAssetPoolName },
//     );

//   const result: { [sender: string]: DoubleAssetPoolAmounts } = {};

//   // Index liquidityChangeEvents by sender and poolId for efficient lookup
//   const liquidityEventIndex: {
//     [sender: string]: { [poolId: string]: LiquidityChangeEventNode[] };
//   } = {};

//   params.liquidityChangeEvents.forEach((event) => {
//     if (!liquidityEventIndex[event.sender]) {
//       liquidityEventIndex[event.sender] = {};
//     }
//     if (!liquidityEventIndex[event.sender][event.pool_id]) {
//       liquidityEventIndex[event.sender][event.pool_id] = [];
//     }
//     liquidityEventIndex[event.sender][event.pool_id].push(event);
//   });

//   // Sort the liquidityChangeEvents by timestamp for each sender/pool pair
//   Object.keys(liquidityEventIndex).forEach((sender) => {
//     Object.keys(liquidityEventIndex[sender]).forEach((poolId) => {
//       liquidityEventIndex[sender][poolId].sort(
//         (a, b) => a.timestamp - b.timestamp,
//       );
//     });
//   });

//   // Determine relevant senders
//   const relevantSenders =
//     params.owners.length === 0
//       ? Array.from(
//           new Set(params.liquidityChangeEvents.map((event) => event.sender)),
//         )
//       : params.owners;

//   // Preprocess pool names for quick lookup
//   const allPoolsFromAutoCompound =
//     params.poolNames.length === 0
//       ? Array.from(
//           new Set(
//             params.autoCompoundingEvents.map((event) =>
//               doubleAssetInvestorIdPoolMap.get(event.investor_id),
//             ),
//           ),
//         )
//       : params.poolNames;

//   relevantSenders.forEach((sender) => {
//     result[sender] = {} as DoubleAssetPoolAmounts;

//     // Get user's liquidity change events from the indexed structure
//     const userLiquidityEvents = liquidityEventIndex[sender] || {};

//     allPoolsFromAutoCompound.forEach((poolName) => {
//       // Find the pool ID associated with the current pool name
//       const poolId = Array.from(
//         Object.entries(doubleAssetPoolIdPoolNameMap),
//       ).find(([_, name]) => name === poolName)?.[0];
//       if (!poolId) return;

//       // Get liquidity change events for the user for this pool
//       const userPoolLiquidityEvents = userLiquidityEvents[poolId] || [];

//       // Get auto-compounding events for the current pool
//       const poolAutoCompoundingEvents = params.autoCompoundingEvents.filter(
//         (event) =>
//           doubleAssetInvestorIdPoolMap.get(event.investor_id) === poolName,
//       );

//       poolAutoCompoundingEvents.forEach((event) => {
//         // Find the closest liquidity event for the user based on the timestamp
//         const closestLiquidityEvent = findClosestLiquidityEvent(
//           userPoolLiquidityEvents,
//           event.timestamp,
//         );
//         if (!closestLiquidityEvent) return;

//         // Calculate the user's share
//         const userXTokenBalance = new Decimal(
//           closestLiquidityEvent.user_total_x_token_balance,
//         );
//         const xTokenSupply = new Decimal(closestLiquidityEvent.x_token_supply);

//         const userShare = !xTokenSupply.isZero()
//           ? userXTokenBalance.div(xTokenSupply)
//           : new Decimal(0);

//         // Calculate the user's portion of the compounded amounts
//         const tokensA = userShare.mul(
//           new Decimal(event.compound_amount_a.toString()),
//         );
//         const tokensB = userShare.mul(
//           new Decimal(event.compound_amount_b.toString()),
//         );

//         // Initialize pool amounts if not already present
//         if (!result[sender][poolName!]) {
//           result[sender][poolName!] = { tokensA: "0", tokensB: "0" };
//         }

//         // Accumulate the results
//         result[sender][poolName!].tokensA = new Decimal(
//           result[sender][poolName!].tokensA,
//         )
//           .add(tokensA)
//           .toFixed(5)
//           .toString();
//         result[sender][poolName!].tokensB = new Decimal(
//           result[sender][poolName!].tokensB,
//         )
//           .add(tokensA)
//           .toFixed(5)
//           .toString();
//       });
//     });
//   });

//   return result;
// }

// function findClosestLiquidityEvent(
//   events: LiquidityChangeEventNode[],
//   targetTimestamp: number,
// ): LiquidityChangeEventNode | undefined {
//   let low = 0;
//   let high = events.length - 1;

//   let bestMatch: LiquidityChangeEventNode | undefined = undefined;

//   while (low <= high) {
//     const mid = Math.floor((low + high) / 2);
//     const currentEvent = events[mid];

//     if (currentEvent.timestamp <= targetTimestamp) {
//       bestMatch = currentEvent;
//       low = mid + 1;
//     } else {
//       high = mid - 1;
//     }
//   }

//   return bestMatch;
// }

// export function parseCetusAutoCompoundEarningsFromAddLiquidityEvents(params: {
//   poolNames: DoubleAssetPoolName;
//   owners: string[];
//   addLiquidityEvens: AddLiquidityEventNodes[];
// });
