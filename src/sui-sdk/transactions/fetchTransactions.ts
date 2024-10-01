import { getSuiClient } from "../client";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { FetchTransactionParams } from "./types";

const suiClient = getSuiClient();

// this handling of timestamps might be wrong, verify once and check with the one in fetchAllEventsofUser
export async function fetchTransactions(
  params: FetchTransactionParams,
): Promise<SuiTransactionBlockResponse[]> {
  let transactionBlocks: SuiTransactionBlockResponse[] = [];

  for (const filter of params.filter) {
    let hasNextPage: boolean = true;
    let nextCursor: null | string | undefined = null;
    while (hasNextPage) {
      const res = await suiClient.queryTransactionBlocks({
        cursor: nextCursor,
        filter: filter,
        order: "descending",
        options: {
          showEvents: true,
          showEffects: true,
          // showInput: true,
          // showObjectChanges: true,
        },
      });
      hasNextPage = res.hasNextPage;
      nextCursor = res.nextCursor;
      if (res.data.length !== 0) {
        const lastTx = res.data[res.data.length - 1];
        const firstTx = res.data[0];
        const pageEndTime = Number(firstTx.timestampMs as string);
        const pageStartTime = Number(lastTx.timestampMs as string);
        if (pageEndTime < params.startTime) {
          // Page beyond interval
          hasNextPage = false;
          break;
        } else if (pageStartTime > params.endTime) {
          // Page beyond interval
          continue;
        } else if (
          pageEndTime > params.startTime &&
          pageEndTime < params.endTime &&
          pageStartTime < params.startTime
        ) {
          // Page spills from interval startTime
          for (let i = 0; i < res.data.length; i++) {
            if (Number(res.data[i].timestampMs) > params.startTime) {
              transactionBlocks.push(res.data[i]);
            } else {
              break;
            }
          }
        } else if (
          Number(pageEndTime) > params.endTime &&
          Number(pageStartTime) > params.startTime &&
          Number(pageStartTime) < params.endTime
        ) {
          // Page spills from interval endTIme
          for (let i = res.data.length - 1; i >= 0; i--) {
            if (Number(res.data[i].timestampMs) < params.endTime) {
              transactionBlocks.push(res.data[i]);
            } else {
              break;
            }
          }
        } else if (
          Number(pageEndTime) > params.endTime &&
          Number(pageStartTime) < params.startTime
        ) {
          // Page spills from interval both bounds
          for (let i = 0; i < res.data.length; i++) {
            if (
              Number(res.data[i].timestampMs) > params.startTime &&
              Number(res.data[i].timestampMs) < params.endTime
            ) {
              transactionBlocks.push(res.data[i]);
            }
          }
        } else {
          // Page is in the interval
          transactionBlocks = transactionBlocks.concat(res.data);
        }
      } else {
        // Empty result
        transactionBlocks = transactionBlocks.concat(res.data);
      }
    }
  }

  return transactionBlocks;
}
