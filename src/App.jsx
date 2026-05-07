import { useEffect, useMemo, useState } from "react";
import "./App.css";
import BlockEditor from "./components/BlockEditor";
import PageSidebar from "./components/PageSidebar";
import PreviewPane from "./components/PreviewPane";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const defaultSeed = [
  {
    id: crypto.randomUUID(),
    title: "Introduction to Calculus",
    blocks: [
      { id: crypto.randomUUID(), type: "equation", content: "f(x)=x^2" },
    ],
  },
];

export default function App() {
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [viewRole, setViewRole] = useState("teacher");

  const isTeacher = viewRole === "teacher";
  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId),
    [pages, activePageId],
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/pages`);
        if (!res.ok) throw new Error("load failed");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        const seeded = list.length ? list : defaultSeed;
        setPages(seeded);
        setActivePageId(seeded[0].id);
      } catch {
        setPages(defaultSeed);
        setActivePageId(defaultSeed[0].id);
        setMessage("API unreachable, local seed loaded.");
      }
    })();
  }, []);

  const persist = async (nextPages) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/pages/bulk-upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: nextPages }),
      });
      if (!res.ok) throw new Error();
      setMessage("Saved to database.");
    } catch {
      setMessage("Save failed. Configure Laravel routes/CORS.");
    } finally {
      setSaving(false);
    }
  };

  const updatePages = (fn, autosave = false) => {
    setPages((prev) => {
      const next = fn(prev);
      if (autosave && isTeacher) persist(next);
      return next;
    });
  };

  const addPage = () => {
    if (!isTeacher) return;
    const p = {
      id: crypto.randomUUID(),
      title: "New Chapter",
      blocks: [{ id: crypto.randomUUID(), type: "text", content: "" }],
    };
    updatePages((prev) => [...prev, p], true);
    setActivePageId(p.id);
  };

  const updateActivePage = (nextPage) => {
    if (!isTeacher) return;
    updatePages(
      (prev) => prev.map((p) => (p.id === nextPage.id ? nextPage : p)),
      true,
    );
  };

  if (!activePage) return <div className="editor">Loading...</div>;
  return (
    <div className="app-shell">
      <PageSidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onAddPage={addPage}
      />
      <main className="editor">
        <header>
          <div className="tools">
            {isTeacher &&
              ["text", "equation", "html", "video", "slide"].map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    updateActivePage({
                      ...activePage,
                      blocks: [
                        ...activePage.blocks,
                        { id: crypto.randomUUID(), type: t, content: "" },
                      ],
                    })
                  }
                >
                  {t}
                </button>
              ))}
          </div>
          <div className="role-controls">
            <select
              value={viewRole}
              onChange={(e) => setViewRole(e.target.value)}
            >
              <option value="teacher">Teacher View</option>
              <option value="student">Student View</option>
            </select>
            <button onClick={() => setPreviewMode((v) => !v)}>
              {previewMode ? "Back to edit" : "Preview mode"}
            </button>
          </div>
        </header>
        <input
          value={activePage.title}
          onChange={(e) =>
            updateActivePage({ ...activePage, title: e.target.value })
          }
          className="title"
          placeholder="Untitled Chapter"
          disabled={!isTeacher}
        />
        <section className="status-row">
          {isTeacher && (
            <button disabled={saving} onClick={() => persist(pages)}>
              {saving ? "Saving..." : "Save to DB"}
            </button>
          )}
          {!isTeacher && <span>Student mode is read-only.</span>}
          {message && <span>{message}</span>}
        </section>
        {previewMode || !isTeacher ? (
          <PreviewPane blocks={activePage.blocks} />
        ) : (
          <section className="blocks">
            {activePage.blocks.map((block) => (
              <BlockEditor
                key={block.id}
                block={block}
                onDelete={(id) =>
                  updateActivePage({
                    ...activePage,
                    blocks: activePage.blocks.filter((b) => b.id !== id),
                  })
                }
                onUpdate={(id, content) =>
                  updateActivePage({
                    ...activePage,
                    blocks: activePage.blocks.map((b) =>
                      b.id === id ? { ...b, content } : b,
                    ),
                  })
                }
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
