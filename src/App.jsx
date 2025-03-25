import React, { useState, useRef } from "react";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const handleKeyClick = (char) => {
    setInputValue((prev) => prev + char);
    inputRef.current.focus();
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-black">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="mb-4 p-2 border border-gray-400 rounded w-[50vw] text-center text-white text-4xl"
        placeholder="Type here..."
      />
      <div className="flex">
        {["w", "x", "y", "z", "v"].map((char, index) => (
          <button
            key={index}
            onClick={() => handleKeyClick(char)}
            className="w-[10vw] h-[40vh] bg-white border border-black mr-1 last:mr-0 active:bg-gray-300"
          />
        ))}
      </div>
    </div>
  );
}
