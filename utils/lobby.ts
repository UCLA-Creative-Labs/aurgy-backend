
import { createHash } from 'crypto';

export const generateLobbyId = (userId : string, retryNum : number) : string => {
  // 16-digit prime
  const hash_16 = 9999999900000001;
  const input : string = userId + Date.now() + retryNum;
  const generated_hash = createHash('sha1').update(input, 'utf-8').digest('hex').toString();
  const base = 16;
  // parse hex hash string to int (modulo the 16-digit prime)
  const digit_hash = parseInt(generated_hash, base) % hash_16;
  return digit_hash.toString();
};
