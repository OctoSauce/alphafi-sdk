import {
  SingleTokenAmounts,
  DoubleTokenAmounts,
  PoolName,
  SingleAssetPoolName,
} from "../../common/types";
import {
  UsersCollectedAlphaRewards,
  UsersInvestmentsInAlphaPools,
  UsersWithdrawsFromAlphaPools,
} from "./types";

function mergeAmounts(
  amount1: SingleTokenAmounts | DoubleTokenAmounts,
  amount2: SingleTokenAmounts | DoubleTokenAmounts,
): SingleTokenAmounts | DoubleTokenAmounts {
  if ("tokens" in amount1 && "tokens" in amount2) {
    // Handle SingleTokenAmounts
    return {
      tokens: (
        parseFloat(amount1.tokens) + parseFloat(amount2.tokens)
      ).toString(),
    };
  } else if (
    "tokensA" in amount1 &&
    "tokensB" in amount1 &&
    "tokensA" in amount2 &&
    "tokensB" in amount2
  ) {
    // Handle MultiTokenAmounts
    return {
      tokensA: (parseFloat(amount1.tokensA) + parseFloat(amount2.tokensA))
        .toFixed(5)
        .toString(),
      tokensB: (parseFloat(amount1.tokensB) + parseFloat(amount2.tokensB))
        .toFixed(5)
        .toString(),
    };
  } else {
    throw new Error("Mismatched types for PoolAmounts");
  }
}
export function mergeInvestments(
  investments1: UsersInvestmentsInAlphaPools,
  investments2: UsersInvestmentsInAlphaPools,
): UsersInvestmentsInAlphaPools {
  const mergedInvestments: UsersInvestmentsInAlphaPools = { ...investments1 };

  for (const owner in investments2) {
    if (owner in mergedInvestments) {
      // Owner exists in both objects, merge their PoolAmounts
      for (const pool in investments2[owner]) {
        if (pool in mergedInvestments[owner]) {
          // Pool exists in both, merge the amounts
          const poolName = pool as SingleAssetPoolName;
          mergedInvestments[owner][poolName] = mergeAmounts(
            mergedInvestments[owner][poolName],
            investments2[owner][poolName],
          ) as SingleTokenAmounts;
        } else {
          // Pool only exists in the second object, just copy it
          const poolName = pool as SingleAssetPoolName;
          mergedInvestments[owner][poolName] = investments2[owner][poolName];
        }
      }
    } else {
      // Owner only exists in the second object, just copy it
      mergedInvestments[owner] = investments2[owner];
    }
  }

  return mergedInvestments;
}

function mergeRewards(reward1: string, reward2: string): string {
  return (parseFloat(reward1) + parseFloat(reward2)).toFixed(5).toString();
}
export function mergeCollectedRewards(
  rewards1: UsersCollectedAlphaRewards,
  rewards2: UsersCollectedAlphaRewards,
): UsersCollectedAlphaRewards {
  const mergedRewards: UsersCollectedAlphaRewards = { ...rewards1 };

  for (const owner in rewards2) {
    if (owner in mergedRewards) {
      // Owner exists in both, merge their pools
      for (const pool in rewards2[owner]) {
        if (pool in mergedRewards[owner]) {
          // Pool exists in both, merge the rewards
          const poolName = pool as Exclude<PoolName, "ALPHA"> | "TOTAL";
          mergedRewards[owner][poolName] = mergeRewards(
            mergedRewards[owner][poolName],
            rewards2[owner][poolName],
          );
        } else {
          // Pool only exists in rewards2, just copy it
          const poolName = pool as Exclude<PoolName, "ALPHA"> | "TOTAL";
          mergedRewards[owner][poolName] = rewards2[owner][poolName];
        }
      }
    } else {
      // Owner only exists in rewards2, just copy the entire entry
      mergedRewards[owner] = rewards2[owner];
    }
  }

  return mergedRewards;
}

export function mergeWithdraws(
  withdraws1: UsersWithdrawsFromAlphaPools,
  withdraws2: UsersWithdrawsFromAlphaPools,
): UsersWithdrawsFromAlphaPools {
  const mergedWithdraws: UsersWithdrawsFromAlphaPools = { ...withdraws1 };

  for (const owner in withdraws2) {
    if (owner in mergedWithdraws) {
      // Owner exists in both objects, merge their PoolAmounts
      for (const pool in withdraws2[owner]) {
        if (pool in mergedWithdraws[owner]) {
          // Pool exists in both, merge the amounts
          const poolName = pool as SingleAssetPoolName;
          mergedWithdraws[owner][poolName] = mergeAmounts(
            mergedWithdraws[owner][poolName],
            withdraws2[owner][poolName],
          ) as SingleTokenAmounts;
        } else {
          // Pool only exists in the second object, just copy it
          const poolName = pool as SingleAssetPoolName;
          mergedWithdraws[owner][poolName] = withdraws2[owner][poolName];
        }
      }
    } else {
      // Owner only exists in the second object, just copy it
      mergedWithdraws[owner] = withdraws2[owner];
    }
  }

  return mergedWithdraws;
}
