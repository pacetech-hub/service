import { useState, useMemo } from "react";
import {
  Search, Plus, Pencil, Trash2, X, Check,
  ChevronLeft, ChevronRight, AlertTriangle,
  Users, Filter, RefreshCw, Link as LinkIcon,
} from "lucide-react";

type Status = "Ativo" | "Inativo";
type Divisao = "Equipe" | "Presidência" | "Diretoria" | "Departamento" | "Setor";
type PerfilAcesso = "Administrador" | "Gestor" | "Recurso" | "Visualizador";

interface Pessoa {
  id: number;
  nome: string;
  email: string;
  divisao: Divisao | "";
  organizacao: string;
  responsavel: string;
  usuario: string;
  perfilAcesso: PerfilAcesso | "";
  webhookUrl: string;
  dataCadastro: string;
  status: Status;
}

interface FormData {
  nome: string;
  email: string;
  divisao: Divisao | "";
  organizacao: string;
  responsavel: string;
  usuario: string;
  perfilAcesso: PerfilAcesso | "";
  webhookUrl: string;
  status: Status;
}

interface FormErrors {
  nome?: string;
  email?: string;
  divisao?: string;
  organizacao?: string;
  usuario?: string;
  perfilAcesso?: string;
  webhookUrl?: string;
}

const DIVISOES: Divisao[] = ["Equipe", "Presidência", "Diretoria", "Departamento", "Setor"];
const PERFIS: PerfilAcesso[] = ["Administrador", "Gestor", "Recurso", "Visualizador"];

// Organizations grouped by Divisão, each with default responsible
const ORG_BY_DIVISAO: Record<Divisao, { nome: string; responsavel: string }[]> = {
  Equipe: [
    { nome: "Soluções Integradas", responsavel: "Ana Costa" },
    { nome: "Squad Mobile", responsavel: "Carlos Lima" },
  ],
  Presidência: [
    { nome: "Presidência Executiva", responsavel: "Roberto Mendes" },
  ],
  Diretoria: [
    { nome: "Diretoria ADM/FIN", responsavel: "Fernanda Reis" },
    { nome: "Diretoria COM/MKT", responsavel: "Paulo Henrique" },
  ],
  Departamento: [
    { nome: "Informática", responsavel: "Thiago Alves" },
    { nome: "Recursos Humanos", responsavel: "Juliana Martins" },
  ],
  Setor: [
    { nome: "Setor de IA", responsavel: "Mariana Souza" },
    { nome: "Setor Financeiro", responsavel: "Thiago Alves" },
  ],
};

function findResponsavel(divisao: Divisao | "", organizacao: string): string {
  if (!divisao || !organizacao) return "";
  const list = ORG_BY_DIVISAO[divisao] || [];
  return list.find((o) => o.nome === organizacao)?.responsavel ?? "";
}

