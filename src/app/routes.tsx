import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { HRDashboard } from "./pages/HRDashboard";
import { TicketsPage } from "./pages/TicketsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { InventoryPage } from "./pages/InventoryPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { RaiseTicketPage } from "./pages/RaiseTicketPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "raise-ticket", Component: RaiseTicketPage },
      {
        path: "admin",
        Component: DashboardLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "tickets", Component: TicketsPage },
          { path: "tickets/:id", Component: TicketDetailPage },
          { path: "employees", Component: EmployeesPage },
          { path: "inventory", Component: InventoryPage },
          { path: "reports", Component: ReportsPage },
          { path: "settings", Component: SettingsPage },
        ],
      },
      {
        path: "hr",
        Component: DashboardLayout,
        children: [
          { index: true, Component: HRDashboard },
          { path: "tickets", Component: TicketsPage },
          { path: "tickets/:id", Component: TicketDetailPage },
          { path: "reports", Component: ReportsPage },
          { path: "settings", Component: SettingsPage },
        ],
      },
    ],
  },
]);
