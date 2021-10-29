import { generateName } from '../utils/names';
import { getHash } from '../utils/hash';

export function getNewFakeCert(slotId, valid, throwError = false) {
  const displayName = `${generateName()}'s Certified`;
  return {
    id: getHash(displayName),
    displayName,
    valid,
    libraryPath: 'test',
    slotId,
    throwError
  };
}
