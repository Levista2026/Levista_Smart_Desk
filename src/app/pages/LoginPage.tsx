import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ShieldCheck, Users } from "lucide-react";
import { getStoredUser, loginWithUserAccess } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"admin" | "hr" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser?.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (storedUser?.role === "hr") {
      navigate("/hr", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please select a role first.");
      return;
    }

    setLoading(true);

    try {
      const user = await loginWithUserAccess(email, password, selectedRole);

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/hr", { replace: true });
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf8] px-4 py-8 text-slate-900 sm:px-6">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex flex-col items-center gap-1">
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Levista SmartDesk</h1>
            <p className="text-sm text-slate-500">Admin and HR access portal</p>
          </div>
        </div>

        {!selectedRole ? (
          <>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-slate-950">Welcome back</h2>
              <p className="text-slate-600">Select your Levista role to continue</p>
            </div>

            <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
              <Card
                className="cursor-pointer border-slate-200 bg-white transition-all group hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                onClick={() => {
                  setSelectedRole("admin");
                  setError("");
                }}
              >
                <CardContent className="p-6 text-center sm:p-8">
                  <div className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-[#3ecf8e]/15 text-[#16a34a] transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <ShieldCheck className="h-9 w-9 sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-950">Admin Portal</h3>
                  <p className="mb-6 text-slate-600">
                    Full system access, analytics, and user management
                  </p>
                  <Button className="w-full bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]">
                    Login as Admin
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border-slate-200 bg-white transition-all group hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                onClick={() => {
                  setSelectedRole("hr");
                  setError("");
                }}
              >
                <CardContent className="p-6 text-center sm:p-8">
                  <div className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-[#3ecf8e]/15 text-[#16a34a] transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <Users className="h-9 w-9 sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-950">HR Portal</h3>
                  <p className="mb-6 text-slate-600">
                    Employee requests, onboarding, and approvals
                  </p>
                  <Button className="w-full bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]">
                    Login as HR
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="mx-auto max-w-md border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-950">
                {selectedRole === "admin" ? "Admin" : "HR"} Login
              </CardTitle>
              <CardDescription className="text-slate-600">
                Enter your credentials to access the {selectedRole} portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@levista.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-900">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400"
                    required
                  />
                </div>
                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="rounded" />
                    Remember me
                  </label>
                  <a href="#" className="text-[#16a34a] hover:text-[#15803d]">
                    Forgot password?
                  </a>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-700 hover:bg-slate-100"
                  onClick={() => setSelectedRole(null)}
                >
                  Back to Role Selection
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="text-[#16a34a] hover:text-[#15803d]">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
