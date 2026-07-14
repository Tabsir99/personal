export const hooks = {
  readPackage(pkg, context) {
    if (pkg.dependencies && pkg.dependencies['premium-ds']) {
      if (process.env.NODE_ENV === 'production') {
        pkg.dependencies['premium-ds'] = '^0.7.1';
      } else {
        pkg.dependencies['premium-ds'] = 'link:/home/tabsir/ap/reactp/premium-ds';
      }
    }
    return pkg;
  }
};
