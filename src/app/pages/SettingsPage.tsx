import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getStoredUser, updateStoredUserProfile } from "../lib/auth";

const inputClassName =
  "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-[#38bdf8]/40";

export function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      return;
    }

    setFormData({
      name: user.name,
      email: user.email,
      designation: user.designation,
    });
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateStoredUserProfile(formData);
      setSuccessMessage("Profile updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Profile Settings</h1>
        <p className="mt-2 text-slate-600">
          Update your name, e-mail, and designation for this portal.
        </p>
      </div>

      <Card className="max-w-2xl border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <CardHeader>
          <CardTitle className="text-slate-950">Edit Profile</CardTitle>
          <CardDescription className="text-slate-600">
            Changes are saved in Supabase and reflected in the sidebar profile card.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(event) => handleChange("designation", event.target.value)}
                className={inputClassName}
                required
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                {successMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#38bdf8] text-slate-950 hover:bg-[#0ea5e9]"
            >
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
