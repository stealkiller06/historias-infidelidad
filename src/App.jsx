import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import "./App.css";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1lQxvBOmsISBZ4CUrelIXwscXB2Zh0-mSCaOKQxrIavY/export?format=csv";

function findIndex(headers, containsText) {
  const needle = containsText.toLowerCase();
  return headers.findIndex((h) => (h || "").toLowerCase().includes(needle));
}

function App() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros
  const [search, setSearch] = useState("");
  const [placeFilter, setPlaceFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [occupationFilter, setOccupationFilter] = useState("");
  const [linkFilter, setLinkFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(SHEET_CSV_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const csvText = await res.text();
        const result = Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          trimHeaders: true,
        });

        if (!result.data || !result.data.length) {
          setStories([]);
          return;
        }

        const [header, ...dataRows] = result.data;

        const nameIdx = findIndex(header, "primer nombre");
        const placeIdx = findIndex(header, "Lugar donde ocurrió");
        const ageIdx = findIndex(header, "Rango de edad");
        const occupationIdx = findIndex(header, "Ocupación general");
        const linkIdx = findIndex(header, "Tipo de vínculo");
        const behaviorIdx = findIndex(header, "Comportamiento observado");
        const descriptionIdx = findIndex(header, "Descripción del personaje");
        const storyIdx = findIndex(header, "Historia (anónima)");

        const parsed = dataRows
          .filter((row) => row.some((cell) => cell && cell.trim() !== ""))
          .map((row, idx) => {
            const get = (i) => (i >= 0 ? (row[i] || "").trim() : "");

            return {
              id: idx + 1,
              name: get(nameIdx),
              place: get(placeIdx),
              age: get(ageIdx),
              occupation: get(occupationIdx),
              link: get(linkIdx),
              behavior: get(behaviorIdx),
              description: get(descriptionIdx),
              storyText: get(storyIdx),
            };
          });

        setStories(parsed);
      } catch (err) {
        console.error(err);
        setError("Error cargando datos. Revisa que el sheet sea público.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // opciones para selects (lugares, edades, etc.)
  const filterOptions = useMemo(() => {
    const uniq = (arr) =>
      Array.from(new Set(arr.filter((v) => v && v !== "."))).sort();

    return {
      places: uniq(stories.map((s) => s.place)),
      ages: uniq(stories.map((s) => s.age)),
      occupations: uniq(stories.map((s) => s.occupation)),
      links: uniq(stories.map((s) => s.link)),
    };
  }, [stories]);

  const filteredStories = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return stories.filter((s) => {
      if (searchLower) {
        const combined = [
          s.name,
          s.place,
          s.age,
          s.occupation,
          s.link,
          s.behavior,
          s.description,
          s.storyText,
        ]
          .join(" ")
          .toLowerCase();

        if (!combined.includes(searchLower)) return false;
      }

      if (placeFilter && s.place !== placeFilter) return false;
      if (ageFilter && s.age !== ageFilter) return false;
      if (occupationFilter && s.occupation !== occupationFilter) return false;
      if (linkFilter && s.link !== linkFilter) return false;

      return true;
    });
  }, [stories, search, placeFilter, ageFilter, occupationFilter, linkFilter]);

  return (
    <div className="page">
      <header>
        <h1>Museo de Infidelidades</h1>
        <p className="subtitle">
          Historias anónimas. Tú sólo estás mirando datos, técnicamente.
        </p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h2>Filtros</h2>

          <div className="field-group">
            <label htmlFor="search">Búsqueda general</label>
            <input
              id="search"
              type="text"
              placeholder="Nombre, historia, descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="placeFilter">Lugar donde ocurrió</label>
            <select
              id="placeFilter"
              value={placeFilter}
              onChange={(e) => setPlaceFilter(e.target.value)}
            >
              <option value="">Todos los lugares</option>
              {filterOptions.places.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="ageFilter">Rango de edad</label>
            <select
              id="ageFilter"
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
            >
              <option value="">Todas las edades</option>
              {filterOptions.ages.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="occupationFilter">Ocupación</label>
            <select
              id="occupationFilter"
              value={occupationFilter}
              onChange={(e) => setOccupationFilter(e.target.value)}
            >
              <option value="">Todas las ocupaciones</option>
              {filterOptions.occupations.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="linkFilter">Tipo de vínculo</label>
            <select
              id="linkFilter"
              value={linkFilter}
              onChange={(e) => setLinkFilter(e.target.value)}
            >
              <option value="">Todos los vínculos</option>
              {filterOptions.links.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-footer">
            {loading && <div className="status">Cargando historias…</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && (
              <div className="status">
                Historias visibles: {filteredStories.length} / {stories.length}
              </div>
            )}
          </div>
        </aside>

        <main className="content">
          {loading && <p className="status">Cargando historias…</p>}
          {!loading && !filteredStories.length && !error && (
            <p className="status">
              No se encontraron historias con esos filtros.
            </p>
          )}

          <div className="grid">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </main>
      </div>

      <footer className="site-footer">
        <p className="footer-text">
          Hecho  por{" "}
          <a
            href="https://www.tiktok.com/@frank_pena?_r=1&_t=ZS-91zyJoQZShl"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Frank Pena
          </a>
        </p>
      </footer>
    </div>
  );
}

function StoryCard({ story }) {
  const [expanded, setExpanded] = useState(false);

  const displayName =
    story.name && story.name !== "." ? story.name : "Persona anónima";

  const titleParts = [displayName];
  if (story.age) titleParts.push(story.age);
  if (story.place) titleParts.push(story.place);

  const title = titleParts.join(" · ");

  return (
    <article className="card">
      <div className="card-header">
        <div className="card-title">{title}</div>
        <span className="badge">Historia #{story.id}</span>
      </div>

      {story.description && story.description !== "." && (
        <div className="card-subtitle">{story.description}</div>
      )}

      <p className={`story-text ${expanded ? "" : "fade"}`}>
        {story.storyText || "(Sin historia escrita)"}
      </p>

      <div className="meta-row">
        {story.occupation && story.occupation !== "." && (
          <span className="meta-pill">
            <strong>Ocupación:</strong> {story.occupation}
          </span>
        )}
        {story.link && story.link !== "." && (
          <span className="meta-pill">
            <strong>Vínculo:</strong> {story.link}
          </span>
        )}
        {story.behavior && story.behavior !== "." && (
          <span className="meta-pill">
            <strong>Comportamiento:</strong> {story.behavior}
          </span>
        )}
      </div>

      <div className="card-footer">
        <button
          type="button"
          className="small-link"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Ver menos" : "Ver historia completa"}
        </button>
      </div>
    </article>
  );
}

export default App;