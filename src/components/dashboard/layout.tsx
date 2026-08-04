"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutList,
  LayoutGrid,
  Calendar,
  BarChart3,
  Clock,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Задачи", href: "/dashboard/tasks", icon: LayoutList },
  { name: "Канбан", href: "/dashboard?view=kanban", icon: LayoutGrid },
  { name: "Календарь", href: "/dashboard/calendar", icon: Calendar },
  { name: "Аналитика", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Фокус", href: "/dashboard/focal", icon: Clock },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasHydrated, logout, fetchUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    
    console.log("[DASHBOARD] hasHydrated:", hasHydrated, "user:", user);
    setCheckingAuth(false);
    
    if (!user) {
      console.log("[DASHBOARD] No user, redirecting to /login");
      router.push("/login");
    }
  }, [user, hasHydrated, router]);

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    if (hasHydrated && user) {
      console.log("[DASHBOARD] User exists, fetching user");
      fetchUser().catch(() => {
        // Если токен невалиден, выходим
        console.log("[DASHBOARD] fetchUser failed, logging out");
        logout();
        router.push("/login");
      });
    }
  }, [hasHydrated, user, fetchUser, router, logout]);

  if (checkingAuth || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null; // Редирект уже запущен
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">SmartTask</span>
          </div>
          <button
            className="lg:hidden p-1 hover:bg-muted rounded"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href.includes("?") && pathname?.startsWith(item.href.split("?")[0]));

            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Переключить тему"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLogout}
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b flex items-center px-4 lg:px-6 gap-2">
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold capitalize">
            {navigation.find((n) => n.href === pathname || pathname?.startsWith(n.href))?.name ||
              "Dashboard"}
          </h1>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
