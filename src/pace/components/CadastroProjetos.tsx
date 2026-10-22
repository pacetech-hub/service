import { useState } from "react";
import {
  FolderOpen,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Users,
  Target,
  AlertTriangle,
  Calendar,
  FileText,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & seed                                                        */
/* ------------------------------------------------------------------ */

type Prioridade = "Pequena" | "Média" | "Alta" | "Muito Alta" | "Especial";
type Status = "Planejamento" | "Em andamento" | "Em revisão" | "Concluído" | "Cancelado" | "Suspenso";
type Saude = "Não Informada" | "Critica" | "Atenção" | "Em dia";
type Nivel = "Baixa" | "Média" | "Alta" | "Baixo" | "Médio" | "Alto";

interface Risco {
  id: number;
  cod: string;
  descricao: string;
  probabilidade: "Baixa" | "Média" | "Alta";
  impacto: "Baixo" | "Médio" | "Alto";
  consequencia: string;
}

interface Entrega {
  id: number;
  etapa: string;
  tarefa: string;
  estimativa: string;
}

const PROJETOS_MACRO = ["Reforma Tributaria", "WMS"];

const PESSOAS = [
  "Clovis Moacir Gruhlke",
  "Luiz Ubiratan",
  "Marcio Hartz",
  "Gabriela Trevisan",
  "Ana Paula Souza",
  "Renato Lima",
];

const EQUIPES = [
  "Privacidade e Segurança e ESG",
  "Pesquisa e Produto CIPA",
  "Solucoes Integradas",
  "Industrial Filiais Produtivas CIPA",
];

const ATUACOES = ["Desenvolvedor", "Analista", "QA", "Designer", "Product Owner", "Scrum Master"];

const AREAS = ["TI", "Comercial", "Financeiro", "Operações", "Produção", "RH"];


/* ------------------------------------------------------------------ */
/* Style helpers (consistent with sibling cadastros)                   */
/* ------------------------------------------------------------------ */

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const fieldBase = (err?: boolean): React.CSSProperties => ({
  fontSize: 13,
  color: "var(--foreground)",
  background: "var(--input-background)",
  border: `1px solid ${err ? "#fca5a5" : "var(--border)"}`,
  borderRadius: 6,
  padding: "8px 12px",
  outline: "none",
  width: "100%",
  boxShadow: err ? "0 0 0 3px rgba(239,68,68,0.1)" : undefined,
});

const focusHandlers = (err?: boolean) => ({
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#f87171" : "#1a56db"}`;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${err ? "rgba(239,68,68,0.12)" : "rgba(26,86,219,0.15)"}`;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = `1px solid ${err ? "#fca5a5" : "var(--border)"}`;
    e.currentTarget.style.boxShadow = err ? "0 0 0 3px rgba(239,68,68,0.1)" : "none";
  },
});

const Req = () => <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>;

const btnPrimary: React.CSSProperties = {
  background: "#1a56db",
  color: "#fff",
  border: "1px solid #1a56db",
  borderRadius: 6,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};
const btnOutline: React.CSSProperties = {
  background: "transparent",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
  background: "transparent",
  color: "#dc2626",
  border: "1px solid #fecaca",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
};

const sectionCard: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--foreground)",
  marginBottom: 14,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

/* ------------------------------------------------------------------ */
/* Risk matrix helpers                                                 */
/* ------------------------------------------------------------------ */

