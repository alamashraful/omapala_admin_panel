"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/lib/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div style={{ padding: "28px 24px 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: "28px" }}>
          Admin Central
        </div>
        <div style={{ marginTop: 6, color: "var(--sidebar-muted)", fontSize: 12 }}>
          Community Management
        </div>
      </div>

      <nav className="sidebar-nav">
        {adminNavigation.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${isActive ? " sidebar-link-active" : ""}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ color: "var(--sidebar-muted)", fontSize: 12 }}>
          Sprint 0 shell
        </div>
      </div>
    </aside>
  );
}
