import { useState, useMemo } from "react";
import {
  Pencil, X, Check, RefreshCw, AlertTriangle, Search, Building2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & seed data                                                   */
/* ------------------------------------------------------------------ */

interface Divisao {
  id: number;
  descricao: string; // Ex: Equipe, Presidência, Diretoria, Departamento, Setor
}

interface Organizacao {
  id: number;
  divisaoId: number;       // hierarquia 01
  superiorId: number | null; // hierarquia 02 (id de outra Organizacao)
  descricao: string;
}

interface Responsavel {
  id: number;
  organizacaoId: number;
  pessoa: string;
  vigenciaInicial: string; // yyyy-mm-dd
  vigenciaFinal: string;   // yyyy-mm-dd or ""
}

const SEED_DIVISOES: Divisao[] = [
  { id: 1, descricao: "Equipe" },
  { id: 2, descricao: "Presidência" },
  { id: 3, descricao: "Diretoria" },
  { id: 4, descricao: "Departamento" },
  { id: 5, descricao: "Setor" },
];

const SEED_ORGANIZACOES: Organizacao[] = [
  { id: 1, divisaoId: 2, superiorId: null, descricao: "Presidência" },
  { id: 2, divisaoId: 3, superiorId: 1, descricao: "Diretoria COM/MKT" },
  { id: 3, divisaoId: 3, superiorId: 1, descricao: "Diretoria ADM/FIN" },
  { id: 4, divisaoId: 3, superiorId: 1, descricao: "Diretoria PES/PROD" },
  { id: 5, divisaoId: 3, superiorId: 1, descricao: "Diretoria INDUSTRIAL" },
  { id: 6, divisaoId: 4, superiorId: 3, descricao: "Cobrança" },
  { id: 7, divisaoId: 4, superiorId: 3, descricao: "Informática" },
];

const PESSOAS = [
  "Clovis Moacir Gruhlke",
  "Luiz Ubiratan",
  "Marcio Hartz",
  "Gabriela Trevisan",
];

const SEED_RESPONSAVEIS: Responsavel[] = [
  { id: 1, organizacaoId: 3, pessoa: "Clovis Moacir Gruhlke", vigenciaInicial: "2025-01-01", vigenciaFinal: "" },
  { id: 2, organizacaoId: 7, pessoa: "Luiz Ubiratan",        vigenciaInicial: "2025-01-01", vigenciaFinal: "" },
  // Pre-populated rows that reference orgs that don't exist in the base seed —
  // create them on the fly so the demo data renders.
];

/* ------------------------------------------------------------------ */
/* Style helpers                                                       */
/* ------------------------------------------------------------------ */

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "var(--foreground)",
  textTransform: "uppercase", letterSpacing: "0.05em",
};

const fieldBase = (err?: boolean): React.CSSProperties => ({
  fontSize: 13, color: "var(--foreground)", background: "var(--input-background)",
  border: `1px solid ${err ? "#fca5a5" : "var(--border)"}`,
  borderRadius: 6, padding: "8px 12px", outline: "none", width: "100%",
  boxShadow: err ? "0 0 0 3px rgba(239,68,68,0.1)" : undefined,
});

const focusStyle = (err?: boolean) => ({
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#f87171" : "#1a56db"}`;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${err ? "rgba(239,68,68,0.1)" : "rgba(26,86,219,0.15)"}`;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#fca5a5" : "var(--border)"}`;
    e.currentTarget.style.boxShadow = "none";
  },
});

const PRIMARY = "#1a56db";

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
      style={{ background: PRIMARY, color: "#fff", fontSize: 13, fontWeight: 500 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#1648b8")}
      onMouseLeave={(e) => (e.currentTarget.style.background = PRIMARY)}
    >
      {children}
    </button>
  );
}

function OutlineButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
      style={{ background: "var(--card)", color: "var(--foreground)", fontSize: 13, fontWeight: 500, border: "1px solid var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
    >
      {children}
    </button>
  );
}

