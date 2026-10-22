import { useMemo, useState } from "react";
import {
  Search, ChevronDown, Calendar, ArrowLeft, Clock, Star,
} from "lucide-react";

interface Linha {
  recurso: string;
  servico: string;
  atuacao: string;
  realMesAnt: number;
  horasDistribuidas: number;
  horasConsumidas: number;
  horasDistConsumo: number;
  adicionalSolicitado: number;
  horasExternas: number;
  distribuidoAtual: number;
  distribuidoTotal: number;
  consumidoPct: number;
  pendente?: boolean;
}

const LINHAS: Linha[] = [
  { recurso: "Dirceu", servico: "BR Serviços TI", atuacao: "Análise", realMesAnt: 0, horasDistribuidas: 0, horasConsumidas: 0, horasDistConsumo: 0, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 0 },
  { recurso: "Dirceu", servico: "BR Serviços TI", atuacao: "Desenvolvimento", realMesAnt: 103.27, horasDistribuidas: 80, horasConsumidas: 58.28, horasDistConsumo: 21.72, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 72.85, pendente: true },
  { recurso: "Dirceu", servico: "Gestor de Mensageria", atuacao: "Análise", realMesAnt: 0, horasDistribuidas: 0, horasConsumidas: 0, horasDistConsumo: 0, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 0 },
  { recurso: "Dirceu", servico: "Iniciativas - Soluções Integradas", atuacao: "Análise", realMesAnt: 2.67, horasDistribuidas: 10, horasConsumidas: 0, horasDistConsumo: 10, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 0, pendente: true },
  { recurso: "Dirceu", servico: "Iniciativas - Soluções Integradas", atuacao: "Desenvolvimento", realMesAnt: 0, horasDistribuidas: 0, horasConsumidas: 0, horasDistConsumo: 0, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 0 },
  { recurso: "Dirceu", servico: "Melhorias - Soluções Integradas", atuacao: "Análise", realMesAnt: 6.5, horasDistribuidas: 10, horasConsumidas: 1, horasDistConsumo: 9, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 10 },
  { recurso: "Dirceu", servico: "Melhorias - Soluções Integradas", atuacao: "Desenvolvimento", realMesAnt: 34.62, horasDistribuidas: 80, horasConsumidas: 67.43, horasDistConsumo: 12.57, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 84.29 },
  { recurso: "Dirceu", servico: "Organização Interna - Soluções Integradas", atuacao: "Organização Interna", realMesAnt: 3.3, horasDistribuidas: 5, horasConsumidas: 9.97, horasDistConsumo: -4.97, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 199.4 },
  { recurso: "Dirceu", servico: "Portal Power BI - Fase 1 (Otimização de Licen...", atuacao: "Desenvolvimento", realMesAnt: 0, horasDistribuidas: 0, horasConsumidas: 0, horasDistConsumo: 0, adicionalSolicitado: 0, horasExternas: 0, distribuidoAtual: 185, distribuidoTotal: 185, consumidoPct: 0 },
];

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function KpiCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div
      className="rounded-md p-4 border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
      <div className="text-2xl font-semibold" style={{ color: valueColor ?? "var(--foreground)" }}>{value}</div>
    </div>
  );
}

function ProgressBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  const w = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative h-6 rounded-sm overflow-hidden" style={{ background: "#fde2e2" }}>
      <div className="h-full" style={{ width: `${w}%`, background: color }} />
      <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-semibold text-white">
        {label}
      </div>
    </div>
  );
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <button
      className="flex items-center justify-between gap-2 px-3 py-2 rounded border text-left w-full"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>{label}</div>
        <div className="text-sm truncate" style={{ color: "var(--foreground)" }}>{value}</div>
      </div>
      <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />
    </button>
  );
}

function DateField({ label, value }: { label: string; value: string }) {
  return (
    <button
      className="flex items-center justify-between gap-2 px-3 py-2 rounded border text-left w-full"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>{label}</div>
        <div className="text-sm truncate" style={{ color: "var(--foreground)" }}>{value}</div>
      </div>
      <Calendar size={14} style={{ color: "var(--muted-foreground)" }} />
    </button>
  );
}

function ConsumoBar({ pct }: { pct: number }) {
  if (pct === 0) {
    return (
      <div className="relative h-5 rounded-sm overflow-hidden" style={{ background: "#eef0f3" }}>
        <div className="absolute inset-0 flex items-center justify-end pr-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          0%
        </div>
      </div>
    );
  }
  let color = "#2596f5";
  if (pct >= 100) color = "#e23b3b";
  else if (pct >= 90) color = "#f0a020";
  const w = Math.min(100, pct);
  return (
    <div className="relative h-5 rounded-sm overflow-hidden" style={{ background: "#eef0f3" }}>
      <div className="h-full" style={{ width: `${w}%`, background: color }} />
      <div className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-semibold text-white">
        {fmt(pct)}%
      </div>
    </div>
  );
}

