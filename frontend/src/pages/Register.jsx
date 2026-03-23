import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (credentials.password !== credentials.password2) {
      setError({ password: ["Passwords do not match"] });
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating account...");

    try {
      const response = await registerUser(credentials);

      if (response.success) {
        toast.success("Account created successfully!", { id: toastId });
        navigate("/login");
      } else {
        setError(response.errors || { general: ["Registration failed"] });
        toast.error("Registration failed", { id: toastId });
      }
    } catch (err) {
      setError({ general: ["Something went wrong."] });
      toast.error("Something went wrong.", { id: toastId });
    }

    setLoading(false);
  };

  const handleToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-slate-100">

      {/* Header */}
      <header className="w-full border-b border-border-dark px-6 py-4 flex items-center justify-between bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <svg className="w-8 h-8" viewBox="0 0 48 48" fill="currentColor">
              <path d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24Z" />
            </svg>
          </div>
          <Link to="/"><h1 className="text-xl font-bold tracking-tight">
            Aegis Finder
          </h1></Link>
          
        </div>

        <Link to="/login" className="text-sm font-bold hover:underline">
          Log in
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">

        {/* Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[100px] bg-primary/10"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[100px] bg-primary/20"></div>

        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Content */}
          <div className="hidden lg:flex flex-col gap-6 pr-10">
            <h2 className="text-5xl font-black leading-tight">
              Create Your <span className="text-primary">Shield</span>
            </h2>
            <p className="text-muted-dark text-lg max-w-md">
              Protect your stats, find elite teammates, and dominate the arena.
            </p>
          </div>

          {/* Registration Card */}
          <div className="bg-surface-dark border border-border-dark rounded-xl p-8 shadow-lg shadow-primary/10">

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">
                Join the Aegis Finder
              </h3>
              <p className="text-muted-dark text-sm">
                Registration takes less than a minute.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300 ml-1">
                    Username
                  </label>
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
                    className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        email: e.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
              </div>

            {/* Password */}
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-semibold text-slate-300 ml-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                      required
                    />
                  </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-semibold text-slate-300 ml-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={credentials.password2}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  password2: e.target.value,
                })
              }
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-10 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              required
            />

            {/* Eye Icon */}
            <span onClick={handleToggle} className="absolute right-3 top-[38px] cursor-pointer">
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </span>
          </div>
                 
              {/* Error Messages */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded-lg text-sm">
                  {Object.keys(error).map((field) => (
                    <div key={field}>
                      <strong>{field}:</strong> {error[field].join(", ")}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-red-700 text-white font-black py-4 rounded-lg uppercase tracking-widest transition active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create My Account"}
              </button>

              <p className="text-center text-sm text-muted-dark mt-6">
                Already have an account?{" "}
                <Link to="/login" className="font-bold hover:underline">
                  Log in
                </Link>
              </p>

            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-dark py-8 px-6 bg-background-dark text-center text-xs text-muted-dark">
        © 2024 Aegis Finder. All gaming assets belong to their respective owners.
      </footer>

    </div>
  );
};

export default Register;