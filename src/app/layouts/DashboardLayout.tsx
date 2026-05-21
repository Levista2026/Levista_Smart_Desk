import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Users,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { clearStoredRole, getStoredRole, getStoredUser } from "../lib/auth";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Ticket, label: "Tickets", path: "/admin/tickets", badge: 12 },
  { icon: Users, label: "Employees", path: "/admin/employees" },
  { icon: FileText, label: "Reports", path: "/admin/reports" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const hrNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/hr" },
  { icon: Eye, label: "View Status", path: "/hr?tab=view-status" },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("User");
  const [currentUserDesignation, setCurrentUserDesignation] = useState("Portal Access");
  const isAdmin = location.pathname.startsWith("/admin");
  const navItems = isAdmin ? adminNavItems : hrNavItems;
  const userRole = isAdmin ? "admin" : "hr";

  useEffect(() => {
    const storedRole = getStoredRole();
    const storedUser = getStoredUser();

    if (storedUser) {
      setCurrentUserName(storedUser.name);
      setCurrentUserDesignation(storedUser.designation);
    }

    if (!storedRole) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAdmin && storedRole !== "admin") {
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdmin && storedRole !== "hr") {
      navigate("/login", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    clearStoredRole();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8faf8] text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-r border-slate-200 bg-white">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3ecf8e]/15 text-[#16a34a]">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-950">Levista SmartDesk</h1>
              <p className="text-xs text-slate-500">Support Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const currentRoute = `${location.pathname}${location.search}`;
              const isActive = currentRoute === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#3ecf8e]/15 text-slate-950 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge className="border-0 bg-[#3ecf8e] text-slate-950">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3ecf8e]/15 font-semibold text-[#15803d]">
                    {currentUserName[0] ?? "U"}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-950">{currentUserName}</p>
                    <p className="text-xs text-slate-500">{currentUserDesignation}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onSelect={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search tickets, employees..."
                className="border-slate-300 bg-white pl-10 text-slate-950 placeholder:text-slate-400"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-700 hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#22c55e]" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
