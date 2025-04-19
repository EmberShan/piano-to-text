// hooks/useMIDIInput.js
import { useEffect, useRef } from "react";
import { matchChord, getMappedCharacter } from "../utils/midiMapping";

export default function useMIDIInput(inputRef) {
  const activeNotes = useRef(new Set());
  const midiAccessRef = useRef(null);

  const handleMIDIMessage = (message) => {
    const [status, note, velocity] = message.data;
    console.log('MIDI Message:', { status, note, velocity }); // Debug log

    if (status === 144 && velocity > 0) { // Note On
      activeNotes.current.add(note);

      if (activeNotes.current.size >= 4) {
        const notes = Array.from(activeNotes.current);
        const result = matchChord(notes);

        if (result) {
          insertCharacter(result);
          activeNotes.current.clear();
        }
      }
    } else if (status === 128 || (status === 144 && velocity === 0)) { // Note Off
      activeNotes.current.delete(note);
    }
  };

  const insertCharacter = (char) => {
    const inputEl = inputRef.current;
    if (inputEl) {
      inputEl.focus();
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const value = inputEl.value;
      const newValue = value.slice(0, start) + char + value.slice(end);
      inputEl.value = newValue;

      // Fire input event to make React aware of the change
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputEl.setSelectionRange(start + 1, start + 1);
    }
  };

  const setupMIDI = async () => {
    try {
      const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      midiAccessRef.current = midiAccess;
      
      // Log available MIDI inputs
      console.log('MIDI Inputs:', Array.from(midiAccess.inputs.values()));
      
      // Set up initial inputs
      for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
      }

      // Handle device changes
      midiAccess.onstatechange = (event) => {
        console.log('MIDI Device State Change:', event);
        if (event.port.type === 'input' && event.port.state === 'connected') {
          event.port.onmidimessage = handleMIDIMessage;
        }
      };
    } catch (err) {
      console.error("MIDI Access Error:", err);
    }
  };

  useEffect(() => {
    setupMIDI();

    return () => {
      // Cleanup
      if (midiAccessRef.current) {
        for (let input of midiAccessRef.current.inputs.values()) {
          input.onmidimessage = null;
        }
      }
    };
  }, []);
}
