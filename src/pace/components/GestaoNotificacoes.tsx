import { useMemo, useState } from "react";
import {
  Bell, Plus, Search, Pencil, Trash2, Filter, Mail, MessageSquare,
  AlertTriangle, CheckCircle2, XCircle, Users,
  Link2, History, Save, X, RefreshCw,
} from "lucide-react";

type Status = "Ativo" | "Inativo";
type Criticidade = "Baixa" | "Média" | "Alta" | "Crítica";
type CanalTipo = "E-mail" | "Teams";
type EnvioStatus = "Sucesso" | "Falha";

interface Evento {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  criticidade: Criticidade;
  status: Status;
}

interface Destinatario {
  id: number;
  nome: string;
  tipo: CanalTipo;
  endereco: string;
  status: Status;
}

interface Regra {
  id: number;
  eventoId: number;
  destinatarioId: number;
  ativo: boolean;
  prioridade: number;
  horaInicio: string;
  horaFim: string;
}

interface Historico {
  id: number;
  dataHora: string;
  eventoId: number;
  destinatarioId: number;
  canal: CanalTipo;
  status: EnvioStatus;
  mensagem: string;
  retornoApi: string;
}

const CRIT_COLORS: Record<Criticidade, { bg: string; fg: string; bd: string }> = {
  "Baixa":   { bg: "#ecfdf5", fg: "#047857", bd: "#a7f3d0" },
  "Média":   { bg: "#fffbeb", fg: "#b45309", bd: "#fcd34d" },
  "Alta":    { bg: "#fff1f2", fg: "#be123c", bd: "#fecdd3" },
  "Crítica": { bg: "#1f2937", fg: "#ffffff", bd: "#111827" },
};

const seedEventos: Evento[] = [
  { id: 1, codigo: "EVT-001", nome: "Projeto atrasado", descricao: "Disparado quando a data prevista é excedida", criticidade: "Alta", status: "Ativo" },
  { id: 2, codigo: "EVT-002", nome: "Projeto concluído", descricao: "Disparado ao marcar projeto como concluído", criticidade: "Baixa", status: "Ativo" },
  { id: 3, codigo: "EVT-003", nome: "Chamado aberto", descricao: "Novo chamado registrado no sistema", criticidade: "Média", status: "Ativo" },
  { id: 4, codigo: "EVT-004", nome: "SLA estourado", descricao: "SLA de atendimento expirado", criticidade: "Crítica", status: "Ativo" },
];

const seedDestinatarios: Destinatario[] = [
  { id: 1, nome: "Equipe PMO", tipo: "E-mail", endereco: "pmo@empresa.com.br", status: "Ativo" },
  { id: 2, nome: "Canal Projetos - Teams", tipo: "Teams", endereco: "https://outlook.office.com/webhook/abc...", status: "Ativo" },
  { id: 3, nome: "Diretoria", tipo: "E-mail", endereco: "diretoria@empresa.com.br", status: "Ativo" },
  { id: 4, nome: "Canal Suporte - Teams", tipo: "Teams", endereco: "https://outlook.office.com/webhook/xyz...", status: "Inativo" },
];

const seedRegras: Regra[] = [
  { id: 1, eventoId: 1, destinatarioId: 1, ativo: true, prioridade: 1, horaInicio: "08:00", horaFim: "18:00" },
  { id: 2, eventoId: 1, destinatarioId: 2, ativo: true, prioridade: 2, horaInicio: "00:00", horaFim: "23:59" },
  { id: 3, eventoId: 4, destinatarioId: 3, ativo: true, prioridade: 1, horaInicio: "00:00", horaFim: "23:59" },
  { id: 4, eventoId: 2, destinatarioId: 2, ativo: true, prioridade: 1, horaInicio: "08:00", horaFim: "20:00" },
];

