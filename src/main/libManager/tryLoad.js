import * as graphene from 'graphene-pk11';

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
      mod.close();
    }
  } catch {
    return false;
  }
};

export default tryLoad;
