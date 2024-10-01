import { TransactionFilter } from "@mysten/sui/dist/cjs/client";
import { conf, CONF_ENV } from "../../common/constants";

export const nonAlphaDepositFilters: TransactionFilter[] = (function () {
  const alphafi_cetus_pool_1filters = conf[CONF_ENV].ALPHA_PACKAGE_IDS.map(
    (id) => {
      return {
        MoveFunction: {
          function: "user_deposit",
          module: "alphafi_cetus_pool",
          package: id,
        },
      };
    },
  );
  const alphafi_cetus_pool_2filters = conf[CONF_ENV].ALPHA_2_PACKAGE_IDS.map(
    (id) => {
      return {
        MoveFunction: {
          function: "user_deposit",
          module: "alphafi_cetus_pool",
          package: id,
        },
      };
    },
  );
  const alphafi_cetus_sui_pool_1filters = conf[CONF_ENV].ALPHA_PACKAGE_IDS.map(
    (id) => {
      return {
        MoveFunction: {
          function: "user_deposit",
          module: "alphafi_cetus_sui_pool",
          package: id,
        },
      };
    },
  );
  const alphafi_cetus_sui_pool_2filters = conf[
    CONF_ENV
  ].ALPHA_2_PACKAGE_IDS.map((id) => {
    return {
      MoveFunction: {
        function: "user_deposit",
        module: "alphafi_cetus_sui_pool",
        package: id,
      },
    };
  });
  const alphafi_cetus_pool_base_a_1filters = conf[
    CONF_ENV
  ].ALPHA_PACKAGE_IDS.map((id) => {
    return {
      MoveFunction: {
        function: "user_deposit",
        module: "alphafi_cetus_pool_base_a",
        package: id,
      },
    };
  });
  const alphafi_cetus_pool_base_a_2filters = conf[
    CONF_ENV
  ].ALPHA_2_PACKAGE_IDS.map((id) => {
    return {
      MoveFunction: {
        function: "user_deposit",
        module: "alphafi_cetus_pool_base_a",
        package: id,
      },
    };
  });
  return [
    ...alphafi_cetus_pool_1filters,
    ...alphafi_cetus_pool_2filters,
    ...alphafi_cetus_sui_pool_1filters,
    ...alphafi_cetus_sui_pool_2filters,
    ...alphafi_cetus_pool_base_a_1filters,
    ...alphafi_cetus_pool_base_a_2filters,
  ] as TransactionFilter[];
})();

export const alphaDepositFilters: TransactionFilter[] = (function () {
  const alpha1filters = conf[CONF_ENV].ALPHA_PACKAGE_IDS.map((id) => {
    return {
      MoveFunction: {
        function: "user_deposit",
        module: "alphapool",
        package: id,
      },
    };
  });
  const alpha2fliters = conf[CONF_ENV].ALPHA_2_PACKAGE_IDS.map((id) => {
    return {
      MoveFunction: {
        function: "user_deposit",
        module: "alphapool",
        package: id,
      },
    };
  });
  return [...alpha1filters, ...alpha2fliters] as TransactionFilter[];
})();

export const cetusUpdatePoolFilters: TransactionFilter[] = (function () {
  const alpha1filters: TransactionFilter[] = conf[
    CONF_ENV
  ].ALPHA_PACKAGE_IDS.map((id) => {
    return {
      MoveFunction: {
        function: "update_pool",
        module: "alphafi_cetus_pool",
        package: id,
      },
    };
  });
  const alpha2filters: TransactionFilter[] = conf[
    CONF_ENV
  ].ALPHA_2_PACKAGE_IDS.map((id) => {
    return {
      MoveFunction: {
        function: "update_pool",
        module: "alphafi_cetus_pool",
        package: id,
      },
    };
  });
  return alpha1filters.concat(alpha2filters);
})();

// useless
/*{
  MoveFunction: {
    function: 'update_pool',
    module: 'alphafi_cetus_pool',
    package: '0x2793db7aa0e0209afc84f0adb1b258973cf1c9da55c35ee85c18f2ed4912bb6f'
  }
}
{
  MoveFunction: {
    function: 'update_pool',
    module: 'alphafi_cetus_pool',
    package: '0x1a22b26f139b34c9de9718cf7e53159b2b939ec8f46f4c040776b7a3d580dd28'
  }
}
{
  MoveFunction: {
    function: 'update_pool',
    module: 'alphafi_cetus_pool',
    package: '0x8f7d2c35e19c65213bc2153086969a55ec207b5a25ebdee303a6d9edd9c053e3'
  }
}*/
