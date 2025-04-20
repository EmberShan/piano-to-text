// App.jsx
import React, { useState, useRef, useEffect } from "react";
import TypingTest from "./components/TypingTest";
import MIDIListener from "./components/MIDIListener";
import { passage } from "./utils/passage";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const inputValueRef = useRef(""); // 🔥 Real-time input tracking
  const currentWordIndexRef = useRef(0); // 🔥 Real-time word index tracking

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedWords, setTypedWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(null);

  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0);
  const words = passage[selectedPassageIndex].split(" ");

  const checkWordCorrectness = (typedWord, targetWord) => {
    const cleanTyped = typedWord.trim().toLowerCase();
    const cleanTarget = targetWord.trim().toLowerCase();

    console.log("Checking word:", {
      typed: cleanTyped,
      target: cleanTarget,
      isCorrect: cleanTyped === cleanTarget,
      rawTyped: typedWord,
      rawTarget: targetWord,
      currentWordIndex: currentWordIndexRef.current,
    });

    return cleanTyped === cleanTarget;
  };

  const handleMIDIInput = (char) => {
    console.log("MIDI Input received:", {
      char,
      currentInput: inputValueRef.current,
    });

    if (char === "\b") {
      setInputValue((prev) => {
        const newValue = prev.slice(0, -1);
        inputValueRef.current = newValue;
        console.log("Backspace:", { prev, newValue });
        return newValue;
      });
    } else if (char === "check_word") {
      const currentInput = inputValueRef.current;
      const currentIndex = currentWordIndexRef.current;

      if (currentIndex < words.length) {
        console.log("Space pressed:", {
          currentInput,
          currentWord: words[currentIndex],
          currentWordIndex: currentIndex,
        });

        const isCorrect = checkWordCorrectness(
          currentInput,
          words[currentIndex]
        );

        setTypedWords((prev) => [
          ...prev,
          { word: words[currentIndex], correct: isCorrect },
        ]);

        setCurrentWordIndex((prev) => {
          const next = prev + 1;
          currentWordIndexRef.current = next;
          return next;
        });

        setInputValue("");
        inputValueRef.current = "";

        if (!isRunning) setIsRunning(true);
      }
    } else {
      setInputValue((prev) => {
        const newValue = prev + char;
        inputValueRef.current = newValue;
        console.log("Character added:", { prev, char, newValue });
        return newValue;
      });

      if (!isRunning) setIsRunning(true);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }

    if (timeLeft === 0) {
      setIsRunning(false);
      calculateWPM();
    }
  }, [isRunning, timeLeft]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    inputValueRef.current = e.target.value;
    if (!isRunning) setIsRunning(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === " " && currentWordIndex < words.length) {
      e.preventDefault();

      const currentIndex = currentWordIndexRef.current;
      const isCorrect = checkWordCorrectness(inputValue, words[currentIndex]);

      setTypedWords((prev) => [
        ...prev,
        { word: words[currentIndex], correct: isCorrect },
      ]);

      setCurrentWordIndex((prev) => {
        const next = prev + 1;
        currentWordIndexRef.current = next;
        return next;
      });

      setInputValue("");
      inputValueRef.current = "";
    }
  };

  const calculateWPM = () => {
    const correctWords = typedWords.filter((w) => w.correct).length;
    setWpm(correctWords);
  };

  const resetTest = () => {
    setCurrentWordIndex(0);
    currentWordIndexRef.current = 0;

    setTypedWords([]);
    setTimeLeft(60);
    setIsRunning(false);
    setWpm(null);
    setInputValue("");
    inputValueRef.current = "";
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-black">
      <select
        value={selectedPassageIndex}
        onChange={(e) => {
          setSelectedPassageIndex(parseInt(e.target.value));
          resetTest(); // Reset test when changing passages
        }}
        className="mb-4 p-2 rounded bg-gray-800 text-white"
      >
        {passage.map((_, index) => (
          <option key={index} value={index}>
            Passage {index + 1}
          </option>
        ))}
      </select>

      <TypingTest
        words={words}
        currentWordIndex={currentWordIndex}
        typedWords={typedWords}
        timeLeft={timeLeft}
        wpm={wpm}
        resetTest={resetTest}
        currentInput={inputValue}
      />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        className="mb-4 p-2 border border-gray-400 rounded w-[50vw] text-center text-white text-xl bg-transparent"
        placeholder="Hit space to proceed to the next word"
      />
      <MIDIListener onMIDIInput={handleMIDIInput} />
    </div>
  );
}