function Asterisk() {
  return <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#be123c" }}>
      <AlertTriangle size={11} />{msg}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="rounded-xl shadow-2xl w-full" style={{ background: "var(--card)", maxWidth: 520 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded transition-colors" style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
  textTransform: "uppercase", letterSpacing: "0.06em",
  borderColor: "var(--border)", whiteSpace: "nowrap",
};

function fmtDateBR(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type TabKey = "divisao" | "organizacao" | "responsavel";

export function CadastroOrganizacao() {
  const [tab, setTab] = useState<TabKey>("divisao");

  /* ---------------- Divisões state ---------------- */
  const [divisoes, setDivisoes] = useState<Divisao[]>(SEED_DIVISOES);
  const [divForm, setDivForm] = useState<{ descricao: string }>({ descricao: "" });
  const [divError, setDivError] = useState<string | undefined>();
  const [divEditing, setDivEditing] = useState<Divisao | null>(null);
  const [divModalDescricao, setDivModalDescricao] = useState("");

  function saveDivisao() {
    if (!divForm.descricao.trim()) {
      setDivError("Descrição obrigatória.");
      return;
    }
    setDivisoes((d) => [...d, { id: Date.now(), descricao: divForm.descricao.trim() }]);
    setDivForm({ descricao: "" });
    setDivError(undefined);
  }

  function openEditDivisao(d: Divisao) {
    setDivEditing(d);
    setDivModalDescricao(d.descricao);
  }
  function confirmEditDivisao() {
    if (!divEditing) return;
    if (!divModalDescricao.trim()) return;
    setDivisoes((list) => list.map((d) => d.id === divEditing.id ? { ...d, descricao: divModalDescricao.trim() } : d));
    setDivEditing(null);
  }
  function deleteDivisao() {
    if (!divEditing) return;
    setDivisoes((list) => list.filter((d) => d.id !== divEditing.id));
    setDivEditing(null);
  }

  /* ---------------- Organizações state ---------------- */
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>(SEED_ORGANIZACOES);

  // Ensure that any pre-populated responsavel referencing a missing org gets
  // a synthetic org created so the demo seed shows the expected rows.
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(() => {
    // Add seed rows for "Setor de IA" & "Consultoria Titax"
    const setorIdSetor = SEED_DIVISOES.find((d) => d.descricao === "Setor")!.id;
    const equipeId = SEED_DIVISOES.find((d) => d.descricao === "Equipe")!.id;
    const ti = SEED_ORGANIZACOES.find((o) => o.descricao === "Informática")!.id;

    // Push synthetic orgs into the seed (mutation only at init).
    const extraOrgs: Organizacao[] = [
      { id: 100, divisaoId: setorIdSetor, superiorId: ti, descricao: "Setor de IA" },
      { id: 101, divisaoId: equipeId, superiorId: 100, descricao: "Consultoria Titax" },
    ];
    SEED_ORGANIZACOES.push(...extraOrgs);

    return [
      ...SEED_RESPONSAVEIS,
      { id: 3, organizacaoId: 100, pessoa: "Marcio Hartz", vigenciaInicial: "2026-04-01", vigenciaFinal: "" },
      { id: 4, organizacaoId: 101, pessoa: "Marcio Hartz", vigenciaInicial: "2025-01-01", vigenciaFinal: "" },
    ];
  });

  const [orgForm, setOrgForm] = useState<{ divisaoId: string; superiorId: string; descricao: string }>({
    divisaoId: "", superiorId: "", descricao: "",
  });
  const [orgErrors, setOrgErrors] = useState<{ divisaoId?: string; descricao?: string }>({});
  const [orgSearch, setOrgSearch] = useState("");
  const [orgEditing, setOrgEditing] = useState<Organizacao | null>(null);
  const [orgModal, setOrgModal] = useState<{ divisaoId: string; superiorId: string; descricao: string }>({
    divisaoId: "", superiorId: "", descricao: "",
  });

  // Filter superior options based on selected divisão hierarchy.
  // Rule: superior must be from a higher hierarchy level than current.
  // Order: Presidência(1) > Diretoria(2) > Departamento(3) > Setor(4) > Equipe(5)
  const HIERARCHY_ORDER: Record<string, number> = {
    "Presidência": 1, "Diretoria": 2, "Departamento": 3, "Setor": 4, "Equipe": 5,
  };

  function superioresFor(divisaoId: string, excludeOrgId?: number): Organizacao[] {
    const divisao = divisoes.find((d) => String(d.id) === divisaoId);
    if (!divisao) return [];
    const lvl = HIERARCHY_ORDER[divisao.descricao] ?? 99;
    return organizacoes.filter((o) => {
      if (excludeOrgId && o.id === excludeOrgId) return false;
      const d = divisoes.find((x) => x.id === o.divisaoId);
      const olvl = HIERARCHY_ORDER[d?.descricao ?? ""] ?? 99;
      return olvl < lvl;
    });
  }

  function saveOrganizacao() {
    const errs: typeof orgErrors = {};
    if (!orgForm.divisaoId) errs.divisaoId = "Divisão obrigatória.";
    if (!orgForm.descricao.trim()) errs.descricao = "Descrição obrigatória.";
    setOrgErrors(errs);
    if (Object.keys(errs).length) return;

    setOrganizacoes((list) => [...list, {
      id: Date.now(),
      divisaoId: Number(orgForm.divisaoId),
      superiorId: orgForm.superiorId ? Number(orgForm.superiorId) : null,
      descricao: orgForm.descricao.trim(),
    }]);
    setOrgForm({ divisaoId: "", superiorId: "", descricao: "" });
  }

  function clearOrgForm() {
    setOrgForm({ divisaoId: "", superiorId: "", descricao: "" });
    setOrgErrors({});
  }

  function openEditOrg(o: Organizacao) {
    setOrgEditing(o);
    setOrgModal({
      divisaoId: String(o.divisaoId),
      superiorId: o.superiorId ? String(o.superiorId) : "",
      descricao: o.descricao,
    });
  }
  function confirmEditOrg() {
    if (!orgEditing) return;
    if (!orgModal.divisaoId || !orgModal.descricao.trim()) return;
    setOrganizacoes((list) => list.map((o) => o.id === orgEditing.id ? {
      ...o,
      divisaoId: Number(orgModal.divisaoId),
      superiorId: orgModal.superiorId ? Number(orgModal.superiorId) : null,
      descricao: orgModal.descricao.trim(),
    } : o));
    setOrgEditing(null);
  }
  function deleteOrg() {
    if (!orgEditing) return;
    setOrganizacoes((list) => list.filter((o) => o.id !== orgEditing.id));
    setOrgEditing(null);
  }

  const orgFiltered = useMemo(() => {
    const q = orgSearch.toLowerCase().trim();
    if (!q) return organizacoes;
    return organizacoes.filter((o) => {
      const div = divisoes.find((d) => d.id === o.divisaoId)?.descricao ?? "";
      const sup = organizacoes.find((x) => x.id === o.superiorId)?.descricao ?? "";
      return o.descricao.toLowerCase().includes(q) || div.toLowerCase().includes(q) || sup.toLowerCase().includes(q);
    });
  }, [orgSearch, organizacoes, divisoes]);

  /* ---------------- Responsáveis state ---------------- */
  const [respForm, setRespForm] = useState<{ organizacaoId: string; pessoa: string; vi: string; vf: string }>({
    organizacaoId: "", pessoa: "", vi: "", vf: "",
  });
  const [respErrors, setRespErrors] = useState<{ organizacaoId?: string; pessoa?: string; vi?: string }>({});
  const [respSearch, setRespSearch] = useState("");
  const [respEditing, setRespEditing] = useState<Responsavel | null>(null);
  const [respModal, setRespModal] = useState<{ organizacaoId: string; pessoa: string; vi: string; vf: string }>({
    organizacaoId: "", pessoa: "", vi: "", vf: "",
  });

  function orgLabel(o: Organizacao): string {
    const div = divisoes.find((d) => d.id === o.divisaoId)?.descricao ?? "—";
    const sup = o.superiorId ? organizacoes.find((x) => x.id === o.superiorId)?.descricao ?? "—" : "—";
    return `${o.descricao} [${div} – ${sup}]`;
  }

  function saveResponsavel() {
    const errs: typeof respErrors = {};
    if (!respForm.organizacaoId) errs.organizacaoId = "Organização obrigatória.";
    if (!respForm.pessoa) errs.pessoa = "Pessoa obrigatória.";
    if (!respForm.vi) errs.vi = "Data inicial obrigatória.";
    setRespErrors(errs);
    if (Object.keys(errs).length) return;

    setResponsaveis((list) => [...list, {
      id: Date.now(),
      organizacaoId: Number(respForm.organizacaoId),
      pessoa: respForm.pessoa,
      vigenciaInicial: respForm.vi,
      vigenciaFinal: respForm.vf,
    }]);
    setRespForm({ organizacaoId: "", pessoa: "", vi: "", vf: "" });
  }
  function clearRespForm() {
    setRespForm({ organizacaoId: "", pessoa: "", vi: "", vf: "" });
    setRespErrors({});
  }
  function openEditResp(r: Responsavel) {
    setRespEditing(r);
    setRespModal({
      organizacaoId: String(r.organizacaoId),
      pessoa: r.pessoa,
      vi: r.vigenciaInicial,
      vf: r.vigenciaFinal,
    });
  }
  function applyEditResp() {
    if (!respEditing) return;
    setResponsaveis((list) => list.map((r) => r.id === respEditing.id ? {
      ...r,
      organizacaoId: Number(respModal.organizacaoId),
      pessoa: respModal.pessoa,
      vigenciaInicial: respModal.vi,
      vigenciaFinal: respModal.vf,
    } : r));
    setRespEditing(null);
  }
  function deleteResp() {
    if (!respEditing) return;
    setResponsaveis((list) => list.filter((r) => r.id !== respEditing.id));
    setRespEditing(null);
  }

  const respFiltered = useMemo(() => {
    const q = respSearch.toLowerCase().trim();
    return responsaveis.filter((r) => {
      const org = organizacoes.find((o) => o.id === r.organizacaoId);
      const div = org ? divisoes.find((d) => d.id === org.divisaoId)?.descricao ?? "" : "";
      if (!q) return true;
      return (
        r.pessoa.toLowerCase().includes(q) ||
        (org?.descricao ?? "").toLowerCase().includes(q) ||
        div.toLowerCase().includes(q)
      );
    });
  }, [respSearch, responsaveis, organizacoes, divisoes]);

  /* ---------------- Render ---------------- */

  const TabButton = ({ id, label }: { id: TabKey; label: string }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className="px-4 py-2 transition-colors"
        style={{
          fontSize: 13, fontWeight: 500,
          color: active ? PRIMARY : "var(--muted-foreground)",
          borderBottom: active ? `2px solid ${PRIMARY}` : "2px solid transparent",
          marginBottom: -1,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="size-10 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <Building2 size={18} style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>Cadastro de Organização</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
            Estruture as divisões da empresa, sua hierarquia organizacional e os responsáveis por cada área.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b flex gap-1" style={{ borderColor: "var(--border)" }}>
        <TabButton id="divisao" label="Divisão da Empresa" />
        <TabButton id="organizacao" label="Organização" />
        <TabButton id="responsavel" label="Responsável" />
      </div>

      <div className="mt-5">
        {/* ============================================================ */}
        {/* TAB 1 — DIVISÃO                                              */}
        {/* ============================================================ */}
        {tab === "divisao" && (
          <>
            <div className="rounded-xl border mb-5 p-5" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="flex flex-col gap-1 mb-4 max-w-md">
                <label style={labelStyle}>Descrição<Asterisk /></label>
                <input
                  value={divForm.descricao}
                  onChange={(e) => { setDivForm({ descricao: e.target.value }); if (divError) setDivError(undefined); }}
                  placeholder="Ex: Departamento"
                  style={fieldBase(!!divError)}
                  {...focusStyle(!!divError)}
                />
                <FieldError msg={divError} />
              </div>
              <div className="flex gap-2 pt-2">
                <PrimaryButton onClick={saveDivisao}><Check size={14} />Salvar</PrimaryButton>
                <OutlineButton onClick={() => { setDivForm({ descricao: "" }); setDivError(undefined); }}>
                  <RefreshCw size={14} />Limpar
                </OutlineButton>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      <th className="px-4 py-3 text-left border-b" style={{ ...thStyle, width: 60 }}></th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Descrição Estrutura Principal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisoes.map((d, i) => (
                      <tr key={d.id} style={{ background: i % 2 === 0 ? "var(--card)" : "rgba(0,0,0,0.015)" }}>
                        <td className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", borderBottomWidth: 0.5 }}>
                          <button onClick={() => openEditDivisao(d)} className="p-1.5 rounded transition-colors"
                            style={{ color: "var(--muted-foreground)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = PRIMARY; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)"; }}>
                            <Pencil size={14} />
                          </button>
                        </td>
                        <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>
                          {d.descricao}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {divEditing && (
              <Modal title="Editar Divisão" onClose={() => setDivEditing(null)}>
                <div className="flex flex-col gap-1 mb-5">
                  <label style={labelStyle}>Descrição<Asterisk /></label>
                  <input
                    value={divModalDescricao}
                    onChange={(e) => setDivModalDescricao(e.target.value)}
                    style={fieldBase()}
                    {...focusStyle()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <OutlineButton onClick={() => setDivEditing(null)}>Cancelar</OutlineButton>
                  <button onClick={deleteDivisao} className="px-4 py-2 rounded-md"
                    style={{ background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 500 }}>
                    Excluir
                  </button>
                  <PrimaryButton onClick={confirmEditDivisao}><Check size={14} />Confirmar</PrimaryButton>
                </div>
              </Modal>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* TAB 2 — ORGANIZAÇÃO                                          */}
        {/* ============================================================ */}
        {tab === "organizacao" && (
          <>
            <div className="rounded-xl border mb-5 p-5" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Divisão da Empresa (hierarquia 01)<Asterisk /></label>
                  <select
                    value={orgForm.divisaoId}
                    onChange={(e) => setOrgForm((f) => ({ ...f, divisaoId: e.target.value, superiorId: "" }))}
                    style={{ ...fieldBase(!!orgErrors.divisaoId), appearance: "none" }}
                    {...focusStyle(!!orgErrors.divisaoId)}
                  >
                    <option value="">Selecione...</option>
                    {divisoes.map((d) => <option key={d.id} value={d.id}>{d.descricao}</option>)}
                  </select>
                  <FieldError msg={orgErrors.divisaoId} />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Superior (hierarquia 02)</label>
                  <select
                    value={orgForm.superiorId}
                    onChange={(e) => setOrgForm((f) => ({ ...f, superiorId: e.target.value }))}
                    disabled={!orgForm.divisaoId}
                    style={{ ...fieldBase(), appearance: "none", opacity: orgForm.divisaoId ? 1 : 0.6 }}
                    {...focusStyle()}
                  >
                    <option value="">— nenhum —</option>
                    {superioresFor(orgForm.divisaoId).map((o) => (
                      <option key={o.id} value={o.id}>{o.descricao}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Descrição<Asterisk /></label>
                  <input
                    value={orgForm.descricao}
                    onChange={(e) => setOrgForm((f) => ({ ...f, descricao: e.target.value }))}
                    placeholder="Ex: Diretoria ADM/FIN"
                    style={fieldBase(!!orgErrors.descricao)}
                    {...focusStyle(!!orgErrors.descricao)}
                  />
                  <FieldError msg={orgErrors.descricao} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <PrimaryButton onClick={saveOrganizacao}><Check size={14} />Salvar</PrimaryButton>
                <OutlineButton onClick={clearOrgForm}><RefreshCw size={14} />Limpar</OutlineButton>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="relative max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="text"
                    placeholder="Buscar organização..."
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    className="w-full rounded-md py-2 pr-3 outline-none"
                    style={{ paddingLeft: 34, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)" }}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      <th className="px-4 py-3 text-left border-b" style={{ ...thStyle, width: 60 }}></th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Organização</th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Superior</th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgFiltered.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Nenhum registro.</td></tr>
                    ) : orgFiltered.map((o, i) => {
                      const div = divisoes.find((d) => d.id === o.divisaoId);
                      const sup = o.superiorId ? organizacoes.find((x) => x.id === o.superiorId) : null;
                      return (
                        <tr key={o.id} style={{ background: i % 2 === 0 ? "var(--card)" : "rgba(0,0,0,0.015)" }}>
                          <td className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", borderBottomWidth: 0.5 }}>
                            <button onClick={() => openEditOrg(o)} className="p-1.5 rounded transition-colors"
                              style={{ color: "var(--muted-foreground)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = PRIMARY; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)"; }}>
                              <Pencil size={14} />
                            </button>
                          </td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{div?.descricao ?? "—"}</td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--muted-foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{sup?.descricao ?? "—"}</td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{o.descricao}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {orgEditing && (
              <Modal title="Editar Organização" onClose={() => setOrgEditing(null)}>
                <div className="grid grid-cols-1 gap-4 mb-5">
                  <div className="flex flex-col gap-1">
                    <label style={labelStyle}>Divisão da Empresa<Asterisk /></label>
                    <select
                      value={orgModal.divisaoId}
                      onChange={(e) => setOrgModal((f) => ({ ...f, divisaoId: e.target.value, superiorId: "" }))}
                      style={{ ...fieldBase(), appearance: "none" }} {...focusStyle()}
                    >
                      <option value="">Selecione...</option>
                      {divisoes.map((d) => <option key={d.id} value={d.id}>{d.descricao}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label style={labelStyle}>Superior</label>
                    <select
                      value={orgModal.superiorId}
                      onChange={(e) => setOrgModal((f) => ({ ...f, superiorId: e.target.value }))}
                      style={{ ...fieldBase(), appearance: "none" }} {...focusStyle()}
                    >
                      <option value="">— nenhum —</option>
                      {superioresFor(orgModal.divisaoId, orgEditing.id).map((o) => (
                        <option key={o.id} value={o.id}>{o.descricao}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label style={labelStyle}>Descrição<Asterisk /></label>
                    <input value={orgModal.descricao} onChange={(e) => setOrgModal((f) => ({ ...f, descricao: e.target.value }))}
                      style={fieldBase()} {...focusStyle()} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <OutlineButton onClick={() => setOrgEditing(null)}>Cancelar</OutlineButton>
                  <button onClick={deleteOrg} className="px-4 py-2 rounded-md"
                    style={{ background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 500 }}>Deletar</button>
                  <PrimaryButton onClick={confirmEditOrg}><Check size={14} />Confirmar</PrimaryButton>
                </div>
              </Modal>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* TAB 3 — RESPONSÁVEL                                          */}
        {/* ============================================================ */}
        {tab === "responsavel" && (
          <>
            <div className="rounded-xl border mb-5 p-5" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Organização<Asterisk /></label>
                  <select
                    value={respForm.organizacaoId}
                    onChange={(e) => setRespForm((f) => ({ ...f, organizacaoId: e.target.value }))}
                    style={{ ...fieldBase(!!respErrors.organizacaoId), appearance: "none" }}
                    {...focusStyle(!!respErrors.organizacaoId)}
                  >
                    <option value="">Selecione...</option>
                    {organizacoes.map((o) => <option key={o.id} value={o.id}>{orgLabel(o)}</option>)}
                  </select>
                  <FieldError msg={respErrors.organizacaoId} />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Pessoa Responsável<Asterisk /></label>
                  <select
                    value={respForm.pessoa}
                    onChange={(e) => setRespForm((f) => ({ ...f, pessoa: e.target.value }))}
                    style={{ ...fieldBase(!!respErrors.pessoa), appearance: "none" }}
                    {...focusStyle(!!respErrors.pessoa)}
                  >
                    <option value="">Selecione...</option>
                    {PESSOAS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <FieldError msg={respErrors.pessoa} />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Data de Vigência Inicial<Asterisk /></label>
                  <input
                    type="date"
                    value={respForm.vi}
                    onChange={(e) => setRespForm((f) => ({ ...f, vi: e.target.value }))}
                    style={fieldBase(!!respErrors.vi)} {...focusStyle(!!respErrors.vi)}
                  />
                  <FieldError msg={respErrors.vi} />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Data de Vigência Final</label>
                  <input
                    type="date"
                    value={respForm.vf}
                    onChange={(e) => setRespForm((f) => ({ ...f, vf: e.target.value }))}
                    style={fieldBase()} {...focusStyle()}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <PrimaryButton onClick={saveResponsavel}><Check size={14} />Salvar</PrimaryButton>
                <OutlineButton onClick={clearRespForm}><RefreshCw size={14} />Limpar</OutlineButton>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="relative max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="text"
                    placeholder="Buscar responsável..."
                    value={respSearch}
                    onChange={(e) => setRespSearch(e.target.value)}
                    className="w-full rounded-md py-2 pr-3 outline-none"
                    style={{ paddingLeft: 34, fontSize: 13, color: "var(--foreground)", background: "var(--input-background)", border: "1px solid var(--border)" }}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      <th className="px-4 py-3 text-left border-b" style={{ ...thStyle, width: 60 }}></th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Divisão Empresa</th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Organização TI</th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Pessoa Responsável</th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Dt Vigência Inicial</th>
                      <th className="px-4 py-3 text-left border-b" style={thStyle}>Dt Vigência Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {respFiltered.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Nenhum registro.</td></tr>
                    ) : respFiltered.map((r, i) => {
                      const org = organizacoes.find((o) => o.id === r.organizacaoId);
                      const div = org ? divisoes.find((d) => d.id === org.divisaoId)?.descricao ?? "—" : "—";
                      return (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? "var(--card)" : "rgba(0,0,0,0.015)" }}>
                          <td className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", borderBottomWidth: 0.5 }}>
                            <button onClick={() => openEditResp(r)} className="p-1.5 rounded transition-colors"
                              style={{ color: "var(--muted-foreground)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = PRIMARY; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)"; }}>
                              <Pencil size={14} />
                            </button>
                          </td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{div}</td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{org?.descricao ?? "—"}</td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{r.pessoa}</td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--muted-foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{fmtDateBR(r.vigenciaInicial)}</td>
                          <td className="px-4 py-2.5 border-b" style={{ fontSize: 13, color: "var(--muted-foreground)", borderColor: "var(--border)", borderBottomWidth: 0.5 }}>{fmtDateBR(r.vigenciaFinal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {respEditing && (
              <Modal title="Editar/Cadastrar Responsável" onClose={() => setRespEditing(null)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label style={labelStyle}>Organização<Asterisk /></label>
                    <select value={respModal.organizacaoId} onChange={(e) => setRespModal((f) => ({ ...f, organizacaoId: e.target.value }))}
                      style={{ ...fieldBase(), appearance: "none" }} {...focusStyle()}>
                      <option value="">Selecione...</option>
                      {organizacoes.map((o) => <option key={o.id} value={o.id}>{orgLabel(o)}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label style={labelStyle}>Pessoa Responsável<Asterisk /></label>
                    <select value={respModal.pessoa} onChange={(e) => setRespModal((f) => ({ ...f, pessoa: e.target.value }))}
                      style={{ ...fieldBase(), appearance: "none" }} {...focusStyle()}>
                      <option value="">Selecione...</option>
                      {PESSOAS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label style={labelStyle}>Vigência Inicial<Asterisk /></label>
                    <input type="date" value={respModal.vi} onChange={(e) => setRespModal((f) => ({ ...f, vi: e.target.value }))}
                      style={fieldBase()} {...focusStyle()} />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label style={labelStyle}>Vigência Final</label>
                    <input type="date" value={respModal.vf} onChange={(e) => setRespModal((f) => ({ ...f, vf: e.target.value }))}
                      style={fieldBase()} {...focusStyle()} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 flex-wrap">
                  <OutlineButton onClick={() => setRespEditing(null)}>Cancelar</OutlineButton>
                  <button onClick={deleteResp} className="px-4 py-2 rounded-md"
                    style={{ background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 500 }}>Excluir</button>
                  <PrimaryButton onClick={applyEditResp}><Check size={14} />Aplicar Alterações</PrimaryButton>
                </div>
              </Modal>
            )}
          </>
        )}
      </div>
    </div>
  );
}
