import { useMemo, useState } from "react";
import { Filter, X, ChevronDown, ArrowLeft, ArrowUpDown, Calendar } from "lucide-react";

type Categoria = "Iniciativa" | "Melhoria" | "Organização Interna" | "Projeto";

type Recurso = {
  nome: string;
  equipe: string;
  horasDistribuidas: number;
  horasConsumidas: number;
};

type Servico = {
  id: number;
  categoria: Categoria;
  nomeServico: string;
  atuacao: string;
  horasAutorizadas: number;
  horasDistribuidas: number;
  horasConsumidas: number;
  horasSolicitadas: number;
};

const EQUIPES = ["Soluções Integradas", "Inovação", "Sustentação"];

const MOCK_RECURSOS: Recurso[] = [
  { nome: "Dirceu Roden", equipe: "Soluções Integradas", horasDistribuidas: 202, horasConsumidas: 158.0 },
  { nome: "Natália Nicodem", equipe: "Soluções Integradas", horasDistribuidas: 180, horasConsumidas: 142.35 },
  { nome: "Paloma Delgado", equipe: "Soluções Integradas", horasDistribuidas: 160, horasConsumidas: 118.9 },
  { nome: "Paula Denise Carlos", equipe: "Soluções Integradas", horasDistribuidas: 120, horasConsumidas: 95.5 },
  { nome: "Thiago Rafael Heilmann", equipe: "Soluções Integradas", horasDistribuidas: 90, horasConsumidas: 71.07 },
];

const MOCK_SERVICOS: Servico[] = [
  { id: 501, categoria: "Iniciativa", nomeServico: "SOII - Iniciativa", atuacao: "Análise", horasAutorizadas: 40, horasDistribuidas: 40, horasConsumidas: 32.5, horasSolicitadas: 0 },
  { id: 502, categoria: "Iniciativa", nomeServico: "SOII - Iniciativa", atuacao: "Desenvolvimento", horasAutorizadas: 60, horasDistribuidas: 55, horasConsumidas: 48.15, horasSolicitadas: 5 },
  { id: 503, categoria: "Melhoria", nomeServico: "SOIM - Melhoria", atuacao: "Análise", horasAutorizadas: 30, horasDistribuidas: 30, horasConsumidas: 27.9, horasSolicitadas: 0 },
  { id: 504, categoria: "Melhoria", nomeServico: "SOIM - Melhoria", atuacao: "Desenvolvimento", horasAutorizadas: 50, horasDistribuidas: 48, horasConsumidas: 39.7, horasSolicitadas: 2 },
  { id: 505, categoria: "Organização Interna", nomeServico: "OI - Reuniões e Cerimônias Ágeis", atuacao: "Organização Interna", horasAutorizadas: 20, horasDistribuidas: 20, horasConsumidas: 22.4, horasSolicitadas: 0 },
  { id: 506, categoria: "Organização Interna", nomeServico: "OI - Planejamento Semanal", atuacao: "Organização Interna", horasAutorizadas: 10, horasDistribuidas: 10, horasConsumidas: 8.5, horasSolicitadas: 0 },
  { id: 507, categoria: "Projeto", nomeServico: "ADM291 - Site dos Currículos", atuacao: "Análise", horasAutorizadas: 45, horasDistribuidas: 42, horasConsumidas: 30.15, horasSolicitadas: 0 },
  { id: 508, categoria: "Projeto", nomeServico: "ADM291 - Site dos Currículos", atuacao: "Desenvolvimento", horasAutorizadas: 80, horasDistribuidas: 76, horasConsumidas: 58.4, horasSolicitadas: 4 },
  { id: 509, categoria: "Projeto", nomeServico: "ADM306 - BR Orçamento", atuacao: "Análise", horasAutorizadas: 35, horasDistribuidas: 35, horasConsumidas: 27.6, horasSolicitadas: 0 },
  { id: 510, categoria: "Projeto", nomeServico: "ADM306 - BR Orçamento", atuacao: "Desenvolvimento", horasAutorizadas: 70, horasDistribuidas: 65, horasConsumidas: 51.85, horasSolicitadas: 5 },
  { id: 511, categoria: "Melhoria", nomeServico: "SOIM - Módulo Financeiro", atuacao: "Desenvolvimento", horasAutorizadas: 25, horasDistribuidas: 25, horasConsumidas: 0, horasSolicitadas: 0 },
];

const fmtNum = (n: number, dec = 2) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

type SortKeyServico = "categoria" | "nomeServico" | "atuacao";
type SortConfig<K extends string> = { key: K; direction: "asc" | "desc"; priority: number };