const seedHistorico: Historico[] = [
  { id: 1, dataHora: "2025-01-15 09:42", eventoId: 1, destinatarioId: 1, canal: "E-mail", status: "Sucesso", mensagem: "Projeto ERP-2024 está atrasado", retornoApi: "250 OK Message accepted" },
  { id: 2, dataHora: "2025-01-15 09:42", eventoId: 1, destinatarioId: 2, canal: "Teams", status: "Sucesso", mensagem: "Projeto ERP-2024 está atrasado", retornoApi: "{\"status\":\"1\"}" },
  { id: 3, dataHora: "2025-01-15 10:11", eventoId: 3, destinatarioId: 1, canal: "E-mail", status: "Falha", mensagem: "Novo chamado #4521", retornoApi: "550 mailbox unavailable" },
  { id: 4, dataHora: "2025-01-15 11:03", eventoId: 4, destinatarioId: 3, canal: "E-mail", status: "Sucesso", mensagem: "SLA estourado no chamado #4501", retornoApi: "250 OK" },
  { id: 5, dataHora: "2025-01-15 14:25", eventoId: 2, destinatarioId: 2, canal: "Teams", status: "Sucesso", mensagem: "Projeto CRM-2024 concluído", retornoApi: "{\"status\":\"1\"}" },
];

const TABS = [
  { id: "eventos", label: "Eventos", icon: Bell },
  { id: "destinatarios", label: "Destinatários", icon: Users },
  { id: "regras", label: "Regras", icon: Link2 },
  { id: "historico", label: "Histórico", icon: History },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function GestaoNotificacoes() {
  const [tab, setTab] = useState<TabId>("eventos");
  const [eventos, setEventos] = useState<Evento[]>(seedEventos);
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>(seedDestinatarios);
  const [regras, setRegras] = useState<Regra[]>(seedRegras);
  const [historico] = useState<Historico[]>(seedHistorico);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--foreground)" }}>Gestão de Notificações</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
            Configure eventos, destinatários e regras de envio. Suporte a Microsoft Teams (webhook) e e-mail SMTP.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone="ok"><CheckCircle2 size={12} /> SMTP conectado</Badge>
          <Badge tone="info"><MessageSquare size={12} /> Teams ativo</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto" style={{ borderColor: "var(--border)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                color: active ? "#1a56db" : "var(--muted-foreground)",
                borderBottom: active ? "2px solid #1a56db" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "eventos" && <EventosTab eventos={eventos} setEventos={setEventos} />}
      {tab === "destinatarios" && <DestinatariosTab destinatarios={destinatarios} setDestinatarios={setDestinatarios} />}
      {tab === "regras" && <RegrasTab regras={regras} setRegras={setRegras} eventos={eventos} destinatarios={destinatarios} />}
      {tab === "historico" && <HistoricoTab historico={historico} eventos={eventos} destinatarios={destinatarios} />}
    </div>
  );
}

/* ───────────────────────── Eventos ───────────────────────── */

