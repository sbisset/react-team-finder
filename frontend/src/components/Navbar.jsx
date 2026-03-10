// Navbar.jsx
import React from "react";

const navLinks = [
  { name: "Search", href: "#" },
  { name: "Teams", href: "#" },
  { name: "Insights", href: "#" },
  { name: "Scrims", href: "#" },
];

const Navbar = () => {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-border-dark glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-primary p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-white text-2xl">
              grid_view
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tighter text-white">
            DOTA FINDER
          </h2>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-10 flex-1 justify-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Buttons */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-medium px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
            Login
          </button>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20">
            Join Now
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
