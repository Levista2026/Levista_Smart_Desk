import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { listEmployeeDetails, type EmployeeDetail } from "../lib/admin-data";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError("");

      try {
        const rows = await listEmployeeDetails();
        setEmployees(rows);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load employee details.");
      } finally {
        setLoading(false);
      }
    };

    void loadEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Employees</h1>
        <p className="mt-2 text-slate-600">Employee details from the `Employee_deatils` table.</p>
      </div>

      <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-600">ID</TableHead>
                <TableHead className="text-slate-600">Employee Code</TableHead>
                <TableHead className="text-slate-600">Name</TableHead>
                <TableHead className="text-slate-600">Designation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                    Loading employee details...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={4} className="py-8 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                    No employee details found in Supabase.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="text-slate-950">{employee.id}</TableCell>
                    <TableCell className="font-mono text-slate-950">{employee.Emp_code}</TableCell>
                    <TableCell className="text-slate-950">{employee.Name}</TableCell>
                    <TableCell className="text-slate-600">{employee.Designation}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
