import nouns from './_nouns';
import adjectives from './_adjectives';

function capFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function generateName() {
  return `${capFirst(nouns[getRandomInt(0, nouns.length + 1)])} ${capFirst(
    adjectives[getRandomInt(0, adjectives.length + 1)]
  )}`;
}
