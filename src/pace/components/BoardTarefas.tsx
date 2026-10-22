import { useMemo, useState } from "react";
import { Plus, X, Search, Clock, User, FolderOpen, Tag as TagIcon, CalendarDays, MessageSquare, Check, Send } from "lucide-react";

type Label = { id: string; nome: string; cor: string };
type Comentario = { id: string; autor: string; texto: string; data: string };

const LABELS_DISPONIVEIS: Label[] = [
  { id: "l1", nome: "00 Origem: Interna", cor: "#166534" },
  { id: "l2", nome: "02 Prioridade: Importante", cor: "#ea580c" },
  { id: "l3", nome: "03 Complexidade: G", cor: "#dc2626" },
  { id: "l4", nome: "04 Tipo: Analise", cor: "#f59e0b" },
  { id: "l5", nome: "05 Categoria: Iniciativa", cor: "#0891b2" },
  { id: "l6", nome: "07 Aplicacao: Gestao de Mudanca", cor: "#7c3aed" },
  { id: "l7", nome: "10 Solicitante: Marcio Hartz", cor: "#a21caf" },
  { id: "l8", nome: "Fazendo (Doing)", cor: "#64748b" },
];
const USUARIO_ATUAL = "Você";

type LaneId = "backlog" | "sprint" | "doing" | "blocked" | "qa" | "entregues";

type LancamentoHoras = { id: string; pessoa: string; horas: number };

type Tarefa = {
  id: string;
  titulo: string;
  alocados: string[];
  quadro: string;
  tipo: string;
  projeto: string;
  descricao: string;
  dataInicio: string;
  dataEntrega: string;
  esforcoEstimado: number;
  horasTrabalhadas: LancamentoHoras[];
  lane: LaneId;
  labels: string[];
  comentarios: Comentario[];
};


const LANES: { id: LaneId; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#64748b" },
  { id: "sprint", label: "Sprint", color: "#3b82f6" },
  { id: "doing", label: "Doing", color: "#f59e0b" },
  { id: "blocked", label: "Blocked", color: "#ef4444" },
  { id: "qa", label: "QA", color: "#a855f7" },
  { id: "entregues", label: "Entregues", color: "#10b981" },
];

const TIPOS = ["Análise", "Desenvolvimento", "Design", "Documentação", "Teste", "Revisão", "Reunião"];
const QUADROS = ["Equipe Inovação", "Projeto Pace Flow", "Projeto Pace Route"];
const PROJETOS = ["Projeto Alpha", "Projeto Beta", "Projeto Gamma", "Projeto Delta"];
const PESSOAS = ["Ana Souza", "Bruno Lima", "Carla Dias", "Diego Rocha", "Eduarda Melo", "Felipe Alves"];

const SEED: Tarefa[] = [
  {
    id: "t1",
    titulo: "Levantar requisitos do módulo de relatórios",
    alocados: ["Ana Souza"],
    quadro: "Board Principal",
    tipo: "Análise",
    projeto: "Projeto Alpha",
    descricao: "Mapear necessidades junto aos stakeholders.",
    dataInicio: "2025-01-10",
    dataEntrega: "2025-01-15",
    esforcoEstimado: 8,
    horasTrabalhadas: [{ id: "h1", pessoa: "Ana Souza", horas: 2 }],
    lane: "backlog",
    labels: ["l1", "l2", "l4"],
    comentarios: [
      { id: "c1", autor: "Ana Souza", texto: "Iniciando levantamento com o time.", data: "2025-01-10T10:00:00" },
    ],
  },
  {
    id: "t2",
    titulo: "Implementar API de notificações",
    alocados: ["Bruno Lima", "Diego Rocha"],
    quadro: "Board Principal",
    tipo: "Desenvolvimento",
    projeto: "Projeto Beta",
    descricao: "Endpoint REST para disparo de notificações.",
    dataInicio: "2025-01-08",
    dataEntrega: "2025-01-20",
    esforcoEstimado: 24,
    horasTrabalhadas: [{ id: "h2", pessoa: "Bruno Lima", horas: 8 }, { id: "h3", pessoa: "Diego Rocha", horas: 4 }],
    lane: "doing",
    labels: ["l5", "l8"],
    comentarios: [],
  },
  {
    id: "t3",
    titulo: "Aguardando aprovação de orçamento",
    alocados: ["Carla Dias"],
    quadro: "Board Principal",
    tipo: "Revisão",
    projeto: "Projeto Gamma",
    descricao: "Bloqueado por dependência externa.",
    dataInicio: "2025-01-05",
    dataEntrega: "2025-01-12",
    esforcoEstimado: 4,
    horasTrabalhadas: [{ id: "h4", pessoa: "Carla Dias", horas: 3 }],
    lane: "blocked",
    labels: ["l3"],
    comentarios: [],
  },
  {
    id: "t4",
    titulo: "Testes de regressão do cadastro de projetos",
    alocados: ["Eduarda Melo"],
    quadro: "Board Principal",
    tipo: "Teste",
    projeto: "Projeto Alpha",
    descricao: "Validar fluxos após refatoração.",
    dataInicio: "2025-01-09",
    dataEntrega: "2025-01-14",
    esforcoEstimado: 6,
    horasTrabalhadas: [{ id: "h5", pessoa: "Eduarda Melo", horas: 4 }],
    lane: "qa",
    labels: [],
    comentarios: [],
  },
  {
    id: "t5",
    titulo: "Deploy v1.2 em produção",
    alocados: ["Felipe Alves"],
    quadro: "Board Principal",
    tipo: "Desenvolvimento",
    projeto: "Projeto Delta",
    descricao: "Release concluída com sucesso.",
    dataInicio: "2025-01-02",
    dataEntrega: "2025-01-06",
    esforcoEstimado: 4,
    horasTrabalhadas: [{ id: "h6", pessoa: "Felipe Alves", horas: 5 }],
    lane: "entregues",
    labels: [],
    comentarios: [],
  },
];

