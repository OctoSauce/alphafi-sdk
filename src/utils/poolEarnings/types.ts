import {
  PoolAmounts,
  PoolName,
  SingleAssetPoolAmounts,
} from "../../common/types";

export type FetchAlphaDepositsAndWithdrawsParams = {
  owners: string[];
  startTime: number;
  endTime: number;
  options?: {
    investments?: boolean;
    alphaMiningRewards?: boolean;
    withdraws?: boolean;
  };
};

export type UsersInvestmentsInPools = {
  [owner: string]: PoolAmounts;
};

export type UsersWithdrawsFromPools = {
  [owner: string]: PoolAmounts;
};

export type UsersInvestmentsInAlphaPools = {
  [owner: string]: SingleAssetPoolAmounts;
};

export type UsersWithdrawsFromAlphaPools = {
  [owner: string]: SingleAssetPoolAmounts;
};

export type UsersCollectedAlphaRewards = {
  [owner: string]: { [key in Exclude<PoolName, "ALPHA"> | "TOTAL"]: string };
};

export type FetchAlphaDepositsAndWithdrawlsResponse = {
  usersInvestments?: UsersInvestmentsInAlphaPools;
  usersAlphaMiningRewards?: UsersCollectedAlphaRewards;
  usersWithdraws?: UsersWithdrawsFromAlphaPools;
};

export type FetchSingleUserEarningsParams = {
  owner: string;
  poolNames: PoolName[];
  // startTime?: number,
  // endTime?: number,
};

export type FetchSingleUserEarningsResponse = UsersCollectedAlphaRewards;
