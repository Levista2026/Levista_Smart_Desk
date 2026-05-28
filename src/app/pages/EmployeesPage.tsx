import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  isEmployeeActive,
  listEmployeeDetails,
  updateEmployeeActiveState,
  type EmployeeDetail,
} from "../lib/admin-data";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingEmployeeId, setSavingEmployeeId] = useState<number | null>(null);

  const loadEmployees = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }

    setError("");

    try {
      const rows = await listEmployeeDetails();
      setEmployees(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load employee details.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadEmployees({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const columns = useMemo(() => {
    const firstRow = employees[0];

    if (!firstRow) {
      return [];
    }

    return Object.keys(firstRow).filter(
      (column) =>
        !["status", "Status", "is_active", "isActive", "active", "Active", "access", "Access"].includes(
          column,
        ),
    );
  }, [employees]);

  const handleToggle = async (employee: EmployeeDetail, checked: boolean) => {
    setSavingEmployeeId(employee.id);
    setError("");

    try {
      const updated = await updateEmployeeActiveState(employee, checked);
      setEmployees((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Failed to update employee status.");
    } finally {
      setSavingEmployeeId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Employees</h1>
        <p className="mt-2 text-slate-600">
          Manage employee access from the `Employee_deatils` table. Turning a user off marks them
          inactive and blocks login.
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-6 py-4 text-sm text-slate-500">
          Employee access status refreshes automatically every 15 seconds.
        </div>
        <div className="overflow-hidden rounded-b-lg border border-slate-200 border-t-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                {columns.length > 0 ? (
                  columns.map((column) => (
                    <TableHead key={column} className="text-slate-600">
                      {column}
                    </TableHead>
                  ))
                ) : (
                  <TableHead className="text-slate-600">Employee</TableHead>
                )}
                <TableHead className="text-slate-600">Access</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length + 2, 3)} className="py-8 text-center text-slate-500">
                    Loading employee details...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length + 2, 3)} className="py-8 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length + 2, 3)} className="py-8 text-center text-slate-500">
                    No employee details found in Supabase.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => {
                  const active = isEmployeeActive(employee);
                  const isSaving = savingEmployeeId === employee.id;

                  return (
                    <TableRow key={employee.id} className="border-slate-200 hover:bg-slate-50">
                      {columns.map((column) => (
                        <TableCell key={`${employee.id}-${column}`} className="text-slate-600">
                          {employee[column] === null || employee[column] === undefined
                            ? "-"
                            : String(employee[column])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={active}
                            disabled={isSaving}
                            onCheckedChange={(checked) => {
                              void handleToggle(employee, checked);
                            }}
                          />
                          <span className="text-sm text-slate-600">{active ? "ON" : "OFF"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isSaving ? "Updating..." : active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
