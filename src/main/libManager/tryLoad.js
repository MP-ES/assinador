import * as graphene from 'graphene-pk11';

const tryLoad = lib => {
  try {
    const mod = graphene.Module.load(lib);
    try {
      mod.initialize();
      mod.getSlots(true);
      return true;
    } catch {
      return false;
    } finally {
      mod.finalize();
    }
  } catch {
    return false;
  }
};

export default tryLoad;
