// utils/midiMapping.js

const whiteKeyOffsets = [0, 2, 4, 5, 7, 9, 11];

// Get all MIDI note numbers that are white keys
export function isWhiteKey(note) {
  return whiteKeyOffsets.includes(note % 12);
}

// Returns true if the two white keys are adjacent on the keyboard
export function areAdjacentWhiteKeys(n1, n2) {
  if (!isWhiteKey(n1) || !isWhiteKey(n2)) return false;

  const whiteKeys = [];
  for (let i = 21; i <= 108; i++) {
    if (isWhiteKey(i)) whiteKeys.push(i);
  }

  const idx1 = whiteKeys.indexOf(n1);
  const idx2 = whiteKeys.indexOf(n2);

  return Math.abs(idx1 - idx2) === 1;
}

export function matchChord(notes) {
  if (notes.length !== 4) return null;
  
  // Sort the notes to make pairing easier
  const sorted = [...notes].sort((a, b) => a - b);
  
  // Check all possible pairings of the four notes
  const pairings = [
    [[sorted[0], sorted[1]], [sorted[2], sorted[3]]],
    [[sorted[0], sorted[2]], [sorted[1], sorted[3]]],
    [[sorted[0], sorted[3]], [sorted[1], sorted[2]]],
  ];

  // Check if any of the pairings has two pairs of adjacent white keys
  for (let [[a, b], [c, d]] of pairings) {
    if (areAdjacentWhiteKeys(a, b) && areAdjacentWhiteKeys(c, d)) {
      return " "; // Return space if condition is met
    }
  }

  return null; // Return null if no valid chord is found
}

export function getMappedCharacter(note) {
  const map = {
    55: "space", 56: "backspace", // Special keys
    57: "m", 59: "b", 60: "a", 62: "o", 64: "e", 65: "u", 67: "i", 
    69: ",", 71: ".", 72: "d", 74: "h", 76: "t", 77: "n", 79: "s", 
    81: "p", 83: "v", 84: "z", 58: "j", 61: "x", 63: "k", 66: "c", 
    68: "g", 70: "f", 73: "r", 75: "l", 78: "y", 80: "w", 82: "q"
  };
  return map[note] || null;
}
