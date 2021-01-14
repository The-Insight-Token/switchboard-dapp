import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';

const opts = {
  whitelistedDomains: [/gnosis-safe\\.io/],
};

export const appsSdk = new SafeAppsSDK(opts);