const emptyForm: Omit<Tarefa, "id"> = {
  titulo: "",
  alocados: [],
  quadro: QUADROS[0],
  tipo: TIPOS[0],
  projeto: PROJETOS[0],
  descricao: "",
  dataInicio: "",
  dataEntrega: "",
  esforcoEstimado: 0,
  horasTrabalhadas: [],
  lane: "backlog",
  labels: [],
  comentarios: [],
};

export function BoardTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>(SEED);
  const [busca, setBusca] = useState("");
  const [filtroQuadro, setFiltroQuadro] = useState<string>("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Tarefa, "id">>(emptyForm);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [labelsAbertos, setLabelsAbertos] = useState(false);
  const [labelBusca, setLabelBusca] = useState("");
  const [novoComentario, setNovoComentario] = useState("");

  const tarefasFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return tarefas.filter((t) => {
      if (filtroQuadro !== "Todos" && t.quadro !== filtroQuadro) return false;
      if (!q) return true;
      return (
        t.titulo.toLowerCase().includes(q) ||
        t.projeto.toLowerCase().includes(q) ||
        t.alocados.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [tarefas, busca, filtroQuadro]);

  function abrirNova(lane: LaneId = "backlog") {
    setEditandoId(null);
    setForm({ ...emptyForm, lane });
    setLabelsAbertos(false);
    setLabelBusca("");
    setNovoComentario("");
    setModalAberto(true);
  }

  function abrirEditar(t: Tarefa) {
    setEditandoId(t.id);
    const { id: _id, ...rest } = t;
    void _id;
    setForm(rest);
    setLabelsAbertos(false);
    setLabelBusca("");
    setNovoComentario("");
    setModalAberto(true);
  }

  function salvar() {
    if (!form.titulo.trim()) return;
    if (editandoId) {
      setTarefas((prev) => prev.map((t) => (t.id === editandoId ? { ...t, ...form } : t)));
    } else {
      setTarefas((prev) => [...prev, { ...form, id: `t${Date.now()}` }]);
    }
    setModalAberto(false);
  }

  function excluir() {
    if (!editandoId) return;
    setTarefas((prev) => prev.filter((t) => t.id !== editandoId));
    setModalAberto(false);
  }

  function onDrop(lane: LaneId) {
    if (!draggingId) return;
    setTarefas((prev) => prev.map((t) => (t.id === draggingId ? { ...t, lane } : t)));
    setDraggingId(null);
  }

  function toggleAlocado(nome: string) {
    setForm((f) => ({
      ...f,
      alocados: f.alocados.includes(nome) ? f.alocados.filter((a) => a !== nome) : [...f.alocados, nome],
    }));
  }

  function toggleLabel(id: string) {
    setForm((f) => ({
      ...f,
      labels: f.labels.includes(id) ? f.labels.filter((l) => l !== id) : [...f.labels, id],
    }));
  }

  function adicionarComentario() {
    const txt = novoComentario.trim();
    if (!txt) return;
    setForm((f) => ({
      ...f,
      comentarios: [
        ...f.comentarios,
        { id: `c${Date.now()}`, autor: USUARIO_ATUAL, texto: txt, data: new Date().toISOString() },
      ],
    }));
    setNovoComentario("");
  }

  function removerComentario(id: string) {
    setForm((f) => ({ ...f, comentarios: f.comentarios.filter((c) => c.id !== id) }));
  }

  return (
    <div className="flex flex-col h-full" style={{ color: "var(--foreground)" }}>
      {/* Header */}
      <div className="mb-5">
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Board de Tarefas</h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
          Gerencie tarefas em formato kanban — arraste entre as raias para alterar o status.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div
          className="flex items-center gap-2 rounded px-3 py-1.5"
          style={{ background: "var(--card)", border: "1px solid var(--border)", minWidth: 240 }}
        >
          <Search size={14} style={{ color: "var(--muted-foreground)" }} />
          <input
            type="text"
            placeholder="Buscar tarefa, projeto ou pessoa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-transparent outline-none w-full"
            style={{ fontSize: 13, color: "var(--foreground)" }}
          />
        </div>
        <select
          value={filtroQuadro}
          onChange={(e) => setFiltroQuadro(e.target.value)}
          className="rounded px-3 py-1.5"
          style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
        >
          <option>Todos</option>
          {QUADROS.map((q) => (
            <option key={q}>{q}</option>
          ))}
        </select>
        <div className="ml-auto">
          <button
            onClick={() => abrirNova()}
            className="flex items-center gap-2 rounded px-3 py-1.5 transition-opacity"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          >
            <Plus size={14} /> Nova tarefa
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-2">
          {LANES.map((lane) => {
            const items = tarefasFiltradas.filter((t) => t.lane === lane.id);
            return (
              <div
                key={lane.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(lane.id)}
                className="flex flex-col rounded"
                style={{
                  width: 280,
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  maxHeight: "calc(100vh - 240px)",
                }}
              >
                <div
                  className="flex items-center justify-between px-3 py-2 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full" style={{ background: lane.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{lane.label}</span>
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{ background: "var(--card)", fontSize: 11, color: "var(--muted-foreground)" }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <button
                    onClick={() => abrirNova(lane.id)}
                    className="p-0.5 rounded transition-colors"
                    style={{ color: "var(--muted-foreground)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)")}
                    title="Adicionar nesta raia"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {items.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDraggingId(t.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => abrirEditar(t)}
                      className="rounded p-3 cursor-pointer transition-shadow"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        opacity: draggingId === t.id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
                    >
                      {t.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {t.labels.map((lid) => {
                            const lab = LABELS_DISPONIVEIS.find((l) => l.id === lid);
                            if (!lab) return null;
                            return (
                              <span
                                key={lid}
                                title={lab.nome}
                                className="rounded px-1.5 py-0.5 truncate"
                                style={{ background: lab.cor, color: "#fff", fontSize: 10, fontWeight: 600, maxWidth: 140 }}
                              >
                                {lab.nome}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.35 }}>
                        {t.titulo}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        <FolderOpen size={11} />
                        <span className="truncate">{t.projeto}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        <TagIcon size={11} />
                        <span>{t.tipo}</span>
                      </div>
                      {t.dataEntrega && (
                        <div className="flex items-center gap-1.5 mt-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          <CalendarDays size={11} />
                          <span>Entrega {new Date(t.dataEntrega).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex -space-x-1.5">
                          {t.alocados.slice(0, 3).map((a) => (
                            <div
                              key={a}
                              title={a}
                              className="size-6 rounded-full flex items-center justify-center"
                              style={{
                                background: "var(--accent)",
                                color: "var(--accent-foreground)",
                                fontSize: 10,
                                fontWeight: 600,
                                border: "2px solid var(--card)",
                              }}
                            >
                              {a.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                          ))}
                          {t.alocados.length > 3 && (
                            <div
                              className="size-6 rounded-full flex items-center justify-center"
                              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: 10, border: "2px solid var(--card)" }}
                            >
                              +{t.alocados.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          <Clock size={11} />
                          {t.horasTrabalhadas.reduce((s, h) => s + (h.horas || 0), 0)}h / {t.esforcoEstimado}h
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div
                      className="text-center py-6 rounded"
                      style={{ fontSize: 11, color: "var(--muted-foreground)", border: "1px dashed var(--border)" }}
                    >
                      Sem tarefas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setModalAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>
                {editandoId ? "Editar tarefa" : "Nova tarefa"}
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded"
                style={{ color: "var(--muted-foreground)" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Título da tarefa">
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full rounded px-3 py-2 outline-none"
                  style={inputStyle}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Quadro">
                  <select
                    value={form.quadro}
                    onChange={(e) => setForm({ ...form, quadro: e.target.value })}
                    className="w-full rounded px-3 py-2 outline-none"
                    style={inputStyle}
                  >
                    {QUADROS.map((q) => (
                      <option key={q}>{q}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Atuação">
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full rounded px-3 py-2 outline-none"
                    style={inputStyle}
                  >
                    {TIPOS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Categoria">
                  <select
                    value={form.projeto}
                    onChange={(e) => setForm({ ...form, projeto: e.target.value })}
                    className="w-full rounded px-3 py-2 outline-none"
                    style={inputStyle}
                  >
                    {PROJETOS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Raia">
                  <select
                    value={form.lane}
                    onChange={(e) => setForm({ ...form, lane: e.target.value as LaneId })}
                    className="w-full rounded px-3 py-2 outline-none"
                    style={inputStyle}
                  >
                    {LANES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Alocados">
                <div className="flex flex-wrap gap-1.5">
                  {PESSOAS.map((p) => {
                    const sel = form.alocados.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleAlocado(p)}
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors"
                        style={{
                          background: sel ? "var(--primary)" : "var(--muted)",
                          color: sel ? "var(--primary-foreground)" : "var(--foreground)",
                          fontSize: 12,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <User size={11} />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Descrição da tarefa">
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  className="w-full rounded px-3 py-2 outline-none resize-none"
                  style={inputStyle}
                />
              </Field>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Data início">
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                    className="w-full rounded px-3 py-2 outline-none"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Data entrega">
                  <input
                    type="date"
                    value={form.dataEntrega}
                    onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })}
                    className="w-full rounded px-3 py-2 outline-none"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Esforço estimado (h)">
                  <input
                    type="number"
                    min={0}
                    value={form.esforcoEstimado}
                    onChange={(e) => setForm({ ...form, esforcoEstimado: Number(e.target.value) })}
                    className="w-full rounded px-3 py-2 outline-none"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field
                label={`Lançamentos de horas (total ${form.horasTrabalhadas.reduce((s, h) => s + (Number(h.horas) || 0), 0)}h)`}
              >
                <div className="space-y-2">
                  {form.horasTrabalhadas.length === 0 && (
                    <div
                      className="rounded px-3 py-2 text-center"
                      style={{
                        fontSize: 12,
                        color: "var(--muted-foreground)",
                        border: "1px dashed var(--border)",
                      }}
                    >
                      Nenhuma hora lançada.
                    </div>
                  )}
                  {form.horasTrabalhadas.map((h, idx) => (
                    <div key={h.id} className="flex items-center gap-2">
                      <select
                        value={h.pessoa}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            horasTrabalhadas: f.horasTrabalhadas.map((x, i) =>
                              i === idx ? { ...x, pessoa: e.target.value } : x,
                            ),
                          }))
                        }
                        className="rounded px-2 py-1.5 outline-none flex-1"
                        style={inputStyle}
                      >
                        <option value="">Selecione a pessoa...</option>
                        {PESSOAS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={h.horas}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            horasTrabalhadas: f.horasTrabalhadas.map((x, i) =>
                              i === idx ? { ...x, horas: Number(e.target.value) } : x,
                            ),
                          }))
                        }
                        className="rounded px-2 py-1.5 outline-none"
                        style={{ ...inputStyle, width: 96 }}
                        placeholder="Horas"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            horasTrabalhadas: f.horasTrabalhadas.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1.5 rounded"
                        style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                        aria-label="Remover lançamento"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        horasTrabalhadas: [
                          ...f.horasTrabalhadas,
                          { id: `h${Date.now()}`, pessoa: "", horas: 0 },
                        ],
                      }))
                    }
                    className="flex items-center gap-1 rounded px-2 py-1"
                    style={{
                      background: "var(--muted)",
                      color: "var(--foreground)",
                      fontSize: 12,
                      border: "1px dashed var(--border)",
                    }}
                  >
                    <Plus size={12} /> Adicionar lançamento
                  </button>
                </div>
              </Field>



              {/* Labels */}
              <Field label="Labels">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {form.labels.length === 0 && (
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Nenhuma label</span>
                  )}
                  {form.labels.map((lid) => {
                    const lab = LABELS_DISPONIVEIS.find((l) => l.id === lid);
                    if (!lab) return null;
                    return (
                      <span
                        key={lid}
                        className="flex items-center gap-1 rounded px-2 py-0.5"
                        style={{ background: lab.cor, color: "#fff", fontSize: 11, fontWeight: 600 }}
                      >
                        {lab.nome}
                        <button
                          type="button"
                          onClick={() => toggleLabel(lid)}
                          style={{ color: "#fff", opacity: 0.85 }}
                          aria-label={`Remover ${lab.nome}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLabelsAbertos((v) => !v)}
                      className="flex items-center gap-1 rounded px-2 py-0.5"
                      style={{ background: "var(--muted)", color: "var(--foreground)", fontSize: 11, border: "1px dashed var(--border)" }}
                    >
                      <TagIcon size={11} /> Editar
                    </button>
                    {labelsAbertos && (
                      <div
                        className="absolute z-10 mt-1 rounded shadow-lg"
                        style={{ background: "var(--card)", border: "1px solid var(--border)", width: 280, right: 0 }}
                      >
                        <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
                          <div className="flex items-center gap-1.5 rounded px-2 py-1" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                            <Search size={12} style={{ color: "var(--muted-foreground)" }} />
                            <input
                              type="text"
                              value={labelBusca}
                              onChange={(e) => setLabelBusca(e.target.value)}
                              placeholder="Buscar labels..."
                              className="bg-transparent outline-none w-full"
                              style={{ fontSize: 12, color: "var(--foreground)" }}
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                          {LABELS_DISPONIVEIS.filter((l) =>
                            l.nome.toLowerCase().includes(labelBusca.toLowerCase()),
                          ).map((l) => {
                            const sel = form.labels.includes(l.id);
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => toggleLabel(l.id)}
                                className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left"
                                style={{ background: "transparent" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--muted)")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                              >
                                <span
                                  className="flex-1 rounded px-2 py-1 truncate"
                                  style={{ background: l.cor, color: "#fff", fontSize: 11, fontWeight: 600 }}
                                >
                                  {l.nome}
                                </span>
                                {sel && <Check size={13} style={{ color: "var(--foreground)" }} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Field>

              {/* Comentários */}
              <Field label={`Comentários (${form.comentarios.length})`}>
                <div className="space-y-2 mb-2">
                  {form.comentarios.map((c) => (
                    <div
                      key={c.id}
                      className="rounded p-2"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          <div
                            className="size-5 rounded-full flex items-center justify-center"
                            style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontSize: 9, fontWeight: 600 }}
                          >
                            {c.autor.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{c.autor}</span>
                          <span>· {new Date(c.data).toLocaleString("pt-BR")}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerComentario(c.id)}
                          style={{ color: "var(--muted-foreground)" }}
                          aria-label="Remover comentário"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--foreground)", whiteSpace: "pre-wrap" }}>{c.texto}</div>
                    </div>
                  ))}
                  {form.comentarios.length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Nenhum comentário ainda.</div>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare size={14} style={{ color: "var(--muted-foreground)", marginTop: 8 }} />
                  <textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    rows={2}
                    placeholder="Escreva um comentário..."
                    className="flex-1 rounded px-3 py-2 outline-none resize-none"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={adicionarComentario}
                    disabled={!novoComentario.trim()}
                    className="rounded px-3 py-2 flex items-center gap-1.5"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontSize: 12,
                      fontWeight: 500,
                      opacity: novoComentario.trim() ? 1 : 0.5,
                    }}
                  >
                    <Send size={12} /> Adicionar
                  </button>
                </div>
              </Field>
            </div>


            <div
              className="flex items-center justify-between gap-2 px-5 py-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                {editandoId && (
                  <button
                    onClick={excluir}
                    className="rounded px-3 py-1.5"
                    style={{ background: "transparent", color: "#ef4444", fontSize: 13, border: "1px solid #ef4444" }}
                  >
                    Excluir
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalAberto(false)}
                  className="rounded px-3 py-1.5"
                  style={{ background: "var(--muted)", color: "var(--foreground)", fontSize: 13 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  className="rounded px-3 py-1.5"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500 }}
                >
                  {editandoId ? "Salvar alterações" : "Criar tarefa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--background)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  fontSize: 13,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

export default BoardTarefas;
