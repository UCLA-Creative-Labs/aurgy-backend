
// 16-digit prime
const HASH_16 = 1000000000100011;

// based off https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
const hash16digit = (input : string) : number => {
  let hash = 0;
  if (input.length == 0) {
    return hash;
  }
  const chars = [...input];

  /* eslint-disable */
  chars.forEach((char) => {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash = hash & hash;
  });
  /* eslint-enable */

  return Math.abs(hash % HASH_16);
};

export const generateLobbyId = (userId : string, retryNum : number) : number => {
  return hash16digit(userId + Date.now() + retryNum);
};