function EventosTab({ eventos, setEventos }: { eventos: Evento[]; setEventos: (e: Evento[]) => void }) {
  const [busca, setBusca] = useState("");
  const [editing, setEditing] = useState<Evento | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtrados = useMemo(
    () => eventos.filter((e) => `${e.codigo} ${e.nome} ${e.descricao}`.toLowerCase().includes(busca.toLowerCase())),
    [eventos, busca]
  );

  function salvar(ev: Evento) {
    if (eventos.some((x) => x.id === ev.id)) {
      setEventos(eventos.map((x) => (x.id === ev.id ? ev : x)));
    } else {
      setEventos([...eventos, { ...ev, id: Math.max(0, ...eventos.map((e) => e.id)) + 1 }]);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <Section
      title="Cadastro de Eventos"
      icon={<Bell size={15} />}
      action={
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium"
          style={{ background: "#1a56db" }}
        >
          <Plus size={14} /> Novo evento
        </button>
      }
    >
      <Toolbar busca={busca} setBusca={setBusca} placeholder="Buscar por código, nome ou descrição..." />
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
            <Th>Código</Th><Th>Nome</Th><Th>Descrição</Th><Th>Criticidade</Th><Th>Status</Th><Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((e) => (
            <tr key={e.id} className="border-b hover:bg-gray-50" style={{ borderColor: "var(--border)" }}>
              <Td mono>{e.codigo}</Td>
              <Td bold>{e.nome}</Td>
              <Td muted>{e.descricao}</Td>
              <Td><CriticidadeBadge c={e.criticidade} /></Td>
              <Td><StatusBadge s={e.status} /></Td>
              <Td className="text-right">
                <RowActions
                  onEdit={() => { setEditing(e); setShowForm(true); }}
                  onDelete={() => setEventos(eventos.filter((x) => x.id !== e.id))}
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <EventoForm
          initial={editing}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSave={salvar}
        />
      )}
    </Section>
  );
}

function EventoForm({ initial, onCancel, onSave }: { initial: Evento | null; onCancel: () => void; onSave: (e: Evento) => void }) {
  const [codigo, setCodigo] = useState(initial?.codigo ?? "");
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [criticidade, setCriticidade] = useState<Criticidade>(initial?.criticidade ?? "Média");
  const [status, setStatus] = useState<Status>(initial?.status ?? "Ativo");

  return (
    <Modal title={initial ? "Editar evento" : "Novo evento"} onClose={onCancel}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Código do evento"><Input value={codigo} onChange={setCodigo} placeholder="EVT-001" /></Field>
        <Field label="Nome do evento"><Input value={nome} onChange={setNome} placeholder="Ex.: Projeto atrasado" /></Field>
        <Field label="Descrição" full>
          <textarea
            value={descricao}
            onChange={(ev) => setDescricao(ev.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          />
        </Field>
        <Field label="Criticidade">
          <Select value={criticidade} onChange={(v) => setCriticidade(v as Criticidade)} options={["Baixa", "Média", "Alta", "Crítica"]} />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(v) => setStatus(v as Status)} options={["Ativo", "Inativo"]} />
        </Field>
      </div>
      <FormFooter
        onCancel={onCancel}
        onSave={() => onSave({ id: initial?.id ?? 0, codigo, nome, descricao, criticidade, status })}
      />
    </Modal>
  );
}

/* ───────────────────────── Destinatários ───────────────────────── */

function DestinatariosTab({ destinatarios, setDestinatarios }: { destinatarios: Destinatario[]; setDestinatarios: (d: Destinatario[]) => void }) {
  const [busca, setBusca] = useState("");
  const [editing, setEditing] = useState<Destinatario | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtrados = destinatarios.filter((d) => `${d.nome} ${d.endereco}`.toLowerCase().includes(busca.toLowerCase()));

  function salvar(d: Destinatario) {
    if (destinatarios.some((x) => x.id === d.id)) {
      setDestinatarios(destinatarios.map((x) => (x.id === d.id ? d : x)));
    } else {
      setDestinatarios([...destinatarios, { ...d, id: Math.max(0, ...destinatarios.map((e) => e.id)) + 1 }]);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <Section
      title="Cadastro de Destinatários"
      icon={<Users size={15} />}
      action={
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium"
          style={{ background: "#1a56db" }}
        >
          <Plus size={14} /> Novo destinatário
        </button>
      }
    >
      <Toolbar busca={busca} setBusca={setBusca} placeholder="Buscar por nome ou endereço..." />
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
            <Th>Nome</Th><Th>Tipo</Th><Th>Endereço</Th><Th>Status</Th><Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((d) => (
            <tr key={d.id} className="border-b hover:bg-gray-50" style={{ borderColor: "var(--border)" }}>
              <Td bold>{d.nome}</Td>
              <Td><CanalBadge canal={d.tipo} /></Td>
              <Td mono className="truncate max-w-[360px]">{d.endereco}</Td>
              <Td><StatusBadge s={d.status} /></Td>
              <Td className="text-right">
                <RowActions
                  onEdit={() => { setEditing(d); setShowForm(true); }}
                  onDelete={() => setDestinatarios(destinatarios.filter((x) => x.id !== d.id))}
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <DestinatarioForm
          initial={editing}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSave={salvar}
        />
      )}
    </Section>
  );
}

type AlvoTipo = "Pessoa específica" | "Equipe" | "Todos";

const PESSOAS_MOCK = [
  "Ana Souza (ana.souza@empresa.com.br)",
  "Bruno Lima (bruno.lima@empresa.com.br)",
  "Carla Mendes (carla.mendes@empresa.com.br)",
  "Dirceu Almeida (dirceu.almeida@empresa.com.br)",
  "Eduardo Pires (eduardo.pires@empresa.com.br)",
  "Fernanda Rocha (fernanda.rocha@empresa.com.br)",
];

const EQUIPES_MOCK = [
  "Presidência",
  "Diretoria de Operações",
  "PMO",
  "Soluções Integradas",
  "Suporte N1",
  "Suporte N2",
  "Comercial",
];

function inferAlvo(d: Destinatario | null): { alvo: AlvoTipo; pessoa: string; equipe: string } {
  if (!d) return { alvo: "Pessoa específica", pessoa: PESSOAS_MOCK[0], equipe: EQUIPES_MOCK[0] };
  if (d.endereco === "TODOS") return { alvo: "Todos", pessoa: PESSOAS_MOCK[0], equipe: EQUIPES_MOCK[0] };
  if (EQUIPES_MOCK.includes(d.endereco)) return { alvo: "Equipe", pessoa: PESSOAS_MOCK[0], equipe: d.endereco };
  if (PESSOAS_MOCK.includes(d.endereco)) return { alvo: "Pessoa específica", pessoa: d.endereco, equipe: EQUIPES_MOCK[0] };
  return { alvo: "Pessoa específica", pessoa: PESSOAS_MOCK[0], equipe: EQUIPES_MOCK[0] };
}

function DestinatarioForm({ initial, onCancel, onSave }: { initial: Destinatario | null; onCancel: () => void; onSave: (d: Destinatario) => void }) {
  const seed = inferAlvo(initial);
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [tipo, setTipo] = useState<CanalTipo>(initial?.tipo ?? "E-mail");
  const [status, setStatus] = useState<Status>(initial?.status ?? "Ativo");
  const [alvo, setAlvo] = useState<AlvoTipo>(seed.alvo);
  const [pessoa, setPessoa] = useState(seed.pessoa);
  const [equipe, setEquipe] = useState(seed.equipe);

  const endereco = alvo === "Todos" ? "TODOS" : alvo === "Equipe" ? equipe : pessoa;

  return (
    <Modal title={initial ? "Editar destinatário" : "Novo destinatário"} onClose={onCancel}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome"><Input value={nome} onChange={setNome} placeholder="Ex.: Equipe PMO" /></Field>
        <Field label="Tipo">
          <Select value={tipo} onChange={(v) => setTipo(v as CanalTipo)} options={["E-mail", "Teams"]} />
        </Field>
        <Field label="Destinatário é" full>
          <Select value={alvo} onChange={(v) => setAlvo(v as AlvoTipo)} options={["Pessoa específica", "Equipe", "Todos"]} />
        </Field>
        {alvo === "Pessoa específica" && (
          <Field label="Pessoa" full>
            <Select value={pessoa} onChange={setPessoa} options={PESSOAS_MOCK} />
          </Field>
        )}
        {alvo === "Equipe" && (
          <Field label="Equipe / Organização" full>
            <Select value={equipe} onChange={setEquipe} options={EQUIPES_MOCK} />
          </Field>
        )}
        {alvo === "Todos" && (
          <Field label="Alcance" full>
            <div
              className="px-3 py-2 rounded-md text-sm"
              style={{ background: "#f3f4f6", border: "1px solid var(--border)", color: "#374151" }}
            >
              Todos os usuários cadastrados receberão a notificação.
            </div>
          </Field>
        )}
        <Field label="Status">
          <Select value={status} onChange={(v) => setStatus(v as Status)} options={["Ativo", "Inativo"]} />
        </Field>
      </div>
      <FormFooter
        onCancel={onCancel}
        onSave={() => onSave({ id: initial?.id ?? 0, nome, tipo, endereco, status })}
      />
    </Modal>
  );
}

/* ───────────────────────── Regras ───────────────────────── */

function RegrasTab({ regras, setRegras, eventos, destinatarios }: {
  regras: Regra[]; setRegras: (r: Regra[]) => void; eventos: Evento[]; destinatarios: Destinatario[];
}) {
  const [editing, setEditing] = useState<Regra | null>(null);
  const [showForm, setShowForm] = useState(false);

  function salvar(r: Regra) {
    if (regras.some((x) => x.id === r.id)) {
      setRegras(regras.map((x) => (x.id === r.id ? r : x)));
    } else {
      setRegras([...regras, { ...r, id: Math.max(0, ...regras.map((e) => e.id)) + 1 }]);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <Section
      title="Regras de Notificação"
      icon={<Link2 size={15} />}
      action={
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium"
          style={{ background: "#1a56db" }}
        >
          <Plus size={14} /> Nova regra
        </button>
      }
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
            <Th>Evento</Th><Th>Destinatário</Th><Th>Canal</Th><Th>Prioridade</Th><Th>Janela de envio</Th><Th>Ativo</Th><Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody>
          {regras.map((r) => {
            const e = eventos.find((x) => x.id === r.eventoId);
            const d = destinatarios.find((x) => x.id === r.destinatarioId);
            return (
              <tr key={r.id} className="border-b hover:bg-gray-50" style={{ borderColor: "var(--border)" }}>
                <Td bold>{e?.nome ?? "—"}</Td>
                <Td>{d?.nome ?? "—"}</Td>
                <Td>{d && <CanalBadge canal={d.tipo} />}</Td>
                <Td><span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold" style={{ background: "#eff6ff", color: "#1a56db" }}>{r.prioridade}</span></Td>
                <Td mono>{r.horaInicio} – {r.horaFim}</Td>
                <Td><StatusBadge s={r.ativo ? "Ativo" : "Inativo"} /></Td>
                <Td className="text-right">
                  <RowActions
                    onEdit={() => { setEditing(r); setShowForm(true); }}
                    onDelete={() => setRegras(regras.filter((x) => x.id !== r.id))}
                  />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showForm && (
        <RegraForm
          initial={editing}
          eventos={eventos}
          destinatarios={destinatarios}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSave={salvar}
        />
      )}
    </Section>
  );
}

function RegraForm({ initial, eventos, destinatarios, onCancel, onSave }: {
  initial: Regra | null; eventos: Evento[]; destinatarios: Destinatario[];
  onCancel: () => void; onSave: (r: Regra) => void;
}) {
  const [eventoId, setEventoId] = useState(initial?.eventoId ?? eventos[0]?.id ?? 0);
  const [destinatarioId, setDestinatarioId] = useState(initial?.destinatarioId ?? destinatarios[0]?.id ?? 0);
  const [ativo, setAtivo] = useState(initial?.ativo ?? true);
  const [prioridade, setPrioridade] = useState(initial?.prioridade ?? 1);
  const [horaInicio, setHoraInicio] = useState(initial?.horaInicio ?? "08:00");
  const [horaFim, setHoraFim] = useState(initial?.horaFim ?? "18:00");

  return (
    <Modal title={initial ? "Editar regra" : "Nova regra"} onClose={onCancel}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Evento" full>
          <select
            value={eventoId}
            onChange={(e) => setEventoId(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            {eventos.map((e) => <option key={e.id} value={e.id}>{e.codigo} — {e.nome}</option>)}
          </select>
        </Field>
        <Field label="Destinatário" full>
          <select
            value={destinatarioId}
            onChange={(e) => setDestinatarioId(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-md border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            {destinatarios.map((d) => <option key={d.id} value={d.id}>{d.nome} ({d.tipo})</option>)}
          </select>
        </Field>
        <Field label="Prioridade">
          <Input value={String(prioridade)} onChange={(v) => setPrioridade(Number(v) || 1)} type="number" />
        </Field>
        <Field label="Status">
          <Select value={ativo ? "Ativo" : "Inativo"} onChange={(v) => setAtivo(v === "Ativo")} options={["Ativo", "Inativo"]} />
        </Field>
        <Field label="Horário inicial permitido">
          <Input value={horaInicio} onChange={setHoraInicio} type="time" />
        </Field>
        <Field label="Horário final permitido">
          <Input value={horaFim} onChange={setHoraFim} type="time" />
        </Field>
      </div>
      <FormFooter
        onCancel={onCancel}
        onSave={() => onSave({ id: initial?.id ?? 0, eventoId, destinatarioId, ativo, prioridade, horaInicio, horaFim })}
      />
    </Modal>
  );
}

/* ───────────────────────── Histórico ───────────────────────── */

function HistoricoTab({ historico, eventos, destinatarios }: {
  historico: Historico[]; eventos: Evento[]; destinatarios: Destinatario[];
}) {
  const [filtroEvento, setFiltroEvento] = useState<string>("Todos");
  const [filtroCanal, setFiltroCanal] = useState<string>("Todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [periodoIni, setPeriodoIni] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  const filtrados = historico.filter((h) => {
    if (filtroEvento !== "Todos" && String(h.eventoId) !== filtroEvento) return false;
    if (filtroCanal !== "Todos" && h.canal !== filtroCanal) return false;
    if (filtroStatus !== "Todos" && h.status !== filtroStatus) return false;
    if (periodoIni && h.dataHora.slice(0, 10) < periodoIni) return false;
    if (periodoFim && h.dataHora.slice(0, 10) > periodoFim) return false;
    return true;
  });

  return (
    <Section title="Histórico de Envios" icon={<History size={15} />}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-3 rounded-md border" style={{ background: "#f9fafb", borderColor: "var(--border)" }}>
        <Field label="Período de"><Input value={periodoIni} onChange={setPeriodoIni} type="date" /></Field>
        <Field label="Período até"><Input value={periodoFim} onChange={setPeriodoFim} type="date" /></Field>
        <Field label="Evento">
          <select className="w-full px-2 py-2 text-sm rounded-md border outline-none" style={{ borderColor: "var(--border)", background: "var(--card)" }}
            value={filtroEvento} onChange={(e) => setFiltroEvento(e.target.value)}>
            <option value="Todos">Todos</option>
            {eventos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </Field>
        <Field label="Canal">
          <Select value={filtroCanal} onChange={setFiltroCanal} options={["Todos", "E-mail", "Teams"]} />
        </Field>
        <Field label="Status">
          <Select value={filtroStatus} onChange={setFiltroStatus} options={["Todos", "Sucesso", "Falha"]} />
        </Field>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
            <Th>Data/Hora</Th><Th>Evento</Th><Th>Destinatário</Th><Th>Canal</Th><Th>Status</Th><Th>Mensagem</Th><Th>Retorno API</Th><Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((h) => {
            const e = eventos.find((x) => x.id === h.eventoId);
            const d = destinatarios.find((x) => x.id === h.destinatarioId);
            return (
              <tr key={h.id} className="border-b hover:bg-gray-50" style={{ borderColor: "var(--border)" }}>
                <Td mono>{h.dataHora}</Td>
                <Td>{e?.nome ?? "—"}</Td>
                <Td>{d?.nome ?? "—"}</Td>
                <Td><CanalBadge canal={h.canal} /></Td>
                <Td><StatusEnvioBadge status={h.status} /></Td>
                <Td muted className="max-w-[260px] truncate">{h.mensagem}</Td>
                <Td mono className="max-w-[220px] truncate">{h.retornoApi}</Td>
                <Td className="text-right">
                  {h.status === "Falha" && (
                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border" style={{ borderColor: "var(--border)", color: "#1a56db" }}>
                      <RefreshCw size={12} /> Reprocessar
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Pagination total={filtrados.length} />
    </Section>
  );
}

/* ───────────────────────── UI primitives ───────────────────────── */

function Section({ title, icon, action, children }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2" style={{ color: "var(--foreground)", fontWeight: 600, fontSize: 14 }}>
          {icon}
          {title}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Toolbar({ busca, setBusca, placeholder }: { busca: string; setBusca: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border outline-none"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        />
      </div>
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
        <Filter size={13} /> Filtros
      </button>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide ${className}`} style={{ color: "var(--muted-foreground)" }}>{children}</th>;
}
function Td({ children, mono, bold, muted, className = "" }: { children: React.ReactNode; mono?: boolean; bold?: boolean; muted?: boolean; className?: string }) {
  return (
    <td className={`px-3 py-2.5 ${className}`} style={{
      fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : undefined,
      fontWeight: bold ? 600 : undefined,
      color: muted ? "var(--muted-foreground)" : "var(--foreground)",
      fontSize: mono ? 12.5 : 13,
    }}>{children}</td>
  );
}

function CriticidadeBadge({ c }: { c: Criticidade }) {
  const s = CRIT_COLORS[c];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{ background: s.bg, color: s.fg, borderColor: s.bd }}>
      {c === "Crítica" && <AlertTriangle size={10} />} {c}
    </span>
  );
}
function StatusBadge({ s }: { s: Status }) {
  const ok = s === "Ativo";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: ok ? "#ecfdf5" : "#f3f4f6", color: ok ? "#047857" : "#6b7280" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? "#10b981" : "#9ca3af" }} />
      {s}
    </span>
  );
}
function StatusEnvioBadge({ status }: { status: EnvioStatus }) {
  const ok = status === "Sucesso";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: ok ? "#ecfdf5" : "#fef2f2", color: ok ? "#047857" : "#b91c1c" }}>
      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {status}
    </span>
  );
}
function CanalBadge({ canal }: { canal: CanalTipo }) {
  const isTeams = canal === "Teams";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: isTeams ? "#eef2ff" : "#eff6ff", color: isTeams ? "#4338ca" : "#1a56db" }}>
      {isTeams ? <MessageSquare size={11} /> : <Mail size={11} />} {canal}
    </span>
  );
}
function Badge({ children, tone }: { children: React.ReactNode; tone: "ok" | "info" }) {
  const styles = tone === "ok"
    ? { bg: "#ecfdf5", fg: "#047857" }
    : { bg: "#eef2ff", fg: "#4338ca" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: styles.bg, color: styles.fg }}>{children}</span>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="inline-flex gap-1">
      <button onClick={onEdit} className="p-1.5 rounded hover:bg-gray-100" title="Editar">
        <Pencil size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50" title="Excluir">
        <Trash2 size={14} style={{ color: "#dc2626" }} />
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
      <div className="w-full max-w-2xl rounded-lg border shadow-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block mb-1.5" style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm rounded-md border outline-none"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    />
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-md border outline-none"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function FormFooter({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex justify-end gap-2 mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
      <button onClick={onCancel} className="px-3 py-1.5 rounded-md text-sm border" style={{ borderColor: "var(--border)" }}>Cancelar</button>
      <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium" style={{ background: "#1a56db" }}>
        <Save size={13} /> Salvar
      </button>
    </div>
  );
}
function Pagination({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
      <span>{total} registros</span>
      <div className="flex gap-1">
        <button className="px-2 py-1 rounded border" style={{ borderColor: "var(--border)" }}>Anterior</button>
        <button className="px-2 py-1 rounded border text-white" style={{ borderColor: "#1a56db", background: "#1a56db" }}>1</button>
        <button className="px-2 py-1 rounded border" style={{ borderColor: "var(--border)" }}>2</button>
        <button className="px-2 py-1 rounded border" style={{ borderColor: "var(--border)" }}>Próximo</button>
      </div>
    </div>
  );
}
