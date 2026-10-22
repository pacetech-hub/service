import { useState, useMemo } from "react";
import {
  Search, Plus, Pencil, Trash2, X, Check,
  ChevronLeft, ChevronRight, AlertTriangle,
  DollarSign, Filter, RefreshCw,
} from "lucide-react";

type Status = "Ativo" | "Inativo";

interface TabelaPreco {
  id: number;
  nome: string;
  preco: number;
  status: Status;
  dataCadastro: string;
}

interface FormData {
  nome: string;
  preco: string;
  status: Status;
}

interface FormErrors {
  nome?: string;
  preco?: string;
}

const SEED: TabelaPreco[] = [
  { id: 1, nome: "Analise de Sistemas - Pleno",        preco: 150.00, status: "Ativo",   dataCadastro: "02/01/2026" },
  { id: 2, nome: "Análise de Negócios - Pleno",        preco: 280.00, status: "Ativo",   dataCadastro: "05/01/2026" },
  { id: 3, nome: "Analise de Sistemas - Senior",         preco: 200.00, status: "Ativo",   dataCadastro: "10/01/2026" },
  { id: 4, nome: "Desenvolvimento - Senior",        preco: 120.00, status: "Ativo",   dataCadastro: "15/01/2026" },
  { id: 5, nome: "Validações de Software",  preco: 350.00, status: "Ativo",   dataCadastro: "20/01/2026" },
  { id: 6, nome: "Design / UX",       preco:  90.00, status: "Inativo", dataCadastro: "25/01/2026" },
];

const EMPTY_FORM: FormData = { nome: "", preco: "", status: "Ativo" };
const PER_PAGE = 5;

function today() { return new Date().toLocaleDateString("pt-BR"); }

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function validateForm(f: FormData): FormErrors {
  const e: FormErrors = {};
  if (!f.nome.trim()) e.nome = "Nome obrigatório.";
  else if (f.nome.trim().length < 2) e.nome = "Mínimo 2 caracteres.";
  if (!f.preco.trim()) e.preco = "Preço obrigatório.";
  else if (isNaN(Number(f.preco.replace(",", "."))) || Number(f.preco.replace(",", ".")) < 0)
    e.preco = "Informe um valor numérico válido.";
  return e;
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

export function CadastroTabelasPreco() {
  const [tabelas, setTabelas] = useState<TabelaPreco[]>(SEED);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TabelaPreco | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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

  function handleSave() {
    setTouched({ nome: true, preco: true, status: true });
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { showToast("Corrija os erros antes de salvar.", "error"); return; }

    const precoNum = Number(form.preco.replace(",", "."));

    if (editingId !== null) {
      setTabelas((list) => list.map((t) => t.id === editingId ? { ...t, nome: form.nome, preco: precoNum, status: form.status } : t));
      showToast("Tabela de preço atualizada com sucesso.", "success");
      setEditingId(null);
    } else {
      const nova: TabelaPreco = { id: Date.now(), nome: form.nome, preco: precoNum, status: form.status, dataCadastro: today() };
      setTabelas((list) => [nova, ...list]);
      showToast("Tabela de preço cadastrada com sucesso.", "success");
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

  function handleEdit(t: TabelaPreco) {
    setEditingId(t.id);
    setForm({ nome: t.nome, preco: String(t.preco), status: t.status });
    setErrors({});
    setTouched({});
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setTabelas((list) => list.filter((t) => t.id !== deleteTarget.id));
    showToast(`"${deleteTarget.nome}" excluída com sucesso.`, "success");
    setDeleteTarget(null);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tabelas.filter((t) => {
      const matchSearch = !q || t.nome.toLowerCase().includes(q);
      const matchStatus = !filterStatus || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [tabelas, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const totalAtivas = tabelas.filter((t) => t.status === "Ativo").length;

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
              Você está prestes a excluir <strong>{deleteTarget.nome}</strong>. Deseja continuar?
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>Tabelas de Preço</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
            Gerencie as tabelas de preço utilizadas nos serviços e recursos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontSize: 12, fontWeight: 500 }}>
            <DollarSign size={13} />
            <span>{totalAtivas} ativas</span>
          </div>
          <button
            onClick={() => { if (formOpen) handleClear(); else setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
            style={{ background: formOpen ? "var(--secondary)" : "var(--primary)", color: formOpen ? "var(--foreground)" : "#fff", fontSize: 13, fontWeight: 500, border: "1px solid var(--border)" }}
          >
            {formOpen ? <X size={14} /> : <Plus size={14} />}
            {formOpen ? "Fechar" : "Nova Tabela"}
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
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{editingId ? "Editando Tabela" : "Nova Tabela de Preço"}</span>
            {editingId && <span className="ml-2 px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: "#fde68a", color: "#92400e", fontWeight: 500 }}>Modo de Edição</span>}
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Nome */}
              <div className="flex flex-col gap-1 md:col-span-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Nome<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                </label>
                <input value={form.nome} onChange={(e) => setField("nome", e.target.value)}
                  placeholder="Ex: Tabela Padrão"
                  style={fieldBase(!!errors.nome)} {...focusFn(!!errors.nome)} />
                {errors.nome && <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#be123c" }}><AlertTriangle size={11} />{errors.nome}</span>}
              </div>

              {/* Preço */}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Preço (R$)<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500 }}>R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.preco}
                    onChange={(e) => setField("preco", e.target.value.replace(/[^0-9.,]/g, ""))}
                    placeholder="0,00"
                    style={{ ...fieldBase(!!errors.preco), paddingLeft: 32, fontVariantNumeric: "tabular-nums" }}
                    {...focusFn(!!errors.preco)}
                  />
                </div>
                {errors.preco && <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#be123c" }}><AlertTriangle size={11} />{errors.preco}</span>}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Status<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                </label>
                <div className="relative">
                  <select value={form.status} onChange={(e) => setField("status", e.target.value as Status)}
                    style={{ ...fieldBase(), appearance: "none" }} {...focusFn()}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                  <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                </div>
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
            <input type="text" placeholder="Buscar por nome da tabela..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 34, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)" }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none" }} />
          </div>
          <div className="relative" style={{ minWidth: 160 }}>
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 30, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", appearance: "none" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)" }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none" }}>
              <option value="">Todos os status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
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
                {["Nome", "Preço (R$)", "Data de Cadastro", "Status", "Ações"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left border-b"
                    style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", borderColor: "var(--border)", whiteSpace: "nowrap" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Nenhuma tabela encontrada.</td></tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                          {t.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{t.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                        {formatBRL(t.preco)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 4 }}>/ hora</span>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 12, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>{t.dataCadastro}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full"
                        style={{ fontSize: 11, fontWeight: 600, background: t.status === "Ativo" ? "#dcfce7" : "#fee2e2", color: t.status === "Ativo" ? "#15803d" : "#b91c1c" }}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(t)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
                          style={{ fontSize: 12, fontWeight: 500, background: "var(--accent)", color: "var(--accent-foreground)", border: "1px solid transparent" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.borderColor = "transparent"; }}>
                          <Pencil size={12} />Editar
                        </button>
                        <button onClick={() => setDeleteTarget(t)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
                          style={{ fontSize: 12, fontWeight: 500, background: "#fee2e2", color: "#b91c1c", border: "1px solid transparent" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fecaca"; e.currentTarget.style.borderColor = "#f87171"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "transparent"; }}>
                          <Trash2 size={12} />Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{tabelas.length} tabela{tabelas.length !== 1 ? "s" : ""} cadastrada{tabelas.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
