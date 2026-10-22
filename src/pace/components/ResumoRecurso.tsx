import { useMemo, useState } from "react";
import { Search, Filter, RotateCcw, ChevronDown, X, Calendar, ArrowLeft, ArrowUpDown } from "lucide-react";

type Categoria = "Iniciativa" | "Melhoria" | "Organização Interna" | "Projeto" | "Sustentação";

type LinhaResumo = {
  idServico: number;
  categoria: Categoria;
  nomeServico: string;
  atuacao: string;
  horasDistribuidas: number;
  horasConsumidas: number;
  horasSaldo: number;
  valorMedioHora: number;
  valorTotal: number;
};

type LinhaTempo = {
  data: string; // dd/mm/aaaa
  tarefa: number;
  horasConsumidas: number;
  valorHora: number;
  valor: number;
};

const RECURSOS = [
  "PAULA DENISE CARLOS",
  "DIRCEU OLIVEIRA",
  "MARCOS SILVA",
  "ANA BEATRIZ SOUZA",
];

const MOCK_RESUMO: LinhaResumo[] = [
  { idServico: 101, categoria: "Melhoria", nomeServico: "SOIM - Melhoria", atuacao: "Análise", horasDistribuidas: 40, horasConsumidas: 32.5, horasSaldo: 7.5, valorMedioHora: 55, valorTotal: 1787.5 },
  { idServico: 102, categoria: "Iniciativa", nomeServico: "SOII - Iniciativa", atuacao: "Validação de Software", horasDistribuidas: 20, horasConsumidas: 22.4, horasSaldo: -2.4, valorMedioHora: 55, valorTotal: 1232 },
  { idServico: 208, categoria: "Organização Interna", nomeServico: "OI - Reuniões e Cerimônias Ágeis Semanais", atuacao: "Organização Interna", horasDistribuidas: 15, horasConsumidas: 40.23, horasSaldo: -25.23, valorMedioHora: 55, valorTotal: 2212.65 },
  { idServico: 305, categoria: "Projeto", nomeServico: "ADM306 - BR Orçamento", atuacao: "Análise", horasDistribuidas: 60, horasConsumidas: 45.15, horasSaldo: 14.85, valorMedioHora: 55, valorTotal: 2483.25 },
  { idServico: 410, categoria: "Sustentação", nomeServico: "SUS - Sustentação Aplicações Corporativas", atuacao: "Sustentação", horasDistribuidas: 25, horasConsumidas: 18.7, horasSaldo: 6.3, valorMedioHora: 55, valorTotal: 1028.5 },
  { idServico: 411, categoria: "Melhoria", nomeServico: "SOIM - Melhoria Módulo Financeiro Extendido", atuacao: "Análise", horasDistribuidas: 30, horasConsumidas: 27.9, horasSaldo: 2.1, valorMedioHora: 55, valorTotal: 1534.5 },
  { idServico: 512, categoria: "Iniciativa", nomeServico: "SOII - Iniciativa Dashboards", atuacao: "Validação de Software", horasDistribuidas: 12, horasConsumidas: 9.85, horasSaldo: 2.15, valorMedioHora: 55, valorTotal: 541.75 },
];

const MOCK_TEMPOS: LinhaTempo[] = [
  { data: "01/07/2026", tarefa: 5145, horasConsumidas: 2.5, valorHora: 55, valor: 137.5 },
  { data: "03/07/2026", tarefa: 5186, horasConsumidas: 7.62, valorHora: 55, valor: 419.1 },
  { data: "07/07/2026", tarefa: 5239, horasConsumidas: 0.55, valorHora: 55, valor: 30.25 },
  { data: "10/07/2026", tarefa: 5240, horasConsumidas: 4.15, valorHora: 55, valor: 228.25 },
  { data: "12/07/2026", tarefa: 5280, horasConsumidas: 6.3, valorHora: 55, valor: 346.5 },
  { data: "14/07/2026", tarefa: 5145, horasConsumidas: 3.75, valorHora: 55, valor: 206.25 },
  { data: "16/07/2026", tarefa: 5239, horasConsumidas: 1.9, valorHora: 55, valor: 104.5 },
];

