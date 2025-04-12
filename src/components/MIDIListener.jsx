import React, { useState } from "react";

function MIDIListener() {
  const [lastNote, setLastNote] = useState(null);
  const [lastLetter, setLastLetter] = useState(null);
  const [listening, setListening] = useState(false);

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
    if (status === 144 && velocity > 0) {
      const letter = mapNoteToLetter(note);
      setLastNote(note);
      setLastLetter(letter);
      console.log(`Note: ${note}, You played: ${letter}`);
    }
  }

  function mapNoteToLetter(note) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet[(note - 21) % 26];
  }

  return (
    <div className="text-white p-20">
      {!listening ? (
        <button
          onClick={startMIDI}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Enable MIDI
        </button>
      ) : (
        <>
          <h1 className="text-2xl mb-4">Listening to MIDI input...</h1>
          {lastNote !== null && (
            <div className="mt-4 text-xl">
              <p><strong>Note:</strong> {lastNote}</p>
              <p><strong>Mapped Letter:</strong> {lastLetter}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MIDIListener;
