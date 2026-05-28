import { Outlet, useLocation, Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Package,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  ChevronDown,
  Eye,
} from "lucide-react";
import logoImage from "../../../Logo/Logo.png";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
}

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Ticket, label: "Tickets", path: "/admin/tickets" },
  { icon: Users, label: "Employees", path: "/admin/employees" },
  { icon: Package, label: "Inventory", path: "/admin/inventory" },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("User");
  const [currentUserDesignation, setCurrentUserDesignation] = useState("Portal Access");
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const isAdmin = location.pathname.startsWith("/admin");
  const navItems = isAdmin ? adminNavItems : hrNavItems;
  const notifications = isAdmin
    ? [
        "New HR onboarding request submitted",
        "3 employee tickets need review",
        "1 laptop allocation is pending update",
      ]
    : [
        "Admin updated one onboarding request",
        "2 requests are waiting for admin review",
        "Status changed on one submitted employee request",
      ];

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const syncStoredUser = () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        setCurrentUserName(storedUser.name);
        setCurrentUserDesignation(storedUser.designation);
      }
    };

    const storedRole = getStoredRole();
    syncStoredUser();

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

    window.addEventListener("levista-user-updated", syncStoredUser);
    return () => window.removeEventListener("levista-user-updated", syncStoredUser);
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    clearStoredRole();
    navigate("/login", { replace: true });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    const nextParams = new URLSearchParams(searchParams);
    const trimmedValue = value.trim();

    if (trimmedValue) {
      nextParams.set("q", trimmedValue);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams, { replace: true });
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
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#38bdf8]/10">
              <img src={logoImage} alt="Levista logo" className="h-8 w-8 object-contain" />
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
                      ? "bg-[#38bdf8]/15 text-slate-950 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#38bdf8]/15 font-semibold text-[#0284c7]">
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
                <DropdownMenuItem onSelect={() => navigate(`${isAdmin ? "/admin" : "/hr"}/settings`)}>
                  Profile Settings
                </DropdownMenuItem>
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
                value={searchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="border-slate-300 bg-white pl-10 text-slate-950 placeholder:text-slate-400"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-700 hover:bg-slate-100"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#38bdf8]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification} className="py-3 whitespace-normal">
                  {notification}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
