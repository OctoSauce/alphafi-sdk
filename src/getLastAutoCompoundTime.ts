import { PoolName } from "./common/types.js";
import { fetchAutoCompoundingEvents } from "./sui-sdk/events/fetchAutoCompoundingEvents.js";

export async function getLastAutoCompoundTime(
  poolName: PoolName,
): Promise<string> {
  const endTime = Date.now();
  const startTime = endTime - 24 * 60 * 60 * 1000; // timestamp for 24 hours ago
  const events = await fetchAutoCompoundingEvents({
    startTime: startTime,
    endTime: endTime,
    poolNames: [poolName],
  });
  if (events.length > 0) return events[0].timestamp.toString();
  return "";
}