function riscoSeverity(p: Risco["probabilidade"], i: Risco["impacto"]) {
  const map = { Baixa: 1, Média: 2, Alta: 3, Baixo: 1, Médio: 2, Alto: 3 } as const;
  const score = map[p] * map[i];
  if (score >= 6) return { label: "Alto", color: "#dc2626", bg: "#fee2e2" };
  if (score >= 3) return { label: "Médio", color: "#b45309", bg: "#fef3c7" };
  return { label: "Baixo", color: "#15803d", bg: "#dcfce7" };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type TabId = "geral" | "equipe" | "escopo" | "riscos";

export function CadastroProjetos() {
  const [tab, setTab] = useState<TabId>("geral");

  // Geral
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [projetoMacro, setProjetoMacro] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade | "">("");
  const [saude, setSaude] = useState<Saude | "">("");
  const [dataInicio, setDataInicio] = useState("");
  const [previsaoEntrega, setPrevisaoEntrega] = useState("");
  const [status, setStatus] = useState<Status>("Planejamento");

  // Equipe
  const [gerente, setGerente] = useState("");
  const [patrocinador, setPatrocinador] = useState("");
  const [analista, setAnalista] = useState("");
  const [productOwner, setProductOwner] = useState("");
  const [encarregado, setEncarregado] = useState("");
  const [areaSolicitante, setAreaSolicitante] = useState("");
  const [clienteInterno, setClienteInterno] = useState("");
  const [horasPlanejadas, setHorasPlanejadas] = useState("");
  const [horasSprint, setHorasSprint] = useState("");
  const [recursos, setRecursos] = useState<{ recurso: string; atuacao: string; equipe: string }[]>([]);
  const [novoRecurso, setNovoRecurso] = useState("");
  const [novaAtuacao, setNovaAtuacao] = useState("");
  const [novaEquipe, setNovaEquipe] = useState("");


  // Escopo
  const [objetivo, setObjetivo] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [entregas, setEntregas] = useState<Entrega[]>([]);

  // Riscos
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [planoContingencia, setPlanoContingencia] = useState("");
  const [estrategiaMitigacao, setEstrategiaMitigacao] = useState("");
  const [responsavelRiscos, setResponsavelRiscos] = useState("");

  // Validation
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const limpar = () => {
    setCodigo("");
    setNome("");
    setProjetoMacro("");
    setDescricao("");
    setPrioridade("");
    setSaude("");
    setDataInicio("");
    setPrevisaoEntrega("");
    setStatus("Planejamento");
    setGerente("");
    setPatrocinador("");
    setAnalista("");
    setProductOwner("");
    setEncarregado("");
    setAreaSolicitante("");
    setClienteInterno("");
    setHorasPlanejadas("");
    setHorasSprint("");
    setRecursos([]);
    setNovoRecurso("");
    setNovaAtuacao("");
    setNovaEquipe("");

    setObjetivo("");
    setJustificativa("");
    setEntregas([]);
    setRiscos([]);
    setPlanoContingencia("");
    setEstrategiaMitigacao("");
    setResponsavelRiscos("");
    setErrors({});
  };

  const salvar = () => {
    const e: Record<string, boolean> = {};
    if (!codigo.trim()) e.codigo = true;
    if (!nome.trim()) e.nome = true;
    if (!projetoMacro) e.projetoMacro = true;
    if (!prioridade) e.prioridade = true;
    if (!dataInicio) e.dataInicio = true;
    if (!previsaoEntrega) e.previsaoEntrega = true;
    setErrors(e);
    if (Object.keys(e).length === 0) {
      // success
      alert("Projeto salvo com sucesso!");
    } else {
      // jump to Geral if errors are there
      if (e.codigo || e.nome || e.projetoMacro || e.prioridade || e.dataInicio || e.previsaoEntrega) {
        setTab("geral");
      }
    }
  };

  const addRecurso = () => {
    if (!novoRecurso || !novaAtuacao || !novaEquipe) return;
    if (recursos.some((r) => r.recurso === novoRecurso && r.atuacao === novaAtuacao && r.equipe === novaEquipe)) return;
    setRecursos((rs) => [...rs, { recurso: novoRecurso, atuacao: novaAtuacao, equipe: novaEquipe }]);
    setNovoRecurso("");
    setNovaAtuacao("");
    setNovaEquipe("");
  };

  const removeRecurso = (idx: number) => setRecursos((x) => x.filter((_, i) => i !== idx));


  const addRisco = () => {
    setRiscos((r) => [
      ...r,
      {
        id: Date.now(),
        cod: `R-${String(r.length + 1).padStart(3, "0")}`,
        descricao: "",
        probabilidade: "Baixa",
        impacto: "Baixo",
        consequencia: "",
      },
    ]);
  };

  const updRisco = (id: number, patch: Partial<Risco>) =>
    setRiscos((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const delRisco = (id: number) => setRiscos((r) => r.filter((x) => x.id !== id));

  /* ----------------------------------- */
  /* Tabs                                */
  /* ----------------------------------- */

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "geral", label: "Geral", icon: <FileText size={14} /> },
    { id: "equipe", label: "Recursos", icon: <Users size={14} /> },
    { id: "escopo", label: "Escopo", icon: <Target size={14} /> },
    { id: "riscos", label: "Riscos", icon: <AlertTriangle size={14} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "var(--foreground)",
              lineHeight: "1.3",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FolderOpen size={22} style={{ color: "#1a56db" }} />
            Cadastro de Projetos
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
            Cadastre projetos, defina escopo, equipe envolvida e mapeie os riscos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button style={btnOutline} onClick={limpar}>
            <RefreshCw size={14} /> Limpar
          </button>
          <button style={btnPrimary} onClick={salvar}>
            <Check size={14} /> Salvar
          </button>
        </div>
      </div>

      {/* Tabs nav */}
      <div className="flex items-center gap-1 mb-5 border-b" style={{ borderColor: "var(--border)" }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
              style={{
                color: active ? "#1a56db" : "var(--muted-foreground)",
                fontWeight: active ? 600 : 500,
                borderBottom: active ? "2px solid #1a56db" : "2px solid transparent",
                marginBottom: -1,
                cursor: "pointer",
                background: "transparent",
              }}
            >
              {t.icon} {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB: GERAL */}
      {tab === "geral" && (
        <div className="grid gap-5">
          <div style={sectionCard}>
            <div style={sectionTitle}>
              <FileText size={16} style={{ color: "#1a56db" }} /> Informações gerais
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label style={labelStyle}>
                  Código / ID
                  <Req />
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: PRJ-001"
                  style={fieldBase(errors.codigo)}
                  {...focusHandlers(errors.codigo)}
                />
                {errors.codigo && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>Campo obrigatório</p>}
              </div>
              <div className="md:col-span-5">
                <label style={labelStyle}>
                  Nome do projeto
                  <Req />
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Implantação do novo CRM"
                  style={fieldBase(errors.nome)}
                  {...focusHandlers(errors.nome)}
                />
                {errors.nome && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>Campo obrigatório</p>}
              </div>
              <div className="md:col-span-4">
                <label style={labelStyle}>
                  Programa
                  <Req />
                </label>
                <select
                  value={projetoMacro}
                  onChange={(e) => setProjetoMacro(e.target.value)}
                  style={fieldBase(errors.projetoMacro)}
                  {...focusHandlers(errors.projetoMacro)}
                >
                  <option value="">Selecione...</option>
                  {PROJETOS_MACRO.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.projetoMacro && (
                  <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>Campo obrigatório</p>
                )}
              </div>

              <div className="md:col-span-12">
                <label style={labelStyle}>Descrição</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  placeholder="Descreva brevemente o projeto..."
                  style={{ ...fieldBase(), resize: "vertical", fontFamily: "inherit" }}
                  {...focusHandlers()}
                />
              </div>

              <div className="md:col-span-3">
                <label style={labelStyle}>
                  Prioridade
                  <Req />
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                  style={fieldBase(errors.prioridade)}
                  {...focusHandlers(errors.prioridade)}
                >
                  <option value="">Selecione...</option>
                  {(["Pequena", "Média", "Alta", "Especial"] as Prioridade[]).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.prioridade && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>Campo obrigatório</p>}
              </div>
              <div className="md:col-span-3">
                <label style={labelStyle}>Saúde</label>
                <select
                  value={saude}
                  onChange={(e) => setSaude(e.target.value as Saude)}
                  style={fieldBase()}
                  {...focusHandlers()}
                >
                  <option value="">Selecione...</option>
                  {(["Excelente", "Boa", "Atenção", "Crítica"] as Saude[]).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>


            </div>
          </div>

          <div style={sectionCard}>
            <div style={sectionTitle}>
              <Calendar size={16} style={{ color: "#1a56db" }} /> Datas e status
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>
                  Data de início
                  <Req />
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  style={fieldBase(errors.dataInicio)}
                  {...focusHandlers(errors.dataInicio)}
                />
                {errors.dataInicio && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>Campo obrigatório</p>}
              </div>
              <div>
                <label style={labelStyle}>
                  Previsão de entrega
                  <Req />
                </label>
                <input
                  type="date"
                  value={previsaoEntrega}
                  onChange={(e) => setPrevisaoEntrega(e.target.value)}
                  style={fieldBase(errors.previsaoEntrega)}
                  {...focusHandlers(errors.previsaoEntrega)}
                />
                {errors.previsaoEntrega && (
                  <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>Campo obrigatório</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Status atual</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  style={fieldBase()}
                  {...focusHandlers()}
                >
                  {(
                    ["Planejamento", "Em andamento", "Em revisão", "Concluído", "Cancelado", "Suspenso"] as Status[]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EQUIPE */}
      {tab === "equipe" && (
        <div className="grid gap-5">
          <div style={sectionCard}>
            <div style={sectionTitle}>
              <Users size={16} style={{ color: "#1a56db" }} /> Responsáveis
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Gerente de projeto", value: gerente, set: setGerente, options: PESSOAS },
                { label: "Patrocinador (sponsor)", value: patrocinador, set: setPatrocinador, options: PESSOAS },
                { label: "Analista de sistemas", value: analista, set: setAnalista, options: PESSOAS },
                { label: "Product Owner", value: productOwner, set: setProductOwner, options: PESSOAS },
                { label: "Encarregado", value: encarregado, set: setEncarregado, options: PESSOAS },

                {
                  label: "Área / Departamento solicitante",
                  value: areaSolicitante,
                  set: setAreaSolicitante,
                  options: AREAS,
                },
                { label: "Cliente interno", value: clienteInterno, set: setClienteInterno, options: PESSOAS },
              ].map((f) => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <select
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    style={fieldBase()}
                    {...focusHandlers()}
                  >
                    <option value="">Selecione...</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label style={labelStyle}>Qtd de horas planejadas</label>
                <input
                  type="number"
                  min={0}
                  value={horasPlanejadas}
                  onChange={(e) => setHorasPlanejadas(e.target.value)}
                  placeholder="Ex: 480"
                  style={fieldBase()}
                  {...focusHandlers()}
                />
              </div>
              <div>
                <label style={labelStyle}>Horas por sprint / ciclo</label>
                <input
                  type="number"
                  min={0}
                  value={horasSprint}
                  onChange={(e) => setHorasSprint(e.target.value)}
                  placeholder="Ex: 80"
                  style={fieldBase()}
                  {...focusHandlers()}
                />
              </div>
            </div>
          </div>

          <div style={sectionCard}>
            <div style={sectionTitle}>
              <Users size={16} style={{ color: "#1a56db" }} /> Recursos
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
              <div>
                <label style={labelStyle}>Recurso</label>
                <select
                  value={novoRecurso}
                  onChange={(e) => setNovoRecurso(e.target.value)}
                  style={fieldBase()}
                  {...focusHandlers()}
                >
                  <option value="">Selecione...</option>
                  {PESSOAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Atuação</label>
                <select
                  value={novaAtuacao}
                  onChange={(e) => setNovaAtuacao(e.target.value)}
                  style={fieldBase()}
                  {...focusHandlers()}
                >
                  <option value="">Selecione...</option>
                  {ATUACOES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Equipe</label>
                <select
                  value={novaEquipe}
                  onChange={(e) => setNovaEquipe(e.target.value)}
                  style={fieldBase()}
                  {...focusHandlers()}
                >
                  <option value="">Selecione...</option>
                  {EQUIPES.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  style={btnPrimary}
                  onClick={addRecurso}
                  disabled={!novoRecurso || !novaAtuacao || !novaEquipe}
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>

            {recursos.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  fontSize: 13,
                  border: "1px dashed var(--border)",
                  borderRadius: 8,
                }}
              >
                Nenhum recurso adicionado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Recurso", "Atuação", "Equipe", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--muted-foreground)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recursos.map((r, i) => (
                      <tr key={i}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{r.recurso}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{r.atuacao}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{r.equipe}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                          <button style={btnDanger} onClick={() => removeRecurso(i)}>
                            <Trash2 size={12} /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: ESCOPO */}
      {tab === "escopo" && (
        <div className="grid gap-5">
          <div style={sectionCard}>
            <div style={sectionTitle}>
              <Target size={16} style={{ color: "#1a56db" }} /> Escopo do projeto
            </div>
            <div className="grid gap-4">
              <div>
                <label style={labelStyle}>Objetivo</label>
                <textarea
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  rows={4}
                  placeholder="Descreva o objetivo do projeto..."
                  style={{ ...fieldBase(), resize: "vertical", fontFamily: "inherit" }}
                  {...focusHandlers()}
                />
              </div>
              <div>
                <label style={labelStyle}>Escopo</label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  rows={4}
                  placeholder="Descreva o escopo do projeto..."
                  style={{ ...fieldBase(), resize: "vertical", fontFamily: "inherit" }}
                  {...focusHandlers()}
                />
              </div>
            </div>
          </div>

          <div style={sectionCard}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div style={{ ...sectionTitle, marginBottom: 0 }}>
                <FileText size={16} style={{ color: "#1a56db" }} /> Entregas e Estimativas
              </div>
              <button
                style={btnPrimary}
                onClick={() =>
                  setEntregas((es) => [
                    ...es,
                    { id: Date.now(), etapa: "", tarefa: "", estimativa: "" },
                  ])
                }
              >
                <Plus size={14} /> Adicionar entrega
              </button>
            </div>

            {entregas.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  fontSize: 13,
                  border: "1px dashed var(--border)",
                  borderRadius: 8,
                }}
              >
                Nenhuma entrega cadastrada. Clique em <strong>Adicionar entrega</strong> para começar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Etapa", "Tarefa", "Estimativa", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--muted-foreground)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.map((en) => (
                      <tr key={en.id}>
                        <td style={{ padding: 8, borderBottom: "1px solid var(--border)", minWidth: 180 }}>
                          <input
                            type="text"
                            value={en.etapa}
                            onChange={(e) =>
                              setEntregas((es) =>
                                es.map((x) => (x.id === en.id ? { ...x, etapa: e.target.value } : x)),
                              )
                            }
                            placeholder="Ex: Fase 1"
                            style={fieldBase()}
                            {...focusHandlers()}
                          />
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid var(--border)", minWidth: 240 }}>
                          <input
                            type="text"
                            value={en.tarefa}
                            onChange={(e) =>
                              setEntregas((es) =>
                                es.map((x) => (x.id === en.id ? { ...x, tarefa: e.target.value } : x)),
                              )
                            }
                            placeholder="Descreva a tarefa..."
                            style={fieldBase()}
                            {...focusHandlers()}
                          />
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid var(--border)", minWidth: 160 }}>
                          <input
                            type="text"
                            value={en.estimativa}
                            onChange={(e) =>
                              setEntregas((es) =>
                                es.map((x) => (x.id === en.id ? { ...x, estimativa: e.target.value } : x)),
                              )
                            }
                            placeholder="Ex: 40h ou 5 dias"
                            style={fieldBase()}
                            {...focusHandlers()}
                          />
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                          <button
                            style={btnDanger}
                            onClick={() => setEntregas((es) => es.filter((x) => x.id !== en.id))}
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: RISCOS */}
      {tab === "riscos" && (
        <div className="grid gap-5">
          <div style={sectionCard}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div style={{ ...sectionTitle, marginBottom: 0 }}>
                <AlertTriangle size={16} style={{ color: "#1a56db" }} /> Riscos
              </div>
              <button style={btnPrimary} onClick={addRisco}>
                <Plus size={14} /> Adicionar risco
              </button>
            </div>

            {riscos.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  fontSize: 13,
                  border: "1px dashed var(--border)",
                  borderRadius: 8,
                }}
              >
                Nenhum risco cadastrado. Clique em <strong>Adicionar risco</strong> para começar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Cód", "Descrição", "Probabilidade", "Impacto", "Consequência / Ações", "Severidade", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--muted-foreground)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {riscos.map((r) => {
                      const sev = riscoSeverity(r.probabilidade, r.impacto);
                      return (
                        <tr key={r.id}>
                          <td style={{ padding: 8, borderBottom: "1px solid var(--border)", minWidth: 100 }}>
                            <input
                              type="text"
                              value={r.cod}
                              onChange={(e) => updRisco(r.id, { cod: e.target.value })}
                              placeholder="R-001"
                              style={fieldBase()}
                              {...focusHandlers()}
                            />
                          </td>
                          <td style={{ padding: 8, borderBottom: "1px solid var(--border)", minWidth: 240 }}>
                            <input
                              type="text"
                              value={r.descricao}
                              onChange={(e) => updRisco(r.id, { descricao: e.target.value })}
                              placeholder="Descreva o risco..."
                              style={fieldBase()}
                              {...focusHandlers()}
                            />
                          </td>
                          <td style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
                            <select
                              value={r.probabilidade}
                              onChange={(e) =>
                                updRisco(r.id, { probabilidade: e.target.value as Risco["probabilidade"] })
                              }
                              style={fieldBase()}
                              {...focusHandlers()}
                            >
                              <option value="Baixa">Baixa</option>
                              <option value="Média">Média</option>
                              <option value="Alta">Alta</option>
                            </select>
                          </td>
                          <td style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
                            <select
                              value={r.impacto}
                              onChange={(e) => updRisco(r.id, { impacto: e.target.value as Risco["impacto"] })}
                              style={fieldBase()}
                              {...focusHandlers()}
                            >
                              <option value="Baixo">Baixo</option>
                              <option value="Médio">Médio</option>
                              <option value="Alto">Alto</option>
                            </select>
                          </td>
                          <td style={{ padding: 8, borderBottom: "1px solid var(--border)", minWidth: 260 }}>
                            <textarea
                              value={r.consequencia}
                              onChange={(e) => updRisco(r.id, { consequencia: e.target.value })}
                              rows={2}
                              placeholder="Descreva consequências e ações..."
                              style={{ ...fieldBase(), resize: "vertical", fontFamily: "inherit" }}
                              {...focusHandlers()}
                            />
                          </td>
                          <td style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
                            <span
                              style={{
                                background: sev.bg,
                                color: sev.color,
                                padding: "4px 10px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {sev.label}
                            </span>
                          </td>
                          <td style={{ padding: 8, borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                            <button style={btnDanger} onClick={() => delRisco(r.id)}>
                              <Trash2 size={12} /> Remover
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={sectionCard}>
            <div style={sectionTitle}>
              <AlertTriangle size={16} style={{ color: "#1a56db" }} /> Mitigação e responsabilidade
            </div>
            <div className="grid gap-4">
              <div>
                <label style={labelStyle}>Plano de contingência</label>
                <textarea
                  value={planoContingencia}
                  onChange={(e) => setPlanoContingencia(e.target.value)}
                  rows={3}
                  placeholder="Descreva o plano de contingência..."
                  style={{ ...fieldBase(), resize: "vertical", fontFamily: "inherit" }}
                  {...focusHandlers()}
                />
              </div>
              <div>
                <label style={labelStyle}>Estratégia geral de mitigação</label>
                <textarea
                  value={estrategiaMitigacao}
                  onChange={(e) => setEstrategiaMitigacao(e.target.value)}
                  rows={3}
                  placeholder="Descreva a estratégia geral de mitigação..."
                  style={{ ...fieldBase(), resize: "vertical", fontFamily: "inherit" }}
                  {...focusHandlers()}
                />
              </div>
              <div className="md:max-w-md">
                <label style={labelStyle}>Responsável pelos riscos</label>
                <select
                  value={responsavelRiscos}
                  onChange={(e) => setResponsavelRiscos(e.target.value)}
                  style={fieldBase()}
                  {...focusHandlers()}
                >
                  <option value="">Selecione...</option>
                  {PESSOAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroProjetos;
