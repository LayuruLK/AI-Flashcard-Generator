"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-wide">
          AI Flashcards
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          ☰
        </button>

        <div className={`flex flex-col md:flex-row md:gap-6 ${isOpen ? "block" : "hidden"} md:block`}>
          <Link href="/dashboard" className="hover:text-yellow-300 transition">Dashboard</Link>
          <Link href="/upload" className="hover:text-yellow-300 transition">Upload PDF</Link>
          <Link href="/login" className="hover:text-yellow-300 transition">Login</Link>
        </div>
      </div>
    </nav>
  );
}
