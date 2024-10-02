import { getSuiClient } from "../client";
import { EventId, PaginatedEvents, SuiEvent } from "@mysten/sui/client";

const suiClient = getSuiClient();

type FetchMoveModuleEventsParams = {
  module: string;
  package: string;
  startTime: number;
  endTime: number;
};

type FetchMoveModuleEventsResponse = SuiEvent[];

export async function fetchMoveModuleEvents(
  params: FetchMoveModuleEventsParams,
): Promise<FetchMoveModuleEventsResponse> {
  let hasNextPage = true;
  let startCursor: EventId | null | undefined = null;
  let events: SuiEvent[] = [];

  while (hasNextPage) {
    const result: PaginatedEvents = await suiClient.queryEvents({
      cursor: startCursor,
      order: "descending",
      query: {
        MoveEventModule: {
          module: params.module,
          package: params.package,
        },
      },
    });
    events = [...events, ...result.data];

    hasNextPage = result.hasNextPage;
    startCursor = result.nextCursor;
  }

  const eventsWithTimestamp = events.map((event, index) => {
    if (event.timestampMs) return event;
    else if (
      events[index - 1].timestampMs &&
      events[index - 1].id.txDigest === event.id.txDigest
    ) {
      return { ...event, timestampMs: events[index - 1].timestampMs };
    } else if (
      events[index + 1].timestampMs &&
      events[index + 1].id.txDigest === event.id.txDigest
    ) {
      return { ...event, timestampMs: events[index + 1].timestampMs };
    } else {
      console.error(`${event} has no timestamp`);
      return event;
    }
  });

  return eventsWithTimestamp;
}

export function getUniqueTypes(events: SuiEvent[]): string[] {
  const uniqueEvents = new Set<string>();
  events.map((e) => {
    uniqueEvents.add(e.type);
  });
  return Array.from(uniqueEvents);
}

type FilterEventsByTypeParams = {
  events: SuiEvent[];
  types?: string[];
};

type FilterEventsByTypeResponse = {
  [type: string]: SuiEvent[];
};

export function organiseEventsByType(
  params: FilterEventsByTypeParams,
): FilterEventsByTypeResponse {
  const filteredEvents: FilterEventsByTypeResponse = {};

  const { events, types } = params;
  if (types && types.length > 0) {
    for (const type of types) {
      filteredEvents[type] = [];
    }

    for (const event of events) {
      if (types.includes(event.type)) {
        filteredEvents[event.type].push(event);
      }
    }
  } else {
    for (const event of events) {
      if (event.type in filteredEvents) {
        filteredEvents[event.type].push(event);
      } else {
        filteredEvents[event.type] = [event];
      }
    }
  }

  return filteredEvents;
}
