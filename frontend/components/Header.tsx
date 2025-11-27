"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="
      bg-white 
      border-b 
      py-4 
      px-6 
      md:px-12 
      lg:px-24 
      flex 
      justify-between 
      items-center 
      shadow-sm
      relative
    ">
      {/* LOGO + TITLE */}
      <div className="flex items-center gap-3">
        <Image
          src="/streamwatchlogo.png"
          alt="StreamWatch Logo"
          width={55}
          height={55}
          className="rounded-full"
        />
        <h1 className="text-xl md:text-2xl font-bold text-[#0b1a33]">
          StreamWatch DAO
        </h1>
      </div>

      {/* DESKTOP NAVIGATION */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/" className="text-[#0b1a33] font-medium hover:underline">
          Home
        </Link>
        <Link href="/dashboard" className="text-[#0b1a33] font-medium hover:underline">
          Dashboard
        </Link>

        <ConnectKitButton />
      </nav>

      {/* MOBILE TOGGLE BUTTON */}
      <button
        className="md:hidden text-[#0b1a33] text-xl border px-3 py-1 rounded"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div
          className="
            absolute 
            top-full 
            left-0 
            w-full 
            bg-white 
            border-b 
            shadow-md 
            flex 
            flex-col 
            items-start 
            p-4 
            space-y-4 
            md:hidden
            z-50
          "
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-[#0b1a33] font-medium"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="text-[#0b1a33] font-medium"
          >
            Dashboard
          </Link>

          <div className="pt-2">
            <ConnectKitButton />
          </div>
        </div>
      )}
    </header>
  );
}
