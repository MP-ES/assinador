export function getHash(str, asString = true, seed) {
  let hashValue = seed === undefined ? 0x811c9dc5 : seed;

  for (let i = 0, l = str.length; i < l; i++) {
    hashValue ^= str.charCodeAt(i);
    hashValue +=
      (hashValue << 1) +
      (hashValue << 4) +
      (hashValue << 7) +
      (hashValue << 8) +
      (hashValue << 24);
  }
  if (asString) {
    return ('0000000' + (hashValue >>> 0).toString(16)).substr(-8);
  }
  return hashValue >>> 0;
}
