"use client";

import { useState } from "react";

interface FlashcardProps {
  question: string;
  answer: string;
}

export default function Flashcard({ question, answer }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer w-64 h-40 bg-white shadow-xl rounded-xl flex items-center justify-center text-center p-4 transition-transform transform hover:scale-105 hover:shadow-2xl"
    >
      {!flipped ? (
        <p className="font-semibold text-gray-800">{question}</p>
      ) : (
        <p className="text-green-600 font-medium">{answer}</p>
      )}
    </div>
  );
}