const SEED: Pessoa[] = [
  { id: 1, nome: "Ana Costa",       email: "ana.costa@ptech.com.br",      divisao: "Equipe",       organizacao: "Soluções Integradas", responsavel: "Ana Costa",       usuario: "ana.costa",     perfilAcesso: "Gestor",        webhookUrl: "https://outlook.office.com/webhook/abc123", dataCadastro: "02/01/2026", status: "Ativo"   },
  { id: 2, nome: "Carlos Lima",     email: "carlos.lima@ptech.com.br",    divisao: "Equipe",       organizacao: "Squad Mobile",        responsavel: "Carlos Lima",     usuario: "carlos.lima",   perfilAcesso: "Recurso",       webhookUrl: "https://outlook.office.com/webhook/def456", dataCadastro: "15/01/2026", status: "Ativo"   },
  { id: 3, nome: "Fernanda Reis",   email: "fernanda.reis@ptech.com.br",  divisao: "Diretoria",    organizacao: "Diretoria ADM/FIN",   responsavel: "Fernanda Reis",   usuario: "fernanda.reis", perfilAcesso: "Administrador", webhookUrl: "https://outlook.office.com/webhook/ghi789", dataCadastro: "20/01/2026", status: "Ativo"   },
  { id: 4, nome: "Roberto Dias",    email: "roberto.dias@ptech.com.br",   divisao: "Diretoria",    organizacao: "Diretoria COM/MKT",   responsavel: "Paulo Henrique",  usuario: "roberto.dias",  perfilAcesso: "Gestor",        webhookUrl: "https://outlook.office.com/webhook/jkl012", dataCadastro: "03/02/2026", status: "Inativo" },
  { id: 5, nome: "Mariana Souza",   email: "mariana.souza@ptech.com.br",  divisao: "Setor",        organizacao: "Setor de IA",         responsavel: "Mariana Souza",   usuario: "mariana.souza", perfilAcesso: "Gestor",        webhookUrl: "https://outlook.office.com/webhook/mno345", dataCadastro: "10/02/2026", status: "Ativo"   },
  { id: 6, nome: "Paulo Henrique",  email: "paulo.h@ptech.com.br",        divisao: "Departamento", organizacao: "Informática",         responsavel: "Thiago Alves",    usuario: "paulo.h",       perfilAcesso: "Recurso",       webhookUrl: "https://outlook.office.com/webhook/pqr678", dataCadastro: "18/02/2026", status: "Ativo"   },
  { id: 7, nome: "Juliana Martins", email: "juliana.m@ptech.com.br",      divisao: "Departamento", organizacao: "Recursos Humanos",    responsavel: "Juliana Martins", usuario: "juliana.m",     perfilAcesso: "Visualizador",  webhookUrl: "https://outlook.office.com/webhook/stu901", dataCadastro: "25/02/2026", status: "Inativo" },
  { id: 8, nome: "Thiago Alves",    email: "thiago.a@ptech.com.br",       divisao: "Setor",        organizacao: "Setor Financeiro",    responsavel: "Thiago Alves",    usuario: "thiago.a",      perfilAcesso: "Administrador", webhookUrl: "https://outlook.office.com/webhook/vwx234", dataCadastro: "05/03/2026", status: "Ativo"   },
];

const EMPTY_FORM: FormData = {
  nome: "", email: "", divisao: "", organizacao: "", responsavel: "",
  usuario: "", perfilAcesso: "", webhookUrl: "", status: "Ativo",
};
const PER_PAGE = 5;

function today() { return new Date().toLocaleDateString("pt-BR"); }

function validateForm(f: FormData): FormErrors {
  const e: FormErrors = {};
  if (!f.nome.trim()) e.nome = "Nome obrigatório.";
  else if (f.nome.trim().length < 3) e.nome = "Mínimo 3 caracteres.";
  if (!f.email.trim()) e.email = "E-mail obrigatório.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "E-mail inválido.";
  if (!f.divisao) e.divisao = "Selecione uma divisão.";
  if (!f.organizacao) e.organizacao = "Selecione uma organização.";
  if (!f.usuario.trim()) e.usuario = "Usuário obrigatório.";
  if (!f.perfilAcesso) e.perfilAcesso = "Selecione um perfil.";
  if (!f.webhookUrl.trim()) e.webhookUrl = "URL do Webhook obrigatória.";
  else if (!/^https?:\/\/.+/.test(f.webhookUrl)) e.webhookUrl = "URL inválida (deve iniciar com http/https).";
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

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}{required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
    </label>
  );
}

function FieldHelp({ msg }: { msg: string }) {
  return <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{msg}</span>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#be123c" }}><AlertTriangle size={11} />{msg}</span>;
}

const focusStyle = (err?: boolean) => ({
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#f87171" : "var(--primary)"}`;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${err ? "rgba(239,68,68,0.1)" : "rgba(30,111,255,0.12)"}`;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#fca5a5" : "var(--border)"}`;
    e.currentTarget.style.boxShadow = "none";
  },
});

const fieldBase = (err?: boolean): React.CSSProperties => ({
  fontSize: 13, color: "var(--foreground)", background: "var(--input-background)",
  border: `1px solid ${err ? "#fca5a5" : "var(--border)"}`,
  borderRadius: 6, padding: "8px 12px", outline: "none", width: "100%",
  boxShadow: err ? "0 0 0 3px rgba(239,68,68,0.1)" : undefined,
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
      {children}
    </div>
  );
}

