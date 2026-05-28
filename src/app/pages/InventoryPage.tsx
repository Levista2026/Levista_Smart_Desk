import { useEffect, useMemo, useState } from "react";
import { Plus, PencilLine } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  createInventoryItem,
  listInventoryItems,
  updateInventoryItem,
  type InventoryItem,
  type TableCellValue,
} from "../lib/admin-data";

type InventoryFormState = Record<string, string>;

function getColumnsFromItem(item: InventoryItem | undefined) {
  if (!item) {
    return [];
  }

  return Object.keys(item).filter((column) => column !== "id");
}

function toFormState(item: InventoryItem, columns: string[]) {
  return Object.fromEntries(
    columns.map((column) => [column, item[column] === null ? "" : String(item[column] ?? "")]),
  );
}

function getParsedValue(rawValue: string, sampleValue: TableCellValue | undefined) {
  if (typeof sampleValue === "boolean") {
    return rawValue.trim().toLowerCase() === "true";
  }

  if (typeof sampleValue === "number") {
    return rawValue.trim() === "" ? null : Number(rawValue);
  }

  return rawValue;
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formState, setFormState] = useState<InventoryFormState>({});

  const loadInventory = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }

    setError("");

    try {
      const rows = await listInventoryItems();
      setItems(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load inventory.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadInventory({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const columns = useMemo(() => getColumnsFromItem(items[0]), [items]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedItem(null);
    setFormState(Object.fromEntries(columns.map((column) => [column, ""])));
    setDialogOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setFormState(toFormState(item, columns));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (columns.length === 0) {
      setError("Inventory schema could not be inferred from the table.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (dialogMode === "create") {
        const payload = Object.fromEntries(
          columns.map((column) => [column, formState[column]?.trim() ?? ""]),
        );
        const created = await createInventoryItem(payload);
        setItems((current) => [created, ...current]);
      } else if (selectedItem) {
        const payload = Object.fromEntries(
          columns.map((column) => [
            column,
            getParsedValue(formState[column] ?? "", selectedItem[column]),
          ]),
        );

        const updated = await updateInventoryItem(selectedItem.id, payload);
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }

      setDialogOpen(false);
      setSelectedItem(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save inventory record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Inventory</h1>
          <p className="mt-2 text-slate-600">
            Add and update inventory records directly against the `Inventory` Supabase table.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          disabled={columns.length === 0}
          className="bg-[#38bdf8] text-slate-950 hover:bg-[#0ea5e9]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-6 py-4 text-sm text-slate-500">
          Inventory data refreshes automatically every 15 seconds.
        </div>
        <div className="overflow-hidden rounded-b-lg border border-slate-200 border-t-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-600">id</TableHead>
                {columns.length > 0 ? (
                  columns.map((column) => (
                    <TableHead key={column} className="text-slate-600">
                      {column}
                    </TableHead>
                  ))
                ) : (
                  <TableHead className="text-slate-600">Inventory</TableHead>
                )}
                <TableHead className="text-slate-600">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length + 2, 3)} className="py-8 text-center text-slate-500">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length + 2, 3)} className="py-8 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={Math.max(columns.length + 2, 3)} className="py-8 text-center text-slate-500">
                    No inventory details found in Supabase.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-mono text-slate-950">{item.id}</TableCell>
                    {columns.map((column) => (
                      <TableCell key={`${item.id}-${column}`} className="text-slate-600">
                        {item[column] === null ? "-" : String(item[column])}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                        onClick={() => openEditDialog(item)}
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-slate-200 bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-950">
              {dialogMode === "create" ? "Add Inventory Record" : "Edit Inventory Record"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {dialogMode === "create"
                ? "Create a new row in the Supabase Inventory table."
                : "Update this Inventory table row directly in Supabase."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            {columns.map((column) => (
              <div key={column} className="space-y-2">
                <Label htmlFor={`inventory-${column}`}>{column}</Label>
                <Input
                  id={`inventory-${column}`}
                  value={formState[column] ?? ""}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      [column]: event.target.value,
                    }))
                  }
                  className="border-slate-300 bg-white text-slate-950"
                  placeholder={`Enter ${column}`}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              className="bg-[#38bdf8] text-slate-950 hover:bg-[#0ea5e9]"
              onClick={() => {
                void handleSave();
              }}
            >
              {saving ? "Saving..." : dialogMode === "create" ? "Add Record" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
