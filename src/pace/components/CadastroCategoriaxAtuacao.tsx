import { useState, useMemo } from "react";
import {
  Search, Plus, Pencil, Trash2, X, Check,
  ChevronLeft, ChevronRight, AlertTriangle,
  Layers, Filter, RefreshCw,
} from "lucide-react";

interface CategoriaxAtuacao {
  id: number;
  recurso: string;
  equipe: string;
  categoria: string;
  atuacoes: string[];
  dataCadastro: string;
}

interface FormData {
  recurso: string;
  equipe: string;
  categoria: string;
  atuacoes: string[];
}

interface FormErrors {
  recurso?: string;
  equipe?: string;
  categoria?: string;
  atuacoes?: string;
}

const RECURSOS = [
  "Natalia Nicoden", "Renato Lima", "Daniel Trombetta",
  "Tiago Rocha", "Daniel Metz", "Eduardo Dattein",
  "Juliana Martins", "Thiago Alves",
];

const EQUIPES = [
  "Desenvolvimento", "Design", "Produto", "Comercial",
  "Financeiro", "Suporte", "Infraestrutura", "RH",
];

const CATEGORIAS = [
  "Iniciativa",
  "Melhoria",
  "Organização Interna",
  "Sustentação",
];

const ATUACOES_OPCOES = [
  "Análise",
  "Desenvolvimento",
  "Design",
  "Gerência de Projeto",
  "Organização Interna",
  "Sustentação",
  "Validação de Software",
];

const SEED: CategoriaxAtuacao[] = [
  { id: 1, recurso: "Natalia Nicoden",  equipe: "Desenvolvimento", categoria: "Iniciativa",         atuacoes: ["Análise", "Desenvolvimento"],            dataCadastro: "02/01/2026" },
  { id: 2, recurso: "Renato Lima",      equipe: "Produto",         categoria: "Melhoria",            atuacoes: ["Análise", "Gerência de Projeto"],        dataCadastro: "05/01/2026" },
  { id: 3, recurso: "Daniel Trombetta", equipe: "Design",          categoria: "Organização Interna", atuacoes: ["Design", "Organização Interna"],         dataCadastro: "10/01/2026" },
  { id: 4, recurso: "Tiago Rocha",      equipe: "Desenvolvimento", categoria: "Sustentação",         atuacoes: ["Desenvolvimento", "Sustentação"],        dataCadastro: "15/01/2026" },
  { id: 5, recurso: "Daniel Metz",      equipe: "Suporte",         categoria: "Sustentação",         atuacoes: ["Validação de Software", "Sustentação"],  dataCadastro: "20/01/2026" },
];

const EMPTY_FORM: FormData = { recurso: "", equipe: "", categoria: "", atuacoes: [] };
const PER_PAGE = 5;

function today() { return new Date().toLocaleDateString("pt-BR"); }

function validateForm(f: FormData): FormErrors {
  const e: FormErrors = {};
  if (!f.recurso)   e.recurso   = "Selecione um recurso.";
  if (!f.equipe)    e.equipe    = "Selecione uma equipe.";
  if (!f.categoria) e.categoria = "Selecione uma categoria.";
  if (f.atuacoes.length === 0) e.atuacoes = "Marque ao menos uma atuação.";
  return e;
}

const CATEGORIA_CORES: Record<string, { bg: string; fg: string }> = {
  "Iniciativa":         { bg: "#ede9fe", fg: "#6d28d9" },
  "Melhoria":           { bg: "#e0f2fe", fg: "#0369a1" },
  "Organização Interna":{ bg: "#dcfce7", fg: "#15803d" },
  "Sustentação":        { bg: "#ffedd5", fg: "#c2410c" },
};

