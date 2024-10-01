import { fetchEvents } from "./fetchEvents";
import {
  FetchWithdrawEventsParams,
  FetchWithdrawEventsResponse,
  WithdrawEventNode,
} from "./types";
import { poolInfo } from "../../common/maps";

// const lastInvestmentAlphaPoolDepositEvent: number = 1724074240881;
// const lastAlphaPoolDepositEvent: number = 1724077012872;
// const alphafiInception: number = 1719499980000;

export async function fetchWithdrawEvents(
  params: FetchWithdrawEventsParams,
): Promise<FetchWithdrawEventsResponse> {
  if (params.poolNames?.some((poolName) => poolName !== "ALPHA")) {
    throw new Error("fetchWithdrawEvents only supports ALPHA pool yet");
  }
  const eventTypesSet = new Set<string>();
  if (params.poolNames) {
    params.poolNames.forEach((poolName) => {
      const eventType = poolInfo[poolName].withdrawEventType;
      if (eventType !== undefined && eventType !== null && eventType !== "") {
        eventTypesSet.add(eventType);
      }
    });
  } else {
    // Iterate over all the values in poolInfo and add each withdrawEventType to the Set
    Object.values(poolInfo).forEach((info) => {
      const eventType = info.withdrawEventType;
      if (eventType !== undefined && eventType !== null && eventType !== "") {
        eventTypesSet.add(eventType);
      }
    });
  }
  const eventTypes = Array.from(eventTypesSet);

  const eventsPromises = eventTypes.map(async (eventType) => {
    const events = await fetchEvents({
      startTime: params.startTime,
      endTime: params.endTime,
      eventTypes: [eventType],
    });
    return events;
  });

  const events = (await Promise.all(eventsPromises)).flat();
  const withdrawEvents = events.map((e) => {
    return e as WithdrawEventNode;
  });

  // Filtering by poolType not possible
  return withdrawEvents;
}
