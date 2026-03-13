import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [flash, setFlash] = useState(false);

  //  Random lightning flash
  useEffect(() => {
    const interval = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 120);
    }, Math.random() * 8000 + 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden text-white bg-black">

      {/*  Background Layer */}
      <div className="absolute inset-0 z-0">

        <img
          src="/images/dota-ti-bg.png"
          alt="Dota Battlefield"
          className="hero-bg w-full h-full object-cover brightness-75 contrast-125"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70" />

      </div>

      {/*  Hero Content */}
      <div className="relative z-20 text-center px-6 max-w-5xl">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          The Battle Awaits
        </h1>

        <p className="text-slate-300 mb-8">
          Forge your squad. Master your craft.
        </p>

         <div className="flex flex-col sm:flex-row gap-6 justify-center">

  <Link
    to="/register"
    className="px-12 py-4 bg-red-700 hover:bg-red-600 font-bold rounded-lg text-lg tracking-wide transition shadow-2xl shadow-red-900/40"
  >
    Enter the Arena
  </Link>

  <Link
    to="/login"
    className="px-12 py-4 bg-red-700 hover:bg-red-600 font-bold rounded-lg text-lg tracking-wide transition shadow-2xl shadow-red-900/40"
  >
    Continue the Fight
  </Link>

</div>
      </div>

    </section>
  );
};

export default HomePage;



const FeatureCard = ({ title, description }) => (
  <div className="group bg-neutral-800 border border-white/5 p-8 rounded-xl hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);


const Stat = ({ number, label }) => (
  <div>
    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
      {number}
    </div>
    <div className="text-xs uppercase tracking-widest text-slate-400">
      {label}
    </div>
  </div>
);

