const REGISTRY_VERSIONS = {
  'premium-ds': '^0.8.0',
  '@tabsircg/analytics': '^1.0.1',
};

const LOCAL_LINKS = {
  'premium-ds': 'link:/home/tabsir/ap/reactp/premium-ds',
  '@tabsircg/analytics':
    'link:/home/tabsir/ap/reactp/tabsircg/analytics/packages/analytics',
};

const resolveFromRegistry =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL === '1' ||
  process.env.CI === 'true';

export const hooks = {
  readPackage(pkg) {
    if (!pkg.dependencies) return pkg;
    const source = resolveFromRegistry ? REGISTRY_VERSIONS : LOCAL_LINKS;
    for (const name of Object.keys(REGISTRY_VERSIONS)) {
      if (pkg.dependencies[name]) pkg.dependencies[name] = source[name];
    }
    return pkg;
  },
};