export function CadastroPessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>(SEED);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pessoa | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [filterDivisao, setFilterDivisao] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function setField<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "divisao") {
        next.organizacao = "";
        next.responsavel = "";
      }
      if (k === "organizacao") {
        next.responsavel = findResponsavel(next.divisao, v as string);
      }
      return next;
    });
    setTouched((t) => ({ ...t, [k]: true }));
    if (touched[k]) {
      const errs = validateForm({ ...form, [k]: v });
      setErrors((e) => ({ ...e, [k]: (errs as FormErrors)[k as keyof FormErrors] }));
    }
  }

  function handleSave() {
    setTouched({ nome: true, email: true, divisao: true, organizacao: true, usuario: true, perfilAcesso: true, webhookUrl: true, status: true });
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { showToast("Corrija os erros antes de salvar.", "error"); return; }

    if (editingId !== null) {
      setPessoas((list) => list.map((p) => p.id === editingId ? { ...p, ...form } : p));
      showToast("Pessoa atualizada com sucesso.", "success");
      setEditingId(null);
    } else {
      const nova: Pessoa = { id: Date.now(), ...form, dataCadastro: today() };
      setPessoas((list) => [nova, ...list]);
      showToast("Pessoa cadastrada com sucesso.", "success");
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

  function handleEdit(p: Pessoa) {
    setEditingId(p.id);
    setForm({
      nome: p.nome, email: p.email, divisao: p.divisao, organizacao: p.organizacao,
      responsavel: p.responsavel, usuario: p.usuario, perfilAcesso: p.perfilAcesso,
      webhookUrl: p.webhookUrl, status: p.status,
    });
    setErrors({});
    setTouched({});
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setPessoas((list) => list.filter((p) => p.id !== deleteTarget.id));
    showToast(`"${deleteTarget.nome}" excluído com sucesso.`, "success");
    setDeleteTarget(null);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pessoas.filter((p) => {
      const matchSearch = !q || p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.organizacao.toLowerCase().includes(q);
      const matchDiv = !filterDivisao || p.divisao === filterDivisao;
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchDiv && matchStatus;
    });
  }, [pessoas, search, filterDivisao, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const orgOptions = form.divisao ? ORG_BY_DIVISAO[form.divisao] : [];

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
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>Cadastro de Pessoas</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
            Gerencie usuários, organização, perfil de acesso e integração via Microsoft Teams Webhook.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontSize: 12, fontWeight: 500 }}>
            <Users size={13} />
            <span>{pessoas.filter((p) => p.status === "Ativo").length} ativos</span>
          </div>
          <button
            onClick={() => { if (formOpen) handleClear(); else setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
            style={{ background: formOpen ? "var(--secondary)" : "var(--primary)", color: formOpen ? "var(--foreground)" : "#fff", fontSize: 13, fontWeight: 500, border: "1px solid var(--border)" }}
          >
            {formOpen ? <X size={14} /> : <Plus size={14} />}
            {formOpen ? "Fechar" : "Nova Pessoa"}
          </button>
        </div>
      </div>

      {/* Form card */}
      {formOpen && (
        <div className="rounded-xl border mb-5 overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* Yellow editing banner */}
          {editingId && (
            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
              <Pencil size={14} style={{ color: "#92400e" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>Editando Pessoa</span>
              <span className="ml-2 px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: "#fde68a", color: "#92400e", fontWeight: 500 }}>Modo de Edição</span>
            </div>
          )}
          {!editingId && (
            <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="size-7 rounded flex items-center justify-center" style={{ background: "var(--accent)" }}>
                <Plus size={14} style={{ color: "var(--primary)" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Nova Pessoa</span>
            </div>
          )}

          <div className="p-5">
            {/* Section 1 — Dados pessoais */}
            <SectionTitle>Dados pessoais</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <FieldLabel label="Nome Completo" required />
                <input value={form.nome} onChange={(e) => setField("nome", e.target.value)} placeholder="Ex: João da Silva"
                  style={fieldBase(!!errors.nome)} {...focusStyle(!!errors.nome)} />
                <FieldError msg={errors.nome} />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel label="E-mail" required />
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="Ex: joao@empresa.com"
                  style={fieldBase(!!errors.email)} {...focusStyle(!!errors.email)} />
                <FieldError msg={errors.email} />
              </div>
            </div>

            {/* Section 2 — Organização */}
            <SectionTitle>Organização</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <FieldLabel label="Divisão" required />
                <div className="relative">
                  <select value={form.divisao} onChange={(e) => setField("divisao", e.target.value as Divisao)}
                    style={{ ...fieldBase(!!errors.divisao), appearance: "none" }} {...focusStyle(!!errors.divisao)}>
                    <option value="">Selecione...</option>
                    {DIVISOES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <FieldError msg={errors.divisao} />
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Organização da qual faz parte" required />
                <div className="relative">
                  <select value={form.organizacao} onChange={(e) => setField("organizacao", e.target.value)}
                    disabled={!form.divisao}
                    style={{ ...fieldBase(!!errors.organizacao), appearance: "none", opacity: form.divisao ? 1 : 0.6, cursor: form.divisao ? "pointer" : "not-allowed" }}
                    {...focusStyle(!!errors.organizacao)}>
                    <option value="">{form.divisao ? "Selecione..." : "Selecione uma divisão primeiro"}</option>
                    {orgOptions.map((o) => <option key={o.nome} value={o.nome}>{o.nome}</option>)}
                  </select>
                  <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <FieldHelp msg="Vinculado ao cadastro de organização" />
                <FieldError msg={errors.organizacao} />
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Responsável pela organização" />
                <input value={form.responsavel} readOnly disabled placeholder="—"
                  style={{ ...fieldBase(), background: "var(--muted)", cursor: "not-allowed", color: "var(--muted-foreground)" }} />
                <FieldHelp msg="Preenchido automaticamente" />
              </div>
            </div>

            {/* Section 3 — Acesso ao sistema */}
            <SectionTitle>Acesso ao sistema</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <FieldLabel label="Usuário" required />
                <input value={form.usuario} onChange={(e) => setField("usuario", e.target.value)} placeholder="Ex: joao.silva"
                  style={fieldBase(!!errors.usuario)} {...focusStyle(!!errors.usuario)} />
                <FieldHelp msg="Login de acesso ao sistema" />
                <FieldError msg={errors.usuario} />
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Perfil de acesso" required />
                <div className="relative">
                  <select value={form.perfilAcesso} onChange={(e) => setField("perfilAcesso", e.target.value as PerfilAcesso)}
                    style={{ ...fieldBase(!!errors.perfilAcesso), appearance: "none" }} {...focusStyle(!!errors.perfilAcesso)}>
                    <option value="">Selecione...</option>
                    {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <FieldHelp msg="Define quais telas o usuário acessa" />
                <FieldError msg={errors.perfilAcesso} />
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Status" required />
                <div className="relative">
                  <select value={form.status} onChange={(e) => setField("status", e.target.value as Status)}
                    style={{ ...fieldBase(), appearance: "none" }} {...focusStyle()}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                  <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                </div>
              </div>
            </div>

            {/* Section 4 — Integração */}
            <SectionTitle>Integração</SectionTitle>
            <div className="flex flex-col gap-1 mb-5">
              <FieldLabel label="URL do Webhook do Teams" required />
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                <input type="url" value={form.webhookUrl} onChange={(e) => setField("webhookUrl", e.target.value)}
                  placeholder="https://outlook.office.com/webhook/..."
                  style={{ ...fieldBase(!!errors.webhookUrl), paddingLeft: 36 }} {...focusStyle(!!errors.webhookUrl)} />
              </div>
              <FieldError msg={errors.webhookUrl} />
            </div>

            {/* Buttons */}
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
            <input type="text" placeholder="Buscar por nome, e-mail ou organização..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 34, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)" }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none" }} />
          </div>
          <div className="relative" style={{ minWidth: 170 }}>
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
            <select value={filterDivisao} onChange={(e) => { setFilterDivisao(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 30, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", appearance: "none" }}>
              <option value="">Todas as divisões</option>
              {DIVISOES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="relative" style={{ minWidth: 140 }}>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-md py-2 px-3 outline-none"
              style={{ fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", appearance: "none" }}>
              <option value="">Todos os status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: "var(--muted)", fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
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
                {["Nome", "E-mail", "Organização", "Perfil", "Status", "Ações"].map((col) => (
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
                paginated.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                          {p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{p.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{p.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{p.organizacao}</span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{p.divisao}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 500, background: "var(--accent)", color: "var(--accent-foreground)" }}>{p.perfilAcesso}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full"
                        style={{ fontSize: 11, fontWeight: 600, background: p.status === "Ativo" ? "#dcfce7" : "#fee2e2", color: p.status === "Ativo" ? "#15803d" : "#b91c1c" }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(p)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
                          style={{ fontSize: 12, fontWeight: 500, background: "var(--accent)", color: "var(--accent-foreground)", border: "1px solid transparent" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.borderColor = "transparent"; }}>
                          <Pencil size={12} />Editar
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
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
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{pessoas.length} pessoa{pessoas.length !== 1 ? "s" : ""} cadastrada{pessoas.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