export default function DistribuicaoHoras() {
  const [busca, setBusca] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>(LINHAS);

  const linhasFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return linhas;
    return linhas.filter((l) =>
      [l.recurso, l.servico, l.atuacao].some((c) => c.toLowerCase().includes(q)),
    );
  }, [busca, linhas]);

  const handleHorasDistribuidasChange = (index: number, value: string) => {
    const num = parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
    setLinhas((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const horasDistConsumo = num - l.horasConsumidas;
        const consumidoPct = num > 0 ? (l.horasConsumidas / num) * 100 : 0;
        return {
          ...l,
          horasDistribuidas: num,
          horasDistConsumo,
          distribuidoAtual: num,
          consumidoPct,
        };
      }),
    );
  };

  const horasAutorizadas = 766;
  const horasDistribuidas = linhas.reduce((acc, l) => acc + l.horasDistribuidas, 0);
  const horasConsumidas = linhas.reduce((acc, l) => acc + l.horasConsumidas, 0);
  const horasDisponiveis = horasAutorizadas - horasDistribuidas;
  const pctDistribuido = horasAutorizadas > 0 ? (horasDistribuidas / horasAutorizadas) * 100 : 0;
  const pctConsumido = horasDistribuidas > 0 ? (horasConsumidas / horasDistribuidas) * 100 : 0;

  return (
    <div className="min-h-full space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "var(--muted-foreground)" }}>Home</span>
        <span style={{ color: "var(--muted-foreground)" }}>\</span>
        <span style={{ color: "#dc2626", fontWeight: 600 }}>Distribuição de Horas</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <KpiCard label="Horas Autorizadas" value={String(horasAutorizadas)} />
        <KpiCard label="Horas Distribuídas" value={fmt(horasDistribuidas)} />
        <KpiCard label="Horas Consumidas" value={fmt(horasConsumidas)} />
        <KpiCard label="Horas Disponíveis" value={fmt(horasDisponiveis)} valueColor="#16a34a" />
        <div className="space-y-2 flex flex-col justify-center">
          <ProgressBar pct={pctDistribuido} color="#16a34a" label={`${pctDistribuido}% Distribuído`} />
          <ProgressBar pct={pctConsumido} color="#2596f5" label={`${fmt(pctConsumido)}% Consumido`} />
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-md border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-center">
          <FilterField label="Equipe" value="Soluções Integradas" />
          <DateField label="Mês/Ano" value="06/2026" />
          <FilterField label="Atuação" value="" />
          <FilterField label="Recurso" value="" />
          <FilterField label="Serviço" value="" />
          <FilterField label="Horas Pendentes de Aprovação" value="Não Incluir" />
          <button className="px-3 py-2 text-sm font-semibold rounded" style={{ color: "#dc2626" }}>
            Carregar Dados
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-md border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded border flex-1" style={{ borderColor: "var(--border)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisa: Todas as Colunas de Texto"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button className="px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>Ir</button>
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>
            Ações <ChevronDown size={12} />
          </button>
          <button className="px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>Salvar Rascunho</button>
          <button className="px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>Limpar</button>
          <button className="px-3 py-1.5 text-sm rounded text-white font-semibold" style={{ background: "#dc2626" }}>Aplicar</button>

          <div className="flex-1" />

          <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>
            <ArrowLeft size={14} /> Redefinir
          </button>
          <button className="px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>
            Redistribuir conforme Consumo
          </button>
          <button className="px-3 py-1.5 text-sm rounded text-white font-semibold" style={{ background: "#dc2626" }}>
            Aprovação do Mês
          </button>
        </div>

        {/* Sub-toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
          <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "#fde68a", color: "#92400e" }}>
            <Star size={11} fill="#92400e" /> 2
          </div>
          <span className="text-sm" style={{ color: "var(--foreground)" }}>Alterado, Pendente</span>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Recurso</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Serviço ↑≡3</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Atuação ↑≡4</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Real. Mês Ant.</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Horas Distribuídas</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Horas Consumidas</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Horas Dist - Con</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Adicional Solicita</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Horas Externas</th>
                <th className="text-left px-3 py-2 text-xs font-semibold w-[160px]" style={{ color: "var(--foreground)" }}>Distribuído</th>
                <th className="text-left px-3 py-2 text-xs font-semibold w-[140px]" style={{ color: "var(--foreground)" }}>Consumido</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Solicitar</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {linhasFiltradas.map((l, i) => (
                <tr key={i} className="border-b hover:bg-[color:var(--accent)]/40" style={{ borderColor: "var(--border)" }}>
                  <td className="px-3 py-2 relative">
                    {l.pendente && (
                      <span className="absolute left-0 top-0 w-0 h-0" style={{ borderTop: "10px solid #dc2626", borderRight: "10px solid transparent" }} />
                    )}
                    {l.recurso}
                  </td>
                  <td className="px-3 py-2">{l.servico}</td>
                  <td className="px-3 py-2">{l.atuacao}</td>
                  <td className="px-3 py-2 text-right">{fmt(l.realMesAnt)}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={fmt(l.horasDistribuidas)}
                      onChange={(e) => handleHorasDistribuidasChange(i, e.target.value)}
                      className="w-24 text-right bg-transparent outline-none border-b focus:border-b-2 px-1 py-0.5 text-sm"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">{fmt(l.horasConsumidas)}</td>
                  <td className="px-3 py-2 text-right">{fmt(l.horasDistConsumo)}</td>
                  <td className="px-3 py-2 text-right">{l.adicionalSolicitado}%</td>
                  <td className="px-3 py-2 text-right">{l.horasExternas > 0 ? fmt(l.horasExternas) : ""}</td>
                  <td className="px-3 py-2">
                    <div className="relative h-5 rounded-sm overflow-hidden" style={{ background: "#16a34a" }}>
                      <div className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-semibold text-white">
                        {l.distribuidoAtual} / {l.distribuidoTotal}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2"><ConsumoBar pct={l.consumidoPct} /></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right"><Clock size={16} style={{ color: "#dc2626" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
