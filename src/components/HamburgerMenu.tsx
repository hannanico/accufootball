"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "HOME", icon: "⚽" },
  { href: "/leagues", label: "LEAGUES", icon: "🏆" },
  { href: "/selections", label: "MY SELECTIONS", icon: "📋" },
  { href: "/account", label: "ACCOUNT", icon: "👤" },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-1.5 p-3 border-3 border-yellow-400 rounded-lg"
      >
        <span className="w-5 h-0.5 bg-white block" />
        <span className="w-5 h-0.5 bg-white block" />
        <span className="w-5 h-0.5 bg-white block" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#111111] z-50 transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#2a2a2a]">
          <span className="text-yellow-400 font-black text-lg tracking-widest">ACCUFOOTBALL</span>
          <button onClick={() => setOpen(false)} className="text-gray-400 text-xl">✕</button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 text-sm font-bold tracking-wider border-b border-[#1a1a1a] transition-colors ${
                  isActive
                    ? "text-yellow-400 bg-[#1a1a1a] border-l-4 border-l-yellow-400"
                    : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
