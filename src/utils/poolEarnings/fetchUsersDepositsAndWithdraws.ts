import {
  FetchAlphaDepositsAndWithdrawsParams,
  FetchAlphaDepositsAndWithdrawlsResponse,
  UsersWithdrawsFromAlphaPools,
  UsersInvestmentsInAlphaPools,
} from "./types";
import { conf, CONF_ENV } from "../../common/constants";
import { fetchDepositEvents } from "../../sui-sdk/events/fetchDepositEvents";
import { fetchWithdrawEvents } from "../../sui-sdk/events/fetchWithdrawEvents";
import { fetchLiquidityChangeEvents } from "../../sui-sdk/events/fetchLiquidityChangeEvents";
import {
  parseAlphaRewardsFromDepositEvents,
  parseInvestmentsfromDepositEvents,
  parseInvestmentsFromLCEvents,
  parseAlphaRewardsFromLCEvents,
  parseWithdrawsFromLCEvents,
  parseWithdrawsFromWithdrawEvents,
} from "../../sui-sdk/events/parseData";
import {
  mergeInvestments,
  mergeCollectedRewards,
  mergeWithdraws,
} from "./mergeFunctions";

// This function has the code for splitting the timestamp and calling the appropriate functions

export async function fetchAlphaDepositsAndWithdraws(
  params: FetchAlphaDepositsAndWithdrawsParams,
): Promise<FetchAlphaDepositsAndWithdrawlsResponse> {
  const { owners, startTime, endTime, options = {} } = params;
  const lastAlphaPoolDepositEventTime =
    conf[CONF_ENV].ALPHA_POOL_LAST_DEPOSIT_EVENT_TIME;
  const response: FetchAlphaDepositsAndWithdrawlsResponse = {};

  // Handle case when the entire time range is before the lastAlphaPoolDepositEventTime
  if (endTime < lastAlphaPoolDepositEventTime) {
    if (options.investments || options.alphaMiningRewards) {
      const depositEvents = await fetchDepositEvents({
        startTime,
        endTime,
        poolNames: ["ALPHA"],
      });
      if (options.investments) {
        response.usersInvestments = parseInvestmentsfromDepositEvents({
          events: depositEvents,
          owners,
          poolNames: ["ALPHA"],
        }) as UsersInvestmentsInAlphaPools;
      }
      if (options.alphaMiningRewards) {
        response.usersAlphaMiningRewards = parseAlphaRewardsFromDepositEvents({
          events: depositEvents,
          owners,
          poolNames: ["ALPHA"],
        });
      }
    }
    if (options.withdraws) {
      const withdrawEvents = await fetchWithdrawEvents({
        startTime,
        endTime,
        poolNames: ["ALPHA"],
      });
      response.usersWithdraws = parseWithdrawsFromWithdrawEvents({
        events: withdrawEvents,
        owners,
        poolNames: ["ALPHA"],
      }) as UsersWithdrawsFromAlphaPools;
    }

    return response;
  }

  // Handle case when the entire time range is after the lastAlphaPoolDepositEventTime
  if (startTime > lastAlphaPoolDepositEventTime) {
    const events = await fetchLiquidityChangeEvents({
      startTime,
      endTime,
      poolNames: ["ALPHA"],
    });

    if (options.investments) {
      response.usersInvestments = parseInvestmentsFromLCEvents({
        events,
        owners,
        poolNames: ["ALPHA"],
      }) as UsersInvestmentsInAlphaPools;
    }

    if (options.alphaMiningRewards) {
      response.usersAlphaMiningRewards = parseAlphaRewardsFromLCEvents({
        events,
        owners,
        poolNames: ["ALPHA"],
      });
    }

    if (options.withdraws) {
      response.usersWithdraws = parseWithdrawsFromLCEvents({
        events,
        owners,
        poolNames: ["ALPHA"],
      }) as UsersWithdrawsFromAlphaPools;
    }

    return response;
  }

  // Handle case when the time range spans in old and new events
  const modernLCEvents = await fetchLiquidityChangeEvents({
    startTime: lastAlphaPoolDepositEventTime + 1,
    endTime,
    poolNames: ["ALPHA"],
  });
  if (options.investments || options.alphaMiningRewards) {
    const ancientDepositEvents = await fetchDepositEvents({
      startTime,
      endTime: lastAlphaPoolDepositEventTime,
      poolNames: ["ALPHA"],
    });
    if (options.investments) {
      const oldInvestments = parseInvestmentsfromDepositEvents({
        events: ancientDepositEvents,
        owners,
        poolNames: ["ALPHA"],
      }) as UsersInvestmentsInAlphaPools;
      const newInvestments = parseInvestmentsFromLCEvents({
        events: modernLCEvents,
        owners,
        poolNames: ["ALPHA"],
      }) as UsersInvestmentsInAlphaPools;
      response.usersInvestments = mergeInvestments(
        oldInvestments,
        newInvestments,
      );
    }
    if (options.alphaMiningRewards) {
      const oldCollectedRewards = parseAlphaRewardsFromDepositEvents({
        events: ancientDepositEvents,
        owners,
        poolNames: ["ALPHA"],
      });
      const newCollectedRewards = parseAlphaRewardsFromLCEvents({
        events: modernLCEvents,
        owners,
        poolNames: ["ALPHA"],
      });
      response.usersAlphaMiningRewards = mergeCollectedRewards(
        oldCollectedRewards,
        newCollectedRewards,
      );
    }
  }
  if (options.withdraws) {
    const ancientWithdrawEvents = await fetchWithdrawEvents({
      startTime,
      endTime: lastAlphaPoolDepositEventTime,
      poolNames: ["ALPHA"],
    });
    const oldWithdraws = parseWithdrawsFromWithdrawEvents({
      events: ancientWithdrawEvents,
      owners,
      poolNames: ["ALPHA"],
    }) as UsersWithdrawsFromAlphaPools;
    const newWithdraws = parseWithdrawsFromLCEvents({
      events: modernLCEvents,
      owners,
      poolNames: ["ALPHA"],
    }) as UsersWithdrawsFromAlphaPools;
    response.usersWithdraws = mergeWithdraws(oldWithdraws, newWithdraws);
  }

  return response;
}
