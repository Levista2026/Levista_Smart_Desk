import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { listInventoryItems, type InventoryItem } from "../lib/admin-data";

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      setError("");

      try {
        const rows = await listInventoryItems();
        setItems(rows);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };

    void loadInventory();
  }, []);

  const columns = useMemo(() => {
    const firstRow = items[0];
    return firstRow ? Object.keys(firstRow) : [];
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Inventory</h1>
        <p className="mt-2 text-slate-600">Inventory details from the `Inventory` table.</p>
      </div>

      <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="overflow-hidden rounded-lg border border-slate-200">
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
                  <TableHead className="text-slate-600">Inventory</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-slate-500">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-slate-500">
                    No inventory details found in Supabase.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id ?? index} className="border-slate-200 hover:bg-slate-50">
                    {columns.map((column) => (
                      <TableCell key={`${item.id}-${column}`} className="text-slate-600">
                        {item[column] === null ? "-" : String(item[column])}
                      </TableCell>
                    ))}
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