function categoriaCor(cat: string) {
  return CATEGORIA_CORES[cat] ?? { bg: "var(--muted)", fg: "var(--muted-foreground)" };
}

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
      style={{ background: type === "success" ? "#f0fdf4" : "#fff1f2", border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecdd3"}`, color: type === "success" ? "#15803d" : "#be123c", minWidth: 280, maxWidth: 380 }}>
      {type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
      <span style={{ fontSize: 13, flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ opacity: 0.6 }}><X size={14} /></button>
    </div>
  );
}

const fieldBase = (err?: boolean): React.CSSProperties => ({
  fontSize: 13, color: "var(--foreground)", background: "var(--input-background)",
  border: `1px solid ${err ? "#fca5a5" : "var(--border)"}`,
  borderRadius: 6, padding: "8px 12px", outline: "none", width: "100%",
  boxShadow: err ? "0 0 0 3px rgba(239,68,68,0.1)" : undefined,
});

const focusFn = (err?: boolean) => ({
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#f87171" : "var(--primary)"}`;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${err ? "rgba(239,68,68,0.1)" : "rgba(30,111,255,0.12)"}`;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#fca5a5" : "var(--border)"}`;
    e.currentTarget.style.boxShadow = "none";
  },
});

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#be123c" }}><AlertTriangle size={11} />{msg}</span>;
}

