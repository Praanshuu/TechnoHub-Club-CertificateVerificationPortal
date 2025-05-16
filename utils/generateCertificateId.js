import { customAlphabet } from 'nanoid';

const getRandomFrom = (alphabet, length) =>
  customAlphabet(alphabet, length)();

const shuffle = (str) =>
  str.split('').sort(() => Math.random() - 0.5).join('');

export function generateCertificateId(clubCode, eventCode, eventDate) {
  const year = new Date(eventDate).getFullYear().toString().slice(-2);

  // Generate 3 letters + 3 numbers
  const letters = getRandomFrom('abcdefghijklmnopqrstuvwxyz', 3);
  const numbers = getRandomFrom('0123456789', 3);

  // Mix them together randomly
  const random = shuffle(letters + numbers);

  return `${clubCode}${eventCode}${year}${random}`;
}
