"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  KanbanSquare,
  HeartPulse,
  Palette,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/brand-hub", label: "Brand Hub", icon: Palette },
  { href: "/tarefas", label: "Tarefas", icon: KanbanSquare },
  { href: "/saude", label: "Saúde", icon: HeartPulse },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen glass-strong border-r border-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">
            Naka OS
          </h1>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">
            Gaki Marketing
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-text-muted">Naka OS v1.0</p>
      </div>
    </aside>
  );
}
