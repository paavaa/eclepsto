// App.tsx — Eclepsto v1.0
// API: restcountries.com (gratis, sin key) + api-ninjas para ciudades (key gratuita)

import { useEffect, useState } from "react";
import countriesData from "./data/countries.json";

// ─── Tipos ────────────────────────────────────────────────────────
interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>; // ← campo extra del JSON
  };
  flags: { png: string; svg: string };
  capital?: string[];
  region?: string;
  subregion?: string;
  population?: number;
  timezones?: string[];
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
}

interface CityResult {
  name: string;
  country: string;
  countryCode: string;  // ISO 3166-1 alpha-2, ej: "CO"
  population?: number;
}

type SearchType = "country" | "capital" | "city";

// ─── Constantes ───────────────────────────────────────────────────
const COUNTRIES_API = "https://restcountries.com/v3.1";

// Obtén tu key gratuita en https://api-ninjas.com (plan free = 10k req/mes)
// Luego ponla en .env como: VITE_NINJA_KEY=tu_key_aqui
const NINJA_KEY = import.meta.env.VITE_NINJA_KEY ?? "";

// ─── Componente principal ─────────────────────────────────────────
function App() {
  const [search, setSearch] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [cityResult, setCityResult] = useState<CityResult | null>(null);
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Carga todos los países al montar (para búsqueda local rápida)
  useEffect(() => {
    setCountries(countriesData as unknown as Country[]);
    setLoading(false);
  }, []);

  // ── Búsqueda principal ────────────────────────────────────────────
  const handleSearch = async () => {
    console.log("Countries:", countries.length);
    const query = search.trim().toLowerCase();
    if (!query) return;

    setSearching(true);
    setError("");
    setCountry(null);
    setCityResult(null);

    try {
      // 1️⃣  Buscar por nombre de país
      const byName = countries.find((c) =>
        c.name.common.toLowerCase().includes(query)
      );
      if (byName) {
        setCountry(byName);
        setSearchType("country");
        return;
      }

      // 2️⃣  Buscar por capital
      const byCapital = countries.find((c) =>
        c.capital?.some((cap) => cap.toLowerCase().includes(query))
      );
      if (byCapital) {
        setCountry(byCapital);
        setSearchType("capital");
        return;
      }

      // 3️⃣  Buscar por ciudad (API Ninjas — requiere key)
      //    Si no tienes key aún, esta parte queda como pendiente
      if (NINJA_KEY) {
        const cityRes = await fetch(
          `https://api.api-ninjas.com/v1/city?name=${encodeURIComponent(query)}&limit=1`,
          { headers: { "X-Api-Key": NINJA_KEY } }
        );
        if (cityRes.ok) {
          const cityData = await cityRes.json();
          if (cityData.length > 0) {
            const { name, country: countryName, country_id, population } = cityData[0];
            setCityResult({ name, country: countryName, countryCode: country_id, population });

            // También traemos el país de esa ciudad
            const countryOfCity = countries.find((c) =>
              c.name.common.toLowerCase() === countryName.toLowerCase()
            );
            if (countryOfCity) setCountry(countryOfCity);
            setSearchType("city");
            return;
          }
        }
      }

      setError(`No se encontraron resultados para "${search}"`);
    } catch (err) {
      console.error(err);
      setError("Error al buscar. Intenta de nuevo.");
    } finally {
      setSearching(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">

      {/* ── Fondos decorativos (sin cambios) ── */}
      <div className="absolute -top-40 right-[-250px] h-[800px] w-[800px] rounded-full bg-indigo-600/10 blur-[220px]" />
      <div className="absolute -bottom-80 -left-40 h-[900px] w-[900px] rounded-full bg-violet-600/10 blur-[260px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_65%)]" />

      {/* ── Eclipse ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[58%] h-[1100px] w-[1100px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[220px]" />
        <div className="absolute left-1/2 top-[60%] h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-400 via-indigo-500 to-purple-500 blur-[45px] opacity-90" />
        <div className="absolute left-1/2 top-[60%] h-[940px] w-[940px] -translate-x-1/2 rounded-full border border-violet-400/15" />
        <div className="absolute left-1/2 top-[63%] h-[860px] w-[860px] -translate-x-1/2 rounded-full bg-black" />
        <div className="absolute left-1/2 top-[72%] h-[160px] w-[850px] -translate-x-1/2 rotate-[-18deg] bg-white/5 blur-[80px]" />
        <div className="absolute left-1/2 top-[72%] h-[60px] w-[450px] -translate-x-1/2 rotate-[-18deg] bg-violet-300/20 blur-[50px]" />
      </div>

      {/* ── Contenido ── */}
      <section className="relative z-20 flex min-h-screen flex-col items-center pt-24 px-6">
        <h1 className="text-6xl md:text-7xl font-semibold tracking-[0.35em] text-white">
          ECLEPSTO
        </h1>
        <p className="mt-5 text-zinc-400 text-lg">Explore the world through data</p>

        <div className="mt-12 w-full max-w-2xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search country, capital or city..."
            disabled={loading || searching}
            className="w-full rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-white backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-400/40 focus:bg-white/[0.08] disabled:opacity-50"
          />
          <button
            onClick={handleSearch}
            disabled={loading || searching}
            className="mt-4 w-full rounded-full border border-violet-500/20 bg-violet-600/80 py-4 font-medium text-white transition-all duration-300 hover:bg-violet-500 disabled:opacity-50"
          >
            {searching ? "Searching..." : loading ? "Loading countries..." : "Search"}
          </button>

          {error && (
            <p className="mt-4 text-center text-red-400">{error}</p>
          )}

          {/* ── Badge tipo de resultado ── */}
          {searchType && country && (
            <p className="mt-6 text-center text-xs uppercase tracking-widest text-zinc-500">
              {searchType === "country" && "↳ result: country"}
              {searchType === "capital" && "↳ result: capital city"}
              {searchType === "city"    && "↳ result: city"}
            </p>
          )}

          {/* ── Tarjeta de ciudad ── */}
          {cityResult && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">City</p>
              <p className="text-white text-xl font-semibold">{cityResult.name}</p>
              <p className="text-zinc-400 text-sm">{cityResult.country}</p>
              {cityResult.population && (
                <p className="text-zinc-500 text-sm mt-1">
                  Population: {cityResult.population.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* ── Tarjeta de país ── */}
          {country && (
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <img
                  src={country.flags.svg || country.flags.png}
                  alt={country.name.common}
                  className="w-20 rounded-md"
                />
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {country.name.common}
                  </h2>
                  <p className="text-zinc-400">
                    {country.capital?.[0] || "No capital data"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { label: "Region",     value: country.region },
                  { label: "Subregion",  value: country.subregion },
                  { label: "Population", value: country.population?.toLocaleString() },
                  { label: "Timezone",   value: country.timezones?.join(", ") },
                  { label: "Languages",  value: country.languages ? Object.values(country.languages).join(", ") : null },
                  { label: "Currencies", value: country.currencies ? Object.values(country.currencies).map((c) => `${c.name} (${c.symbol})`).join(", ") : null },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-zinc-500">{label}</p>
                    <p className="text-white">{value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