const fmtNum = (n: number, dec = 2) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type SortKey = "categoria" | "nomeServico" | "atuacao" | "data";
type SortConfig = { key: SortKey; direction: "asc" | "desc"; priority: number };

export default function ResumoRecurso() {
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [recurso, setRecurso] = useState(RECURSOS[0]);
  const [mesAno, setMesAno] = useState("07/2026");
  const [aplicado, setAplicado] = useState({ recurso: RECURSOS[0], mesAno: "07/2026" });
  const [selectedResumo, setSelectedResumo] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sorts, setSorts] = useState<SortConfig[]>([
    { key: "categoria", direction: "asc", priority: 1 },
    { key: "nomeServico", direction: "asc", priority: 2 },
    { key: "atuacao", direction: "asc", priority: 3 },
  ]);
  const [sortTempo, setSortTempo] = useState<"asc" | "desc">("asc");

  const resumo = useMemo(() => {
    let rows = MOCK_RESUMO.filter((r) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        r.categoria.toLowerCase().includes(s) ||
        r.nomeServico.toLowerCase().includes(s) ||
        r.atuacao.toLowerCase().includes(s)
      );
    });
    const ordered = [...sorts].sort((a, b) => a.priority - b.priority);
    rows = [...rows].sort((a, b) => {
      for (const s of ordered) {
        const va = String(a[s.key as keyof LinhaResumo]);
        const vb = String(b[s.key as keyof LinhaResumo]);
        const cmp = va.localeCompare(vb, "pt-BR");
        if (cmp !== 0) return s.direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return rows;
  }, [search, sorts, aplicado]);

  const tempos = useMemo(() => {
    const rows = [...MOCK_TEMPOS];
    rows.sort((a, b) => {
      const [da, ma, ya] = a.data.split("/").map(Number);
      const [db, mb, yb] = b.data.split("/").map(Number);
      const ta = new Date(ya, ma - 1, da).getTime();
      const tb = new Date(yb, mb - 1, db).getTime();
      return sortTempo === "asc" ? ta - tb : tb - ta;
    });
    return rows;
  }, [sortTempo, aplicado]);

  const toggleSort = (key: SortKey) => {
    setSorts((prev) => {
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

  const sortIndicator = (key: SortKey) => {
    const s = sorts.find((x) => x.key === key);
    if (!s) return null;
    return (
      <span className="ml-1 inline-flex items-center gap-0.5 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
        <ArrowUpDown size={10} />
        <span
          className="rounded px-1"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontWeight: 600 }}
        >
          {s.priority}
        </span>
      </span>
    );
  };

  const totalResumo = resumo.length;
  const totalTempos = tempos.length;

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb + Filtros */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--muted-foreground)" }}>Home</span>
          <span style={{ color: "var(--muted-foreground)" }}>/</span>
          <span style={{ color: "#dc2626", fontWeight: 700 }}>Resumo por Recurso</span>
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

      {/* Card Resumo por Recurso */}
      <section className="rounded-xl border bg-card shadow-sm">
        <header className="border-b px-5 py-3">
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            Resumo por Recurso
          </h2>
          <div className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Recurso: <strong>{aplicado.recurso}</strong> · Mês/Ano: <strong>{aplicado.mesAno}</strong>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
          <div className="flex items-center gap-0 rounded-md border bg-background">
            <div className="flex items-center gap-2 border-r px-2 py-1.5">
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 bg-transparent text-sm outline-none"
                placeholder=""
              />
            </div>
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              Pesquisa: Todas as Colunas de Texto
              <ChevronDown size={12} />
            </button>
          </div>
          <button className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">
            Ir
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">
            Ações <ChevronDown size={12} />
          </button>
          <div className="ml-auto">
            <button
              onClick={() => {
                setSearch("");
                setSorts([
                  { key: "categoria", direction: "asc", priority: 1 },
                  { key: "nomeServico", direction: "asc", priority: 2 },
                  { key: "atuacao", direction: "asc", priority: 3 },
                ]);
                setSelectedResumo(null);
              }}
              className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              <RotateCcw size={14} /> Redefinir
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
              <tr className="border-b text-left" style={{ color: "var(--muted-foreground)" }}>
                <th className="px-3 py-2 text-right font-medium">ID Serviço</th>
                <th className="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("categoria")}>
                  <span className="inline-flex items-center">Categoria {sortIndicator("categoria")}</span>
                </th>
                <th className="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("nomeServico")}>
                  <span className="inline-flex items-center">Nome Serviço {sortIndicator("nomeServico")}</span>
                </th>
                <th className="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("atuacao")}>
                  <span className="inline-flex items-center">Atuação {sortIndicator("atuacao")}</span>
                </th>
                <th className="px-3 py-2 text-right font-medium">Horas Distribuídas</th>
                <th className="px-3 py-2 text-right font-medium">Horas Consumidas</th>
                <th className="px-3 py-2 text-right font-medium">Horas Saldo</th>
                <th className="px-3 py-2 text-right font-medium">Valor Médio Hora</th>
                <th className="px-3 py-2 text-right font-medium">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {resumo.map((r) => {
                const selected = selectedResumo === r.idServico;
                return (
                  <tr
                    key={r.idServico}
                    onClick={() => setSelectedResumo(selected ? null : r.idServico)}
                    className="cursor-pointer border-b transition-colors"
                    style={{ background: selected ? "#fdecec" : undefined }}
                  >
                    <td className="px-3 py-2 text-right tabular-nums">{r.idServico}</td>
                    <td className="px-3 py-2">{r.categoria}</td>
                    <td className="max-w-[280px] truncate px-3 py-2" title={r.nomeServico}>
                      {r.nomeServico}
                    </td>
                    <td className="px-3 py-2">{r.atuacao}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtNum(r.horasDistribuidas)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtNum(r.horasConsumidas)}</td>
                    <td
                      className="px-3 py-2 text-right tabular-nums"
                      style={{ color: r.horasSaldo < 0 ? "#dc2626" : undefined, fontWeight: r.horasSaldo < 0 ? 600 : undefined }}
                    >
                      {fmtNum(r.horasSaldo)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtBRL(r.valorMedioHora)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtBRL(r.valorTotal)}</td>
                  </tr>
                );
              })}
              {resumo.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center" style={{ color: "var(--muted-foreground)" }}>
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t px-5 py-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{selectedResumo !== null ? "1 linhas selecionadas" : "0 linhas selecionadas"}</span>
          <span>Total {totalResumo}</span>
        </footer>
      </section>

      {/* Card Tempos Reportados */}
      <section className="rounded-xl border bg-card shadow-sm">
        <header className="border-b px-5 py-3">
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            Tempos Reportados
          </h2>
        </header>

        <div className="max-h-[340px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
              <tr className="border-b text-left" style={{ color: "var(--muted-foreground)" }}>
                <th
                  className="cursor-pointer px-3 py-2 font-medium"
                  onClick={() => setSortTempo((s) => (s === "asc" ? "desc" : "asc"))}
                >
                  <span className="inline-flex items-center gap-1">
                    Reporte Data <ArrowUpDown size={10} />
                  </span>
                </th>
                <th className="px-3 py-2 font-medium">Tarefa</th>
                <th className="px-3 py-2 text-right font-medium">Horas Consumidas</th>
                <th className="px-3 py-2 text-right font-medium">Valor/Hora</th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {tempos.map((t, i) => (
                <tr key={i} className="border-b hover:bg-muted/40">
                  <td className="px-3 py-2 tabular-nums">{t.data}</td>
                  <td className="px-3 py-2">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="underline"
                      style={{ color: "#dc2626", fontWeight: 500 }}
                    >
                      {t.tarefa}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtNum(t.horasConsumidas)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtBRL(t.valorHora)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtBRL(t.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-end border-t px-5 py-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>Total {totalTempos}</span>
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
                <span className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Recurso</span>
                <div className="relative">
                  <select
                    value={recurso}
                    onChange={(e) => setRecurso(e.target.value)}
                    className="w-full appearance-none rounded-md border bg-muted/50 px-3 py-2 pr-8 text-sm outline-none"
                  >
                    {RECURSOS.map((r) => (
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
                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <button
                onClick={() => {
                  setAplicado({ recurso, mesAno });
                  setFiltrosOpen(false);
                }}
                className="rounded-md px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:opacity-90"
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
