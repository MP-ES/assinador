import * as graphene from 'graphene-pk11';

import platform from '../models/platform';

const tryLoad = lib => {
  try {
    const mod = graphene.Module.load(lib);
    try {
      mod.initialize();
      mod.getSlots();
      return true;
    } catch {
      return false;
    } finally {
      if (platform.current === platform.options.mac) mod.close();
      else mod.finalize();
    }
  } catch {
    return false;
  }
};

export default tryLoad;
