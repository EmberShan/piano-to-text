import React, { useRef, useEffect, useState } from "react";

export default function TypingTest({
  words,
  currentWordIndex,
  typedWords,
  timeLeft,
  wpm,
  resetTest,
  currentInput,
}) {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [containerWidth, setContainerWidth] = useState(window.innerWidth / 2);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth / 2);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Update visible range when currentWordIndex changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Calculate the middle point of the container
    const middlePoint = containerWidth / 2;

    // Start from current word index and measure cumulative width
    let cumulativeWidth = 0;
    let startIndex = Math.max(0, currentWordIndex - 6); // Keep a few previous words
    let endIndex = startIndex;

    // Create a temporary span to measure word widths
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.fontSize = "1.125rem"; // text-lg
    document.body.appendChild(tempSpan);

    // Find how many words fit in the container
    for (let i = startIndex; i < words.length; i++) {
      tempSpan.textContent = words[i] + " ";
      const wordWidth = tempSpan.offsetWidth;

      if (cumulativeWidth + wordWidth > containerWidth) {
        break;
      }

      // If we're past the middle point and this is after the current word, break
      if (cumulativeWidth > middlePoint && i > currentWordIndex) {
        break;
      }

      cumulativeWidth += wordWidth;
      endIndex = i;
    }

    document.body.removeChild(tempSpan);
    setVisibleRange({ start: startIndex, end: endIndex + 1 });
  }, [currentWordIndex, words, containerWidth]);

  const renderWord = (word, index) => {
    const isCurrentWord = index === currentWordIndex;
    const isTyped = index < currentWordIndex;
    const typedWord = typedWords[index];

    if (isTyped) {
      return (
        <span
          key={index}
          className={`mr-2 ${typedWord.correct ? "text-green-500" : "text-red-500"}`}
        >
          {word}
        </span>
      );
    }

    if (isCurrentWord) {
      return (
        <span key={index} className="mr-2">
          {word.split("").map((letter, letterIndex) => {
            const isTyped = letterIndex < currentInput.length;
            const isCorrect = isTyped && letter.toLowerCase() === currentInput[letterIndex].toLowerCase();
            return (
              <span
                key={letterIndex}
                className={`${isTyped ? (isCorrect ? "text-green-500" : "text-red-500") : "text-gray-400"}`}
              >
                {letter}
              </span>
            );
          })}
        </span>
      );
    }

    return (
      <span key={index} className="text-gray-400 mr-2">
        {word}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{ width: containerWidth }}
      className="flex flex-col items-start space-y-4 p-8 py-10 bg-gray-800 rounded-lg text-white mb-12"
    >
      <div className="flex flex-row justify-between items-center w-full space-x-4">
        <div className="text-xl font-semibold">Time Left: {timeLeft}s</div>
        <button
          onClick={resetTest}
          className="px-4 py-2 bg-transparent border border-white text-white rounded mt-2 hover:bg-gray-700 cursor-pointer"
        >
          Restart Timer
        </button>
      </div>
      <div className="text-lg">WPM: {wpm}</div>

      <div className="w-full border-t border-gray-700 my-4"></div>

      <div className="text-gray-400">
        Type the following words (use space to move to the next word):
      </div>
      <div className="text-2xl overflow-hidden whitespace-nowrap">
        {words
          .slice(visibleRange.start, visibleRange.end)
          .map((word, index) => renderWord(word, index + visibleRange.start))}
      </div>
    </div>
  );
}
