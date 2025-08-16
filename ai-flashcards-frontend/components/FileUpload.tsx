"use client";

import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("pdf", file);

    const res = await fetch("http://localhost:5000/api/flashcards/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Uploaded & Processed:", data);
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-lg mx-auto text-center">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border border-gray-300 rounded p-2 mb-4 w-full"
      />
      <button
        onClick={handleUpload}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
      >
        Upload & Generate Flashcards
      </button>
    </div>
  );
}
