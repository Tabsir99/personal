export const hooks = {
  readPackage(pkg, context) {
    if (pkg.dependencies && pkg.dependencies['premium-ds']) {
      if (process.env.NODE_ENV === 'production') {
        pkg.dependencies['premium-ds'] = '^0.7.1';
      } else {
        pkg.dependencies['premium-ds'] = 'link:/home/tabsir/ap/reactp/premium-ds';
      }
    }
    if (pkg.dependencies && pkg.dependencies['@tabsircg/analytics']) {
      if (process.env.NODE_ENV === 'production') {
        pkg.dependencies['@tabsircg/analytics'] = '^1.0.1';
      } else {
        pkg.dependencies['@tabsircg/analytics'] = 'link:/home/tabsir/ap/reactp/tabsircg/analytics/packages/analytics';
      }
    }
    return pkg;
  }
};
