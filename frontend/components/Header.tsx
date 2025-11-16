"use client";
import Link from "next/link";
import { ConnectKitButton } from "connectkit";

export default function Header() {
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-full" />
        <h1 className="text-xl font-semibold">StreamWatch</h1>
      </div>

      <nav className="flex items-center gap-4">
        <Link href="/" className="text-sm">
          Home
        </Link>
        <Link href="/dashboard" className="text-sm">
          Dashboard
        </Link>
        <ConnectKitButton />
      </nav>
    </header>
  );
}