export default function ResumoEquipe() {
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [equipe, setEquipe] = useState(EQUIPES[0]);
  const [mesAno, setMesAno] = useState("07/2026");
  const [aplicado, setAplicado] = useState({ equipe: EQUIPES[0], mesAno: "07/2026" });
  const [selectedRecurso, setSelectedRecurso] = useState<string | null>(null);

  const [sortRecurso, setSortRecurso] = useState<"asc" | "desc">("asc");
  const [sortsServico, setSortsServico] = useState<SortConfig<SortKeyServico>[]>([
    { key: "categoria", direction: "asc", priority: 1 },
    { key: "nomeServico", direction: "asc", priority: 2 },
    { key: "atuacao", direction: "asc", priority: 3 },
  ]);

  const recursos = useMemo(() => {
    const rows = MOCK_RECURSOS.filter((r) => r.equipe === aplicado.equipe);
    return [...rows].sort((a, b) =>
      sortRecurso === "asc" ? a.nome.localeCompare(b.nome, "pt-BR") : b.nome.localeCompare(a.nome, "pt-BR"),
    );
  }, [sortRecurso, aplicado]);

  const servicos = useMemo(() => {
    const ordered = [...sortsServico].sort((a, b) => a.priority - b.priority);
    return [...MOCK_SERVICOS].sort((a, b) => {
      for (const s of ordered) {
        const va = String(a[s.key]);
        const vb = String(b[s.key]);
        const cmp = va.localeCompare(vb, "pt-BR");
        if (cmp !== 0) return s.direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }, [sortsServico, aplicado]);

  const totalDistribuido = recursos.reduce((s, r) => s + r.horasDistribuidas, 0);
  const totalConsumido = recursos.reduce((s, r) => s + r.horasConsumidas, 0);
  const pctConsumido = totalDistribuido > 0 ? (totalConsumido / totalDistribuido) * 100 : 0;

  const toggleSortServico = (key: SortKeyServico) => {
    setSortsServico((prev) => {
      const existing = prev.find((p) => p.key === key);
      if (existing) {
        return prev.map((p) =>
          p.key === key ? { ...p, direction: p.direction === "asc" ? "desc" : "asc" } : p,
        );
      }
      const maxP = prev.reduce((m, p) => Math.max(m, p.priority), 0);
      return [...prev, { key, direction: "asc", priority: maxP + 1 }];
    });
  };

  const sortIndicator = (priority: number | null) => {
    if (priority === null) return null;
    return (
      <span className="ml-1 inline-flex items-center gap-0.5 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
        <ArrowUpDown size={10} />
        <span
          className="rounded px-1"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontWeight: 600 }}
        >
          {priority}
        </span>
      </span>
    );
  };

  const servicoPriority = (key: SortKeyServico) =>
    sortsServico.find((s) => s.key === key)?.priority ?? null;

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb + Filtros */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--muted-foreground)" }}>Home</span>
          <span style={{ color: "var(--muted-foreground)" }}>/</span>
          <span style={{ color: "#dc2626", fontWeight: 700 }}>Resumo por Equipe</span>
        </nav>
        <button
          onClick={() => setFiltrosOpen(true)}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
          style={{ background: "#dc2626" }}
        >
          <Filter size={14} />
          Filtros
        </button>
      </div>

      {/* Barras de Progresso */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Total Distribuído
          </div>
          <div className="relative h-7 w-full overflow-hidden rounded-full" style={{ background: "#e5e7eb" }}>
            <div
              className="flex h-full items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ width: "100%", background: "#16a34a" }}
            >
              100%
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Total Consumido
          </div>
          <div className="relative h-7 w-full overflow-hidden rounded-full" style={{ background: "#fde2e4" }}>
            <div
              className="flex h-full items-center justify-center text-xs font-semibold text-white"
              style={{ width: `${pctConsumido}%`, background: "#2563eb" }}
            >
              {fmtNum(pctConsumido)}%
            </div>
          </div>
        </div>
      </div>

      {/* Card Recursos */}
      <section className="rounded-xl border bg-card shadow-sm">
        <header className="border-b px-5 py-3">
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            Recursos
          </h2>
          <div className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Equipe: <strong>{aplicado.equipe}</strong> · Mês/Ano: <strong>{aplicado.mesAno}</strong>
          </div>
        </header>

        <div className="max-h-[360px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
              <tr className="border-b text-left" style={{ color: "var(--muted-foreground)" }}>
                <th
                  className="cursor-pointer px-3 py-2 font-medium"
                  onClick={() => setSortRecurso((s) => (s === "asc" ? "desc" : "asc"))}
                >
                  <span className="inline-flex items-center">Recurso {sortIndicator(1)}</span>
                </th>
                <th className="px-3 py-2 font-medium">Equipe</th>
                <th className="px-3 py-2 text-right font-medium">Horas Distribuídas</th>
                <th className="px-3 py-2 text-right font-medium">Horas Consumidas</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((r) => {
                const selected = selectedRecurso === r.nome;
                return (
                  <tr
                    key={r.nome}
                    onClick={() => setSelectedRecurso(selected ? null : r.nome)}
                    className="cursor-pointer border-b transition-colors"
                    style={{ background: selected ? "#fdecec" : undefined }}
                  >
                    <td className="px-3 py-2">{r.nome}</td>
                    <td className="px-3 py-2">{r.equipe}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtNum(r.horasDistribuidas)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtNum(r.horasConsumidas)}</td>
                  </tr>
                );
              })}
              {recursos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center" style={{ color: "var(--muted-foreground)" }}>
                    Nenhum recurso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t px-5 py-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{selectedRecurso ? "1 linhas selecionadas" : "0 linhas selecionadas"}</span>
          <span>Total {recursos.length}</span>
        </footer>
      </section>

      {/* Card Serviços */}
      <section className="rounded-xl border bg-card shadow-sm">
        <header className="border-b px-5 py-3">
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            Serviços
          </h2>
        </header>

        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
              <tr className="border-b text-left" style={{ color: "var(--muted-foreground)" }}>
                <th className="px-3 py-2 text-right font-medium">ID</th>
                <th className="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSortServico("categoria")}>
                  <span className="inline-flex items-center">Categoria {sortIndicator(servicoPriority("categoria"))}</span>
                </th>
                <th className="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSortServico("nomeServico")}>
                  <span className="inline-flex items-center">Nome Serviço {sortIndicator(servicoPriority("nomeServico"))}</span>
                </th>
                <th className="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSortServico("atuacao")}>
                  <span className="inline-flex items-center">Atuação {sortIndicator(servicoPriority("atuacao"))}</span>
                </th>
                <th className="px-3 py-2 text-right font-medium">Horas Autorizadas</th>
                <th className="px-3 py-2 text-right font-medium">Horas Distribuídas</th>
                <th className="px-3 py-2 text-right font-medium">Horas Consumidas</th>
                <th className="px-3 py-2 text-right font-medium">Horas Solicitadas</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((s) => (
                <tr key={s.id} className="border-b hover:bg-muted/40">
                  <td className="px-3 py-2 text-right tabular-nums">{s.id}</td>
                  <td className="px-3 py-2">{s.categoria}</td>
                  <td className="max-w-[280px] truncate px-3 py-2" title={s.nomeServico}>{s.nomeServico}</td>
                  <td className="px-3 py-2">{s.atuacao}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtNum(s.horasAutorizadas)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtNum(s.horasDistribuidas)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtNum(s.horasConsumidas)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtNum(s.horasSolicitadas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-end border-t px-5 py-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>Total {servicos.length}</span>
        </footer>
      </section>

      {/* Modal Filtros */}
      {filtrosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setFiltrosOpen(false)}
          />
          <div className="relative w-[400px] max-w-[92vw] rounded-xl bg-card shadow-2xl">
            <header className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>Filtros</h3>
              <button
                onClick={() => setFiltrosOpen(false)}
                className="rounded p-1 hover:bg-accent"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </header>
            <div className="space-y-4 px-5 py-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Equipe</span>
                <div className="relative">
                  <select
                    value={equipe}
                    onChange={(e) => setEquipe(e.target.value)}
                    className="w-full appearance-none rounded-md border-2 bg-background px-3 py-2 pr-8 text-sm outline-none focus:border-primary"
                    style={{ borderColor: "var(--primary)" }}
                  >
                    {EQUIPES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Mês/Ano</span>
                <div className="relative">
                  <input
                    value={mesAno}
                    onChange={(e) => setMesAno(e.target.value)}
                    placeholder="MM/AAAA"
                    className="w-full rounded-md border bg-muted/50 px-3 py-2 pr-8 text-sm outline-none"
                  />
                  <Calendar size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                </div>
              </label>
            </div>
            <footer className="flex items-center justify-between border-t px-5 py-3">
              <button
                onClick={() => setFiltrosOpen(false)}
                className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <ArrowLeft size={14} />
                Voltar
              </button>
              <button
                onClick={() => {
                  setAplicado({ equipe, mesAno });
                  setFiltrosOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                style={{ background: "#dc2626" }}
              >
                Consultar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
