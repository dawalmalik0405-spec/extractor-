import { NavLink, Outlet } from "react-router-dom";
import { FileText, UploadCloud } from "lucide-react";

const navItems = [
  { to: "/", label: "Upload", icon: UploadCloud },
  { to: "/documents", label: "Documents", icon: FileText }
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <div className="border-b border-line px-6 py-5">
          <h1 className="text-lg font-semibold text-ink">Document Ingestion</h1>
          <p className="mt-1 text-sm text-slate-500">Extraction and vector storage</p>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  isActive ? "bg-teal-50 text-brand" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                ].join(" ")
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-brand">Ingestion Console</p>
              <p className="text-xs text-slate-500">PDF, DOCX, image, and scanned PDF processing</p>
            </div>
            <nav className="flex items-center gap-2 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    [
                      "rounded-md p-2",
                      isActive ? "bg-teal-50 text-brand" : "text-slate-500 hover:bg-slate-100"
                    ].join(" ")
                  }
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
