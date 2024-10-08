// src/graphql/queries.ts

/* This file will contain the GraphQL queries for fetching user wallet
/* data, protocol data, and portfolio data.
 */

import { gql } from "@apollo/client";

import { userVaults } from "./queries/userVaults.js";
import { userVaultBalances } from "./queries/userVaultBalances.js";
import { pools } from "./queries/pools.js";
import { investors } from "./queries/investors.js";
import { cetusPools } from "./queries/cetusPools.js";
import { autoCompoundEvents } from "./queries/autoCompoundEvents.js";
import { nftHolders } from "./queries/nftHolders.js";
import { receiptData } from "./queries/receiptData.js";
import { lockedTableDataFragment } from "./queries/lockedTableDataFragment.js";
import { lockedTableData } from "./queries/lockedTableData.js";

// Query to fetch user wallet data
export const GET_USER_WALLET_DATA = gql`
  query GetUserWalletData($address: String!) {
    userWallet(address: $address) {
      coins {
        name
        amount
      }
    }
  }
`;

// Query to fetch protocol data
export const GET_PROTOCOL_DATA = gql`
  query GetProtocolData {
    protocolData {
      totalValueLocked
      pools {
        name
        tvl
      }
    }
  }
`;

// Query to fetch portfolio data
export const GET_PORTFOLIO_DATA = gql`
  query GetPortfolioData($address: String!) {
    portfolio(address: $address) {
      poolName
      investment
    }
  }
`;

export const GET_CHAIN_IDENTIFIER = gql`
  query {
    chainIdentifier
  }
`;

export const GET_USER_VAULTS = gql`
  ${userVaults}
`;

export const GET_USER_VAULT_BALANCES = gql`
  ${userVaultBalances}
`;

export const GET_POOLS = gql`
  ${pools}
`;

export const GET_CETUS_POOLS = gql`
  ${cetusPools}
`;

export const GET_INVESTORS = gql`
  ${investors}
`;

export const GET_AUTOCOMPOUND_EVENTS = gql`
  ${autoCompoundEvents}
`;

export const GET_NFT_HOLDERS = gql`
  ${nftHolders}
`;

export const GET_RECEIPT_DATA = gql`
  ${receiptData}
`;

export const GET_LOCKED_TABLE_DATA_FRAGMENT = gql`
  ${lockedTableDataFragment}
`;

export const GET_LOCKED_TABLE_DATA = gql`
  ${lockedTableData}
`;
