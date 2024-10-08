export const userVaults = `query GetUserVaults($address: SuiAddress!) {
  owner(address: $address) {
    alphaObjects: objects(
      filter: {
        type: "0x9bbd650b8442abb082c20f3bc95a9434a8d47b4bef98b0832dab57c1a8ba7123::alphapool::Receipt"
      }
    ) {
      ...ReceiptFields
    }

    alphaSuiObjects: objects(
      filter: {
        type: "0x9bbd650b8442abb082c20f3bc95a9434a8d47b4bef98b0832dab57c1a8ba7123::alphafi_cetus_sui_pool::Receipt"
      }
    ) {
      ...ReceiptFields
    }

    usdtUsdcObjects: objects(
      filter: {
        type: "0x9bbd650b8442abb082c20f3bc95a9434a8d47b4bef98b0832dab57c1a8ba7123::alphafi_cetus_pool::Receipt"
      }
    ) {
      ...ReceiptFields
    }

    usdcWbtcObjects: objects(
      filter: {
        type: "0x2793db7aa0e0209afc84f0adb1b258973cf1c9da55c35ee85c18f2ed4912bb6f::alphafi_cetus_pool_base_a::Receipt"
      }
    ) {
      ...ReceiptFields
    }

    naviObjects: objects(
      filter: {
        type: "0x8f7d2c35e19c65213bc2153086969a55ec207b5a25ebdee303a6d9edd9c053e3::alphafi_navi_pool::Receipt"
      }
    ) {
      ...ReceiptFields
    }
  }
}

fragment ReceiptFields on MoveObjectConnection {
  pageInfo {
    hasNextPage
  }
  nodes {
    contents {
      type {
        repr
      }
      json
    }
  }
}
`;
