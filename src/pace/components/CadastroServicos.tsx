import { useState, useMemo, useRef } from "react";
import {
  Search, Plus, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight,
  AlertTriangle, Briefcase, Filter, RefreshCw, Tag, Users, Clock,
  DollarSign, TrendingUp, Save, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "Ativo" | "Inativo";

interface RecursoAtuacao {
  id: number;
  atuacao: string;
  recurso: string;
  equipe: string;
}

interface DisponibilizacaoHora {
  id: number;
  atuacao: string;
  equipe: string;
  mesAno: string;
  quantHoras: number;
  valorHoraPlanejaado: number;
  valorPlanejado: number;
}

interface TabelaPrecoItem {
  id: number;
  atuacao: string;
  equipe: string;
  recurso: string;
  tabelaPreco: string;
  vigencia: string;
  preco: number;
}

interface PlanejamentoFinanceiro {
  id: number;
  mes: string;
  valorAtual: number;
  dataPlanejamento: string;
  valorPlanejado: number;
  salvo: boolean;
}

interface Servico {
  id: number;
  categoria: string;
  projeto: string;
  codigo: string;
  nome: string;
  etiquetas: string[];
  horasPlanejadas: number;
  horasDisponibilizadas: number;
  horasAdicionais: number;
  status: Status;
  recursosAtuacoes: RecursoAtuacao[];
  disponibilizacaoHoras: DisponibilizacaoHora[];
  tabelaPrecos: TabelaPrecoItem[];
  planejamentoFinanceiro: PlanejamentoFinanceiro[];
  dataCadastro: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS = ["Organização Interna", "Sustentação", "Melhoria", "Iniciativa", "Projeto"];
const PROJETOS = ["Portal do Cliente", "Migração Cloud", "App Mobile v2", "BI Dashboard", "ERP Integration"];
const ATUACOES = ["Análise", "Desenvolvimento", "Design", "Gerência de Projeto", "Organização Interna", "Sustentação", "Validação de Software"];
const RECURSOS = ["Natalia Nicoden", "Renato Lima", "Daniel Trombetta", "Tiago Rocha", "Daniel Metz", "Eduardo Dattein"];
const EQUIPES = ["Desenvolvimento", "Design", "Produto", "Comercial", "Financeiro", "Suporte", "Infraestrutura", "RH"];
const TABELAS_PRECO = ["Analise de Sistemas - Pleno", "Análise de Negócios - Pleno", "Analise de Sistemas - Senior", "Desenvolvimento - Senior", "Validações de Software", "Design / UX"];
const MESES = ["Jan/2026", "Fev/2026", "Mar/2026", "Abr/2026", "Mai/2026", "Jun/2026", "Jul/2026", "Ago/2026", "Set/2026", "Out/2026", "Nov/2026", "Dez/2026"];

const ETIQUETA_CORES = [
  { bg: "#e0f2fe", fg: "#0369a1" }, { bg: "#dcfce7", fg: "#15803d" },
  { bg: "#fef9c3", fg: "#a16207" }, { bg: "#ede9fe", fg: "#6d28d9" },
  { bg: "#fee2e2", fg: "#b91c1c" }, { bg: "#ffedd5", fg: "#c2410c" },
];
function etiquetaCor(i: number) { return ETIQUETA_CORES[i % ETIQUETA_CORES.length]; }

const SEED: Servico[] = [
  {
    id: 1, categoria: "Iniciativa", projeto: "Portal do Cliente", codigo: "SRV-001",
    nome: "Desenvolvimento Portal Web", etiquetas: ["04 Tipo: Desenvolvimento", "Frontend"],
    horasPlanejadas: 480, horasDisponibilizadas: 320, horasAdicionais: 40, status: "Ativo",
    recursosAtuacoes: [
      { id: 1, atuacao: "Desenvolvimento", recurso: "Daniel Trombetta", equipe: "Desenvolvimento" },
      { id: 2, atuacao: "Design", recurso: "Eduardo Dattein", equipe: "Design" },
    ],
    disponibilizacaoHoras: [
      { id: 1, atuacao: "Desenvolvimento", equipe: "Desenvolvimento", mesAno: "Jan/2026", quantHoras: 80, valorHoraPlanejaado: 180, valorPlanejado: 14400 },
      { id: 2, atuacao: "Design", equipe: "Design", mesAno: "Jan/2026", quantHoras: 40, valorHoraPlanejaado: 120, valorPlanejado: 4800 },
    ],
    tabelaPrecos: [
      { id: 1, atuacao: "Desenvolvimento", equipe: "Desenvolvimento", recurso: "Daniel Trombetta", tabelaPreco: "Desenvolvimento - Senior", vigencia: "01/01/2026 - 31/12/2026", preco: 180 },
    ],
    planejamentoFinanceiro: [
      { id: 1, mes: "Jan/2026", valorAtual: 19200, dataPlanejamento: "01/01/2026", valorPlanejado: 20000, salvo: true },
      { id: 2, mes: "Fev/2026", valorAtual: 18500, dataPlanejamento: "01/02/2026", valorPlanejado: 19000, salvo: true },
    ],
    dataCadastro: "02/01/2026",
  },
  {
    id: 2, categoria: "Sustentação", projeto: "", codigo: "SRV-002",
    nome: "Suporte Técnico Mensal", etiquetas: ["05 Categoria: Sustentação"],
    horasPlanejadas: 160, horasDisponibilizadas: 160, horasAdicionais: 0, status: "Ativo",
    recursosAtuacoes: [{ id: 1, atuacao: "Sustentação", recurso: "Tiago Rocha", equipe: "Suporte" }],
    disponibilizacaoHoras: [],
    tabelaPrecos: [],
    planejamentoFinanceiro: [],
    dataCadastro: "05/01/2026",
  },
];

const EMPTY_FORM = {
  categoria: "", projeto: "", codigo: "", nome: "", etiquetas: [] as string[],
  horasPlanejadas: "", horasDisponibilizadas: "", horasAdicionais: "", status: "Ativo" as Status,
};

const PER_PAGE = 5;
function today() { return new Date().toLocaleDateString("pt-BR"); }
function formatBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function maskDate(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

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
  borderRadius: 6, padding: "7px 10px", outline: "none", width: "100%",
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

function SectionHeader({ icon, title, open, onToggle }: { icon: React.ReactNode; title: string; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 border-b"
      style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--primary)" }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>
      </div>
      {open ? <ChevronUp size={14} style={{ color: "var(--muted-foreground)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />}
    </button>
  );
}

function SelectField({ value, onChange, options, placeholder, err }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; err?: boolean;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ ...fieldBase(err), appearance: "none" }} {...focusFn(err)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
    </div>
  );
}

// ─── Etiquetas Input ──────────────────────────────────────────────────────────

function EtiquetasInput({ etiquetas, onChange }: { etiquetas: string[]; onChange: (v: string[]) => void }) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  function add() {
    const v = inputVal.trim();
    if (!v || etiquetas.includes(v)) { setInputVal(""); return; }
    onChange([...etiquetas, v]);
    setInputVal("");
    inputRef.current?.focus();
  }
  function remove(i: number) { onChange(etiquetas.filter((_, idx) => idx !== i)); }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !inputVal && etiquetas.length > 0) onChange(etiquetas.slice(0, -1));
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-md p-2 min-h-[38px] cursor-text"
        style={{ background: "var(--input-background)", border: "1px solid var(--border)", transition: "border 0.15s" }}
        onClick={() => inputRef.current?.focus()}>
        {etiquetas.map((et, i) => {
          const c = etiquetaCor(i);
          return (
            <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ fontSize: 11, fontWeight: 500, background: c.bg, color: c.fg, whiteSpace: "nowrap" }}>
              <Tag size={9} />{et}
              <button onClick={() => remove(i)} style={{ lineHeight: 1, opacity: 0.7 }}><X size={9} /></button>
            </span>
          );
        })}
        <input ref={inputRef} value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={onKey}
          placeholder={etiquetas.length === 0 ? "Adicionar etiqueta... (Enter para confirmar)" : "Mais etiquetas..."}
          className="outline-none flex-1 bg-transparent" style={{ fontSize: 12, color: "var(--foreground)", minWidth: 160, border: "none" }}
          onFocus={(e) => { e.currentTarget.parentElement!.style.border = "1px solid var(--primary)"; e.currentTarget.parentElement!.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)"; }}
          onBlur={(e) => { e.currentTarget.parentElement!.style.border = "1px solid var(--border)"; e.currentTarget.parentElement!.style.boxShadow = "none"; }}
        />
      </div>
      <div className="flex justify-end mt-1">
        <button type="button" onClick={add} disabled={!inputVal.trim()}
          className="flex items-center gap-1 px-2 py-0.5 rounded"
          style={{ fontSize: 11, background: inputVal.trim() ? "var(--accent)" : "var(--muted)", color: inputVal.trim() ? "var(--accent-foreground)" : "var(--muted-foreground)", border: "1px solid var(--border)" }}>
          <Plus size={10} />Adicionar
        </button>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ servico, onClose, onSave }: { servico: Servico; onClose: () => void; onSave: (s: Servico) => void }) {
  const [s, setS] = useState<Servico>({ ...servico, recursosAtuacoes: [...servico.recursosAtuacoes], disponibilizacaoHoras: [...servico.disponibilizacaoHoras], tabelaPrecos: [...servico.tabelaPrecos], planejamentoFinanceiro: [...servico.planejamentoFinanceiro] });

  const [secOpen, setSecOpen] = useState({ recursos: true, disponibilizacao: true, tabela: true, planejamento: true });
  function toggleSec(k: keyof typeof secOpen) { setSecOpen((p) => ({ ...p, [k]: !p[k] })); }

  // Recursos e Atuações
  const emptyRA: Omit<RecursoAtuacao, "id"> = { atuacao: "", recurso: "", equipe: "" };
  const [newRA, setNewRA] = useState(emptyRA);
  function addRA() {
    if (!newRA.atuacao || !newRA.recurso || !newRA.equipe) return;
    setS((p) => ({ ...p, recursosAtuacoes: [...p.recursosAtuacoes, { id: Date.now(), ...newRA }] }));
    setNewRA(emptyRA);
  }

  // Disponibilização
  const emptyDH: Omit<DisponibilizacaoHora, "id" | "valorPlanejado"> = { atuacao: "", equipe: "", mesAno: "", quantHoras: 0, valorHoraPlanejaado: 0 };
  const [newDH, setNewDH] = useState(emptyDH);
  function addDH() {
    if (!newDH.atuacao || !newDH.equipe || !newDH.mesAno) return;
    const vp = newDH.quantHoras * newDH.valorHoraPlanejaado;
    setS((p) => ({ ...p, disponibilizacaoHoras: [...p.disponibilizacaoHoras, { id: Date.now(), ...newDH, valorPlanejado: vp }] }));
    setNewDH(emptyDH);
  }

  // Tabela de preços
  const emptyTP: Omit<TabelaPrecoItem, "id"> = { atuacao: "", equipe: "", recurso: "", tabelaPreco: "", vigencia: "", preco: 0 };
  const [newTP, setNewTP] = useState(emptyTP);
  function addTP() {
    if (!newTP.atuacao || !newTP.tabelaPreco) return;
    setS((p) => ({ ...p, tabelaPrecos: [...p.tabelaPrecos, { id: Date.now(), ...newTP }] }));
    setNewTP(emptyTP);
  }

  // Planejamento financeiro
  function savePFLine(id: number) {
    setS((p) => ({ ...p, planejamentoFinanceiro: p.planejamentoFinanceiro.map((l) => l.id === id ? { ...l, salvo: true } : l) }));
  }
  function updatePFLine(id: number, field: keyof PlanejamentoFinanceiro, val: string | number) {
    setS((p) => ({ ...p, planejamentoFinanceiro: p.planejamentoFinanceiro.map((l) => l.id === id ? { ...l, [field]: val, salvo: false } : l) }));
  }

  const inputSm: React.CSSProperties = { fontSize: 12, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", outline: "none", width: "100%" };
  const selSm: React.CSSProperties = { ...inputSm, appearance: "none" };

  const thSty: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 10px", borderBottom: "1px solid var(--border)", background: "var(--muted)", whiteSpace: "nowrap", textAlign: "left" };
  const tdSty: React.CSSProperties = { fontSize: 12, color: "var(--foreground)", padding: "7px 10px", borderBottom: "1px solid var(--border)" };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-xl shadow-2xl w-full max-w-5xl" style={{ background: "var(--card)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>{s.nome}</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{s.codigo} · {s.categoria}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onSave(s)} className="flex items-center gap-2 px-4 py-2 rounded-md"
              style={{ background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 500 }}>
              <Save size={14} />Salvar
            </button>
            <button onClick={onClose} className="p-2 rounded-md" style={{ background: "var(--secondary)", color: "var(--foreground)" }}><X size={16} /></button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* ── Recursos e Atuações ── */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <SectionHeader icon={<Users size={15} />} title="Recursos e Atuações" open={secOpen.recursos} onToggle={() => toggleSec("recursos")} />
            {secOpen.recursos && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse mb-3">
                    <thead>
                      <tr>
                        {["Atuação", "Recurso", "Equipe", ""].map((h) => <th key={h} style={thSty}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {s.recursosAtuacoes.map((r) => (
                        <tr key={r.id}>
                          <td style={tdSty}>{r.atuacao}</td>
                          <td style={tdSty}>{r.recurso}</td>
                          <td style={tdSty}>{r.equipe}</td>
                          <td style={tdSty}>
                            <button onClick={() => setS((p) => ({ ...p, recursosAtuacoes: p.recursosAtuacoes.filter((x) => x.id !== r.id) }))}
                              style={{ color: "#b91c1c" }}><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      ))}
                      {/* Add row */}
                      <tr style={{ background: "var(--accent)" }}>
                        <td style={{ padding: "6px 8px" }}>
                          <select value={newRA.atuacao} onChange={(e) => setNewRA((p) => ({ ...p, atuacao: e.target.value }))} style={selSm}>
                            <option value="">Atuação...</option>{ATUACOES.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <select value={newRA.recurso} onChange={(e) => setNewRA((p) => ({ ...p, recurso: e.target.value }))} style={selSm}>
                            <option value="">Recurso...</option>{RECURSOS.map((r) => <option key={r}>{r}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <select value={newRA.equipe} onChange={(e) => setNewRA((p) => ({ ...p, equipe: e.target.value }))} style={selSm}>
                            <option value="">Equipe...</option>{EQUIPES.map((e) => <option key={e}>{e}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <button onClick={addRA} className="flex items-center gap-1 px-2.5 py-1 rounded"
                            style={{ background: "var(--primary)", color: "#fff", fontSize: 11 }}>
                            <Plus size={11} />Add
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Disponibilização de Horas ── */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <SectionHeader icon={<Clock size={15} />} title="Disponibilização de Horas" open={secOpen.disponibilizacao} onToggle={() => toggleSec("disponibilizacao")} />
            {secOpen.disponibilizacao && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse mb-3">
                    <thead>
                      <tr>
                        {["Atuação", "Equipe", "Mês/Ano", "Qtd. Horas", "Valor/Hora Plan.", "Valor Planejado", ""].map((h) => <th key={h} style={thSty}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {s.disponibilizacaoHoras.map((d) => (
                        <tr key={d.id}>
                          <td style={tdSty}>{d.atuacao}</td>
                          <td style={tdSty}>{d.equipe}</td>
                          <td style={tdSty}>{d.mesAno}</td>
                          <td style={{ ...tdSty, fontVariantNumeric: "tabular-nums" }}>{d.quantHoras}h</td>
                          <td style={{ ...tdSty, fontVariantNumeric: "tabular-nums" }}>{formatBRL(d.valorHoraPlanejaado)}</td>
                          <td style={{ ...tdSty, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{formatBRL(d.valorPlanejado)}</td>
                          <td style={tdSty}>
                            <button onClick={() => setS((p) => ({ ...p, disponibilizacaoHoras: p.disponibilizacaoHoras.filter((x) => x.id !== d.id) }))}
                              style={{ color: "#b91c1c" }}><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: "var(--accent)" }}>
                        <td style={{ padding: "5px 6px" }}>
                          <select value={newDH.atuacao} onChange={(e) => setNewDH((p) => ({ ...p, atuacao: e.target.value }))} style={selSm}>
                            <option value="">Atuação...</option>{ATUACOES.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <select value={newDH.equipe} onChange={(e) => setNewDH((p) => ({ ...p, equipe: e.target.value }))} style={selSm}>
                            <option value="">Equipe...</option>{EQUIPES.map((e) => <option key={e}>{e}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <select value={newDH.mesAno} onChange={(e) => setNewDH((p) => ({ ...p, mesAno: e.target.value }))} style={selSm}>
                            <option value="">Mês/Ano...</option>{MESES.map((m) => <option key={m}>{m}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <input type="number" min={0} value={newDH.quantHoras || ""} onChange={(e) => setNewDH((p) => ({ ...p, quantHoras: Number(e.target.value) }))} placeholder="0" style={inputSm} />
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <input type="number" min={0} value={newDH.valorHoraPlanejaado || ""} onChange={(e) => setNewDH((p) => ({ ...p, valorHoraPlanejaado: Number(e.target.value) }))} placeholder="0,00" style={inputSm} />
                        </td>
                        <td style={{ padding: "5px 6px", fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                          {formatBRL(newDH.quantHoras * newDH.valorHoraPlanejaado)}
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <button onClick={addDH} className="flex items-center gap-1 px-2.5 py-1 rounded"
                            style={{ background: "var(--primary)", color: "#fff", fontSize: 11 }}>
                            <Plus size={11} />Add
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Tabela de Preços ── */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <SectionHeader icon={<DollarSign size={15} />} title="Tabela de Preços" open={secOpen.tabela} onToggle={() => toggleSec("tabela")} />
            {secOpen.tabela && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse mb-3">
                    <thead>
                      <tr>
                        {["Atuação", "Equipe", "Recurso", "Tabela de Preço", "Vigência", "Preço/Hora", ""].map((h) => <th key={h} style={thSty}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {s.tabelaPrecos.map((t) => (
                        <tr key={t.id}>
                          <td style={tdSty}>{t.atuacao}</td>
                          <td style={tdSty}>{t.equipe}</td>
                          <td style={tdSty}>{t.recurso}</td>
                          <td style={tdSty}>{t.tabelaPreco}</td>
                          <td style={{ ...tdSty, fontSize: 11, color: "var(--muted-foreground)" }}>{t.vigencia}</td>
                          <td style={{ ...tdSty, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatBRL(t.preco)}</td>
                          <td style={tdSty}>
                            <button onClick={() => setS((p) => ({ ...p, tabelaPrecos: p.tabelaPrecos.filter((x) => x.id !== t.id) }))}
                              style={{ color: "#b91c1c" }}><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: "var(--accent)" }}>
                        <td style={{ padding: "5px 6px" }}>
                          <select value={newTP.atuacao} onChange={(e) => setNewTP((p) => ({ ...p, atuacao: e.target.value }))} style={selSm}>
                            <option value="">Atuação...</option>{ATUACOES.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <select value={newTP.equipe} onChange={(e) => setNewTP((p) => ({ ...p, equipe: e.target.value }))} style={selSm}>
                            <option value="">Equipe...</option>{EQUIPES.map((e) => <option key={e}>{e}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <select value={newTP.recurso} onChange={(e) => setNewTP((p) => ({ ...p, recurso: e.target.value }))} style={selSm}>
                            <option value="">Recurso...</option>{RECURSOS.map((r) => <option key={r}>{r}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <select value={newTP.tabelaPreco} onChange={(e) => setNewTP((p) => ({ ...p, tabelaPreco: e.target.value }))} style={selSm}>
                            <option value="">Tabela...</option>{TABELAS_PRECO.map((t) => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <input value={newTP.vigencia} onChange={(e) => setNewTP((p) => ({ ...p, vigencia: maskDate(e.target.value) }))} placeholder="DD/MM/AAAA" maxLength={10} style={inputSm} />
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <input type="number" min={0} value={newTP.preco || ""} onChange={(e) => setNewTP((p) => ({ ...p, preco: Number(e.target.value) }))} placeholder="0,00" style={inputSm} />
                        </td>
                        <td style={{ padding: "5px 6px" }}>
                          <button onClick={addTP} className="flex items-center gap-1 px-2.5 py-1 rounded"
                            style={{ background: "var(--primary)", color: "#fff", fontSize: 11 }}>
                            <Plus size={11} />Add
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Planejamento Financeiro ── */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <SectionHeader icon={<TrendingUp size={15} />} title="Planejamento Financeiro" open={secOpen.planejamento} onToggle={() => toggleSec("planejamento")} />
            {secOpen.planejamento && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse mb-3">
                    <thead>
                      <tr>
                        {["Mês", "Valor Atual", "Data Planejamento", "Valor Planejado", ""].map((h) => <th key={h} style={thSty}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {s.planejamentoFinanceiro.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ ...tdSty, textAlign: "center", color: "var(--muted-foreground)", padding: "20px 10px" }}>
                            Nenhum registro de planejamento financeiro.
                          </td>
                        </tr>
                      ) : s.planejamentoFinanceiro.map((l) => (
                        <tr key={l.id} style={{ background: l.salvo ? "transparent" : "#fffbeb" }}>
                          <td style={{ ...tdSty, fontWeight: 600 }}>{l.mes}</td>
                          <td style={{ padding: "5px 8px" }}>
                            <input type="number" value={l.valorAtual} onChange={(e) => updatePFLine(l.id, "valorAtual", Number(e.target.value))}
                              style={{ ...inputSm, width: 120 }} />
                          </td>
                          <td style={{ padding: "5px 8px" }}>
                            <input value={l.dataPlanejamento} onChange={(e) => updatePFLine(l.id, "dataPlanejamento", maskDate(e.target.value))}
                              placeholder="DD/MM/AAAA" maxLength={10} style={{ ...inputSm, width: 110 }} />
                          </td>
                          <td style={{ padding: "5px 8px" }}>
                            <input type="number" value={l.valorPlanejado} onChange={(e) => updatePFLine(l.id, "valorPlanejado", Number(e.target.value))}
                              style={{ ...inputSm, width: 120 }} />
                          </td>
                          <td style={{ padding: "5px 8px" }}>
                            <button onClick={() => savePFLine(l.id)} className="flex items-center gap-1 px-3 py-1.5 rounded"
                              style={{ background: l.salvo ? "var(--muted)" : "#15803d", color: l.salvo ? "var(--muted-foreground)" : "#fff", fontSize: 11, fontWeight: 500 }}>
                              <Save size={10} />{l.salvo ? "Salvo" : "Gravar Orçamento"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CadastroServicos() {
  const [servicos, setServicos] = useState<Servico[]>(SEED);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailServico, setDetailServico] = useState<Servico | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Servico | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function setField<K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    if (!form.categoria) return "Selecione uma categoria.";
    if (!form.codigo.trim()) return "Código obrigatório.";
    if (!form.nome.trim()) return "Nome obrigatório.";
    return null;
  }

  function handleSave() {
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    if (editingId !== null) {
      setServicos((list) => list.map((s) => s.id === editingId ? { ...s, ...form, horasPlanejadas: Number(form.horasPlanejadas), horasDisponibilizadas: Number(form.horasDisponibilizadas), horasAdicionais: Number(form.horasAdicionais) } : s));
      showToast("Serviço atualizado com sucesso.", "success");
      setEditingId(null);
    } else {
      const novo: Servico = { id: Date.now(), ...form, horasPlanejadas: Number(form.horasPlanejadas), horasDisponibilizadas: Number(form.horasDisponibilizadas), horasAdicionais: Number(form.horasAdicionais), recursosAtuacoes: [], disponibilizacaoHoras: [], tabelaPrecos: [], planejamentoFinanceiro: [], dataCadastro: today() };
      setServicos((list) => [novo, ...list]);
      showToast("Serviço cadastrado com sucesso.", "success");
    }
    setForm(EMPTY_FORM);
    setFormOpen(false);
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(false);
  }

  function handleEdit(s: Servico) {
    setEditingId(s.id);
    setForm({ categoria: s.categoria, projeto: s.projeto, codigo: s.codigo, nome: s.nome, etiquetas: [...s.etiquetas], horasPlanejadas: String(s.horasPlanejadas), horasDisponibilizadas: String(s.horasDisponibilizadas), horasAdicionais: String(s.horasAdicionais), status: s.status });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDetailSave(updated: Servico) {
    setServicos((list) => list.map((s) => s.id === updated.id ? updated : s));
    setDetailServico(null);
    showToast("Serviço atualizado com sucesso.", "success");
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return servicos.filter((s) => {
      const m = !q || s.nome.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q) || s.categoria.toLowerCase().includes(q);
      const mc = !filterCategoria || s.categoria === filterCategoria;
      const ms = !filterStatus || s.status === filterStatus;
      return m && mc && ms;
    });
  }, [servicos, search, filterCategoria, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {detailServico && <DetailModal servico={detailServico} onClose={() => setDetailServico(null)} onSave={handleDetailSave} />}

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
              Excluir o serviço <strong>{deleteTarget.nome}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-md" style={{ fontSize: 13, fontWeight: 500, background: "var(--secondary)", color: "var(--foreground)" }}>Cancelar</button>
              <button onClick={() => { setServicos((l) => l.filter((s) => s.id !== deleteTarget!.id)); showToast("Serviço excluído.", "success"); setDeleteTarget(null); }} className="px-4 py-2 rounded-md" style={{ fontSize: 13, fontWeight: 500, background: "#dc2626", color: "#fff" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>Serviços</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>Gerencie os serviços, recursos, horas e planejamento financeiro.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontSize: 12, fontWeight: 500 }}>
            <Briefcase size={13} />
            <span>{servicos.filter((s) => s.status === "Ativo").length} ativos</span>
          </div>
          <button onClick={() => { if (formOpen) handleClear(); else setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
            style={{ background: formOpen ? "var(--secondary)" : "var(--primary)", color: formOpen ? "var(--foreground)" : "#fff", fontSize: 13, fontWeight: 500, border: "1px solid var(--border)" }}>
            {formOpen ? <X size={14} /> : <Plus size={14} />}
            {formOpen ? "Fechar" : "Novo Serviço"}
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
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{editingId ? "Editando Serviço" : "Novo Serviço"}</span>
            {editingId && <span className="ml-2 px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: "#fde68a", color: "#92400e", fontWeight: 500 }}>Modo de Edição</span>}
          </div>
          <div className="p-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Categoria<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span></label>
                <SelectField value={form.categoria} onChange={(v) => setField("categoria", v)} options={CATEGORIAS} placeholder="Selecione..." />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Projeto</label>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                  <select value={form.projeto} onChange={(e) => setField("projeto", e.target.value)} style={{ ...fieldBase(), appearance: "none", paddingLeft: 26 }} {...focusFn()}>
                    <option value="">Buscar projeto...</option>
                    {PROJETOS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Código<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span></label>
                <input value={form.codigo} onChange={(e) => setField("codigo", e.target.value)} placeholder="Ex: SRV-001" style={fieldBase()} {...focusFn()} />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
                <SelectField value={form.status} onChange={(v) => setField("status", v as Status)} options={["Ativo", "Inativo"]} />
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nome do Serviço<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span></label>
                <input value={form.nome} onChange={(e) => setField("nome", e.target.value)} placeholder="Ex: Desenvolvimento Portal Web" style={fieldBase()} {...focusFn()} />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Etiquetas <span style={{ fontWeight: 400, color: "var(--muted-foreground)", textTransform: "none", letterSpacing: 0 }}>(múltiplas)</span></label>
                <EtiquetasInput etiquetas={form.etiquetas} onChange={(v) => setField("etiquetas", v)} />
              </div>
            </div>
            {/* Row 3 — horas */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {([["horasPlanejadas", "Horas Planejadas"], ["horasDisponibilizadas", "Horas Disponibilizadas"], ["horasAdicionais", "Horas Adicionais"]] as const).map(([k, label]) => (
                <div key={k} className="flex flex-col gap-1">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                  <input type="number" min={0} value={form[k]} onChange={(e) => setField(k, e.target.value)} placeholder="0" style={{ ...fieldBase(), fontVariantNumeric: "tabular-nums" }} {...focusFn()} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors" style={{ background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1558d4")} onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}>
                <Check size={14} />{editingId ? "Atualizar" : "Salvar"}
              </button>
              <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors" style={{ background: "var(--secondary)", color: "var(--foreground)", fontSize: 13, fontWeight: 500, border: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")} onMouseLeave={(e) => (e.currentTarget.style.background = "var(--secondary)")}>
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
            <input type="text" placeholder="Buscar por nome, código ou categoria..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 34, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
          </div>
          <div className="relative" style={{ minWidth: 170 }}>
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
            <select value={filterCategoria} onChange={(e) => { setFilterCategoria(e.target.value); setPage(1); }} className="w-full rounded-md py-2 pr-3 outline-none"
              style={{ paddingLeft: 30, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", appearance: "none" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative" style={{ minWidth: 150 }}>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="w-full rounded-md py-2 px-3 outline-none"
              style={{ fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)", appearance: "none" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
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
                {["Código", "Nome", "Categoria", "Projeto", "Horas Plan.", "H. Disp.", "H. Adic.", "Etiquetas", "Status", "Ações"].map((col) => (
                  <th key={col} className="px-3 py-3 text-left border-b"
                    style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", borderColor: "var(--border)", whiteSpace: "nowrap" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Nenhum serviço encontrado.</td></tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-3 py-3" style={{ fontSize: 12, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{s.codigo}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => setDetailServico(s)} className="text-left hover:underline"
                        style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{s.nome}</button>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 500, background: "var(--accent)", color: "var(--accent-foreground)" }}>{s.categoria}</span>
                    </td>
                    <td className="px-3 py-3" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{s.projeto || "—"}</td>
                    <td className="px-3 py-3" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{s.horasPlanejadas}h</td>
                    <td className="px-3 py-3" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{s.horasDisponibilizadas}h</td>
                    <td className="px-3 py-3" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{s.horasAdicionais}h</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.etiquetas.length === 0 ? <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>—</span> :
                          s.etiquetas.slice(0, 2).map((et, i) => {
                            const c = etiquetaCor(i);
                            return <span key={i} className="px-1.5 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 500, background: c.bg, color: c.fg, whiteSpace: "nowrap" }}>{et}</span>;
                          })}
                        {s.etiquetas.length > 2 && <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>+{s.etiquetas.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: s.status === "Ativo" ? "#dcfce7" : "#fee2e2", color: s.status === "Ativo" ? "#15803d" : "#b91c1c" }}>{s.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailServico(s)} className="flex items-center gap-1 px-2 py-1.5 rounded-md"
                          style={{ fontSize: 11, fontWeight: 500, background: "var(--accent)", color: "var(--accent-foreground)", border: "1px solid transparent" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.borderColor = "transparent"; }}>
                          <Pencil size={11} />Editar
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="flex items-center gap-1 px-2 py-1.5 rounded-md"
                          style={{ fontSize: 11, fontWeight: 500, background: "#fee2e2", color: "#b91c1c", border: "1px solid transparent" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fecaca"; e.currentTarget.style.borderColor = "#f87171"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "transparent"; }}>
                          <Trash2 size={11} />Excluir
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
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Exibindo {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} de {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded-md" style={{ background: "var(--secondary)", opacity: safePage === 1 ? 0.4 : 1 }}><ChevronLeft size={14} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className="size-7 rounded-md"
                  style={{ fontSize: 12, fontWeight: n === safePage ? 600 : 400, background: n === safePage ? "var(--primary)" : "var(--secondary)", color: n === safePage ? "#fff" : "var(--foreground)" }}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded-md" style={{ background: "var(--secondary)", opacity: safePage === totalPages ? 0.4 : 1 }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>PTech Serviços — Sistema de Gestão v1.0</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{servicos.length} serviço{servicos.length !== 1 ? "s" : ""} cadastrado{servicos.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
