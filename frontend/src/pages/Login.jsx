import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Signing in...");

    try {
      const success = await login(credentials);

      if (success) {
        toast.success("Signed in successfully!", { id: toastId });
        navigate("/dashboard");
      } else {
        toast.error("Login failed. Try again.", { id: toastId });
      }
    } catch (err) {
      toast.error("Login failed. Try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-slate-100 font-display">

      {/* Header */}
      <header className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">
              shield_with_heart
            </span>
          </div>
          <h1 className="text-xl font-bold uppercase">
            Aegis Finder
          </h1>
        </div>

        <div className="hidden md:flex gap-6 items-center">
          <Link className="text-sm text-primary" to="/login">
            Login
          </Link>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <Link className="text-sm text-primary" to="/register">
            Register
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(229,62,62,0.05)_1px,transparent_0)] bg-[length:40px_40px]"></div>

        {/* Glow */}
        <div className="absolute w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>

        <div className="w-full max-w-[440px] z-10">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-8 shadow-2xl">

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-sm">
                Access your Dota 2 match history and performance analytics.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">
                  Username
                </label>

                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    person
                  </span>

                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        username: e.target.value,
                      })
                    }
                    placeholder="LegendaryPlayer"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-semibold text-slate-300">
                    Password
                  </label>
                  <Link
                    to="#"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    lock
                  </span>

                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 text-primary focus:ring-primary/30 bg-transparent"
                />
                <label className="text-sm text-slate-400">
                  Remember this device
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-red-700 font-bold py-4 rounded-lg transition-all shadow-lg shadow-primary/10 active:scale-[0.98] text-white disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-4 text-slate-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Steam Button */}
            <button className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-4 rounded-lg hover:opacity-90 transition-all active:scale-[0.98]">
              Sign in with Steam
            </button>

            <p className="mt-8 text-center text-sm text-slate-500">
              New to Aegis Finder?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Create an account
              </Link>
              <br/>
              <Link to="/forgot-password" className="text-primary font-semibold hover:underline">Forgot Password?</Link>
            </p>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-xs text-slate-500 text-center">
        © 2024 Aegis Finder. Not affiliated with Valve Corporation.
      </footer>

    </div>
  );
};

export default LoginPage;