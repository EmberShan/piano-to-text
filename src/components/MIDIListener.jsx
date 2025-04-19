import React, { useState, useRef } from "react";
import { getMappedCharacter, matchChord } from "../utils/midiMapping";

function MIDIListener({ onMIDIInput }) {
  const [listening, setListening] = useState(false);
  const activeNotes = useRef(new Set());

  const startMIDI = () => {
    navigator
      .requestMIDIAccess({ sysex: false })
      .then((midiAccess) => {
        setListening(true);
        for (let input of midiAccess.inputs.values()) {
          input.onmidimessage = handleMIDIMessage;
        }
      })
      .catch((err) => {
        console.error("MIDI Access Error:", err);
      });
  };

  function handleMIDIMessage(message) {
    const [status, note, velocity] = message.data;
    
    if (status === 144 && velocity > 0) { // Note On
      activeNotes.current.add(note);
      
      // Check for chord when we have exactly 4 notes
      if (activeNotes.current.size === 4) {
        const chordResult = matchChord(Array.from(activeNotes.current));
        if (chordResult === " ") {
          onMIDIInput("check_word");
          activeNotes.current.clear();
          return;
        }
      }
      
      // Handle special keys and regular characters
      const character = getMappedCharacter(note);
      if (character) {
        console.log('MIDI Input:', { note, character }); // Debug log
        if (character === "space") {
          // Send a special signal to check the word first
          onMIDIInput("check_word");
        } else if (character === "backspace") {
          // Simulate backspace key press
          onMIDIInput("\b");
        } else {
          // Regular character - send the character directly
          onMIDIInput(character);
        }
      }
    } else if (status === 128 || (status === 144 && velocity === 0)) { // Note Off
      activeNotes.current.delete(note);
    }
  }

  return (
    <div className="text-white p-4">
      {!listening ? (
        <button
          onClick={startMIDI}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Enable MIDI
        </button>
      ) : (
        <h1 className="text-2xl">MIDI Input Active</h1>
      )}
    </div>
  );
}

export default MIDIListener; 