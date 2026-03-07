"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, BookmarkCheck, User } from "lucide-react";

const links = [
  { href: "/",           label: "Home",       icon: Home },
  { href: "/leagues",    label: "Leagues",    icon: Trophy },
  { href: "/selections", label: "Selections", icon: BookmarkCheck },
  { href: "/account",    label: "Account",    icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-120 bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center h-16 z-50">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
          >
            <Icon size={22} color={active ? "#facc15" : "#888"} />
            <span className={`text-[11px] ${active ? "text-yellow-400" : "text-gray-500"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