export function CadastroCategoriaxAtuacao() {
  const [registros, setRegistros] = useState<CategoriaxAtuacao[]>(SEED);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoriaxAtuacao | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [filterEquipe, setFilterEquipe] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [page, setPage] = useState(1);
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function setField<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setTouched((t) => ({ ...t, [k]: true }));
    if (touched[k]) {
      const errs = validateForm({ ...form, [k]: v });
      setErrors((e) => ({ ...e, [k]: (errs as FormErrors)[k as keyof FormErrors] }));
    }
  }

  function toggleAtuacao(at: string) {
    const next = form.atuacoes.includes(at)
      ? form.atuacoes.filter((a) => a !== at)
      : [...form.atuacoes, at];
    setField("atuacoes", next);
  }

  function handleSave() {
    setTouched({ recurso: true, equipe: true, categoria: true, atuacoes: true });
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { showToast("Corrija os erros antes de salvar.", "error"); return; }

    if (editingId !== null) {
      setRegistros((list) => list.map((r) => r.id === editingId ? { ...r, ...form } : r));
      showToast("Registro atualizado com sucesso.", "success");
      setEditingId(null);
    } else {
      const novo: CategoriaxAtuacao = { id: Date.now(), ...form, dataCadastro: today() };
      setRegistros((list) => [novo, ...list]);
      showToast("Registro cadastrado com sucesso.", "success");
    }
    setForm(EMPTY_FORM);
    setTouched({});
    setErrors({});
    setFormOpen(false);
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    setEditingId(null);
    setFormOpen(false);
  }

  function handleEdit(r: CategoriaxAtuacao) {
    setEditingId(r.id);
    setForm({ recurso: r.recurso, equipe: r.equipe, categoria: r.categoria, atuacoes: [...r.atuacoes] });
    setErrors({});
    setTouched({});
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setRegistros((list) => list.filter((r) => r.id !== deleteTarget.id));
    showToast(`Registro de "${deleteTarget.recurso}" excluído com sucesso.`, "success");
    setDeleteTarget(null);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return registros.filter((r) => {
      const matchSearch = !q || r.recurso.toLowerCase().includes(q) || r.equipe.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q);
      const matchEquipe = !filterEquipe || r.equipe === filterEquipe;
      const matchCat = !filterCategoria || r.categoria === filterCategoria;
      return matchSearch && matchEquipe && matchCat;
    });
  }, [registros, search, filterEquipe, filterCategoria]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="rounded-xl p-6 shadow-2xl" style={{ background: "var(--card)", width: 400, maxWidth: "90vw" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-10 rounded-full" style={{ background: "#fee2e2" }}>
                <AlertTriangle size={18} style={{ color: "#dc2626" }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>Confirmar Exclusão</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Esta ação não pode ser desfeita.</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--foreground)", marginBottom: 20 }}>
              Você está prestes a excluir o registro de <strong>{deleteTarget.recurso}</strong>. Deseja continuar?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-md" style={{ fontSize: 13, fontWeight: 500, background: "var(--secondary)", color: "var(--foreground)" }}>Cancelar</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-md" style={{ fontSize: 13, fontWeight: 500, background: "#dc2626", color: "#fff" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>Categoria × Atuação por Recurso</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
            Associe categorias e atuações permitidas para cada recurso e equipe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontSize: 12, fontWeight: 500 }}>
            <Layers size={13} />
            <span>{registros.length} registro{registros.length !== 1 ? "s" : ""}</span>
          </div>
          <button
            onClick={() => { if (formOpen) handleClear(); else setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
            style={{ background: formOpen ? "var(--secondary)" : "var(--primary)", color: formOpen ? "var(--foreground)" : "#fff", fontSize: 13, fontWeight: 500, border: "1px solid var(--border)" }}
          >
            {formOpen ? <X size={14} /> : <Plus size={14} />}
            {formOpen ? "Fechar" : "Novo Registro"}
          </button>
        </div>
      </div>

      {/* Form card */}
      {formOpen && (
        <div className="rounded-xl border mb-5 overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: "var(--border)", background: editingId ? "#fffbeb" : "var(--card)" }}>
            <div className="size-7 rounded flex items-center justify-center" style={{ background: editingId ? "#fde68a" : "var(--accent)" }}>
              {editingId ? <Pencil size={14} style={{ color: "#92400e" }} /> : <Plus size={14} style={{ color: "var(--primary)" }} />}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
              {editingId ? "Editando Registro" : "Novo Registro"}
            </span>
            {editingId && <span className="ml-2 px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: "#fde68a", color: "#92400e", fontWeight: 500 }}>Modo de Edição</span>}
          </div>

          <div className="p-5">
            {/* Recurso + Equipe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Recurso<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                </label>
                <div className="relative">
                  <select value={form.recurso} onChange={(e) => setField("recurso", e.target.value)}
                    style={{ ...fieldBase(!!errors.recurso), appearance: "none" }} {...focusFn(!!errors.recurso)}>
                    <option value="">Selecione um recurso...</option>
                    {RECURSOS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <FieldError msg={errors.recurso} />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Equipe<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                </label>
                <div className="relative">
                  <select value={form.equipe} onChange={(e) => setField("equipe", e.target.value)}
                    style={{ ...fieldBase(!!errors.equipe), appearance: "none" }} {...focusFn(!!errors.equipe)}>
                    <option value="">Selecione uma equipe...</option>
                    {EQUIPES.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                  <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <FieldError msg={errors.equipe} />
              </div>
            </div>

            {/* Categoria (select list visual) + Atuações (checkboxes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

              {/* Categoria — select list */}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Categoria<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted-foreground)", marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>(selecione uma)</span>
                </label>
                <div className="flex flex-col gap-1.5 rounded-md p-2"
                  style={{ background: "var(--input-background)", border: `1px solid ${errors.categoria ? "#fca5a5" : "var(--border)"}`, boxShadow: errors.categoria ? "0 0 0 3px rgba(239,68,68,0.1)" : undefined }}>
                  {CATEGORIAS.map((cat) => {
                    const selected = form.categoria === cat;
                    const cor = categoriaCor(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setField("categoria", selected ? "" : cat)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors"
                        style={{
                          fontSize: 13,
                          fontWeight: selected ? 600 : 400,
                          background: selected ? cor.bg : "transparent",
                          color: selected ? cor.fg : "var(--foreground)",
                          border: `1px solid ${selected ? cor.bg : "transparent"}`,
                        }}
                        onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--accent)"; }}
                        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span
                          className="size-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ border: `2px solid ${selected ? cor.fg : "var(--muted-foreground)"}`, background: selected ? cor.fg : "transparent" }}
                        >
                          {selected && <span className="size-1.5 rounded-full" style={{ background: "#fff" }} />}
                        </span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <FieldError msg={errors.categoria} />
              </div>

              {/* Atuações — checkboxes */}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Atuações<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted-foreground)", marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>(uma ou mais)</span>
                </label>
                <div className="flex flex-col gap-1.5 rounded-md p-2"
                  style={{ background: "var(--input-background)", border: `1px solid ${errors.atuacoes ? "#fca5a5" : "var(--border)"}`, boxShadow: errors.atuacoes ? "0 0 0 3px rgba(239,68,68,0.1)" : undefined }}>
                  {ATUACOES_OPCOES.map((at) => {
                    const checked = form.atuacoes.includes(at);
                    return (
                      <button
                        key={at}
                        type="button"
                        onClick={() => toggleAtuacao(at)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors"
                        style={{
                          fontSize: 13,
                          fontWeight: checked ? 600 : 400,
                          background: checked ? "var(--accent)" : "transparent",
                          color: checked ? "var(--accent-foreground)" : "var(--foreground)",
                          border: `1px solid ${checked ? "var(--primary)" : "transparent"}`,
                        }}
                        onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = "var(--accent)"; }}
                        onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span
                          className="size-4 rounded flex items-center justify-center shrink-0"
                          style={{ border: `2px solid ${checked ? "var(--primary)" : "var(--muted-foreground)"}`, background: checked ? "var(--primary)" : "transparent" }}
                        >
                          {checked && <Check size={10} style={{ color: "#fff" }} />}
                        </span>
                        {at}
                      </button>
                    );
                  })}
                </div>
                <FieldError msg={errors.atuacoes} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
                style={{ background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1558d4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}>
                <Check size={14} />{editingId ? "Atualizar" : "Salvar"}
              </button>
              <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
                style={{ background: "var(--secondary)", color: "var(--foreground)", fontSize: 13, fontWeight: 500, border: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--secondary)")}>
                <RefreshCw size={14} />Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border mb-4 p-4" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
            <input type="text" placeholder="Buscar por recurso, equipe ou categoria..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 34, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)" }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none" }} />
          </div>
          <div className="relative" style={{ minWidth: 170 }}>
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
            <select value={filterEquipe} onChange={(e) => { setFilterEquipe(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 30, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", appearance: "none" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)" }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none" }}>
              <option value="">Todas as equipes</option>
              {EQUIPES.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
            </select>
          </div>
          <div className="relative" style={{ minWidth: 180 }}>
            <select value={filterCategoria} onChange={(e) => { setFilterCategoria(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 px-3 outline-none"
              style={{ fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", appearance: "none" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)" }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none" }}>
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center px-3 py-2 rounded-md" style={{ background: "var(--muted)", fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Recurso", "Equipe", "Categoria", "Atuações", "Cadastrado em", "Ações"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left border-b"
                    style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", borderColor: "var(--border)", whiteSpace: "nowrap" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Nenhum registro encontrado.</td></tr>
              ) : (
                paginated.map((r) => {
                  const cor = categoriaCor(r.categoria);
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                            {r.recurso.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{r.recurso}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 500, background: "var(--accent)", color: "var(--accent-foreground)" }}>
                          {r.equipe}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: cor.bg, color: cor.fg }}>
                          {r.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.atuacoes.map((at, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full"
                              style={{ fontSize: 11, fontWeight: 500, background: "var(--muted)", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                              {at}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: 12, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>{r.dataCadastro}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
                            style={{ fontSize: 12, fontWeight: 500, background: "var(--accent)", color: "var(--accent-foreground)", border: "1px solid transparent" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.borderColor = "transparent"; }}>
                            <Pencil size={12} />Editar
                          </button>
                          <button onClick={() => setDeleteTarget(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
                            style={{ fontSize: 12, fontWeight: 500, background: "#fee2e2", color: "#b91c1c", border: "1px solid transparent" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#fecaca"; e.currentTarget.style.borderColor = "#f87171"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "transparent"; }}>
                            <Trash2 size={12} />Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Exibindo {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} de {filtered.length} registros
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                className="p-1.5 rounded-md" style={{ background: "var(--secondary)", opacity: safePage === 1 ? 0.4 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className="size-7 rounded-md"
                  style={{ fontSize: 12, fontWeight: n === safePage ? 600 : 400, background: n === safePage ? "var(--primary)" : "var(--secondary)", color: n === safePage ? "#fff" : "var(--foreground)" }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="p-1.5 rounded-md" style={{ background: "var(--secondary)", opacity: safePage === totalPages ? 0.4 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>PTech Serviços — Sistema de Gestão v1.0</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{registros.length} registro{registros.length !== 1 ? "s" : ""} cadastrado{registros.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
