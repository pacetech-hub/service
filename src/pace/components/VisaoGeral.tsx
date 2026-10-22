import { useMemo, useState } from "react";
import { Search, RotateCcw, ArrowUpDown, ChevronDown } from "lucide-react";

const BRAND = "#1e6fff";
const HIGHLIGHT_BG = "#ffe8ec";
const HIGHLIGHT_BORDER = "#f5c2c7";
const RED = "#dc2626";

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtNum = (v: number) => v.toLocaleString("pt-BR");

type SortDir = "asc" | "desc";
type SortState<K extends string> = { key: K; dir: SortDir } | null;

function useSort<T, K extends string>(
  rows: T[],
  getter: (row: T, key: K) => string | number,
  initial: SortState<K> = null,
) {
  const [sort, setSort] = useState<SortState<K>>(initial);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = getter(a, sort.key);
      const vb = getter(b, sort.key);
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sort, getter]);
  const toggle = (key: K) =>
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  return { sorted, sort, toggle };
}

// ---- Mock data ----
const resumoMes = [
  { mes: "09/2025", plan: 2150, real: 1796.17 },
  { mes: "10/2025", plan: 12480, real: 11220.5 },
  { mes: "11/2025", plan: 18730, real: 17840.9 },
  { mes: "12/2025", plan: 24560, real: 22110 },
  { mes: "01/2026", plan: 38900, real: 30215.4 },
  { mes: "02/2026", plan: 49637, real: 41822.3 },
  { mes: "03/2026", plan: 31200, real: 0 },
  { mes: "04/2026", plan: 27800, real: 0 },
];

const resumoEquipe = [
  { equipe: "Soluções Integradas", plan: 2149.99, real: 1796.17 },
  { equipe: "PMO", plan: 8420.5, real: 7210.4 },
  { equipe: "Inovação", plan: 15300, real: 12980.9 },
  { equipe: "Infraestrutura", plan: 6410, real: 5990.2 },
];

const servicos = [
  {
    id: 101,
    categoria: "Melhoria",
    nome: "SOIM - Melhoria",
    horasPlan: 3000,
    horasDispTot: 1834,
    horasDispMes: 250,
    valorPlanTot: 52805,
    valorPlanMes: 2150,
    valorRealMes: 1222.17,
    status: "Andamento",
  },
  {
    id: 102,
    categoria: "Projeto",
    nome: "SOIM - Reforma Tributária",
    horasPlan: 4200,
    horasDispTot: 3120,
    horasDispMes: 320,
    valorPlanTot: 78900,
    valorPlanMes: 4830,
    valorRealMes: 3910.4,
    status: "Andamento",
  },
  {
    id: 103,
    categoria: "Sustentação",
    nome: "SOIM - Sustentação WMS",
    horasPlan: 1800,
    horasDispTot: 940,
    horasDispMes: 180,
    valorPlanTot: 34200,
    valorPlanMes: 2880,
    valorRealMes: 2440.6,
    status: "Andamento",
  },
];

const atuacoes = [
  {
    atuacao: "Análise",
    equipe: "Soluções Integradas",
    horasDispMes: 60,
    horasRealMes: 48,
    valorPlanMes: 720,
    valorRealMes: 576,
  },
  {
    atuacao: "Desenvolvimento",
    equipe: "Soluções Integradas",
    horasDispMes: 120,
    horasRealMes: 96,
    valorPlanMes: 1560,
    valorRealMes: 1248,
  },
  {
    atuacao: "Design",
    equipe: "Soluções Integradas",
    horasDispMes: 30,
    horasRealMes: 22,
    valorPlanMes: 420,
    valorRealMes: 308,
  },
  {
    atuacao: "Validação de Software",
    equipe: "Soluções Integradas",
    horasDispMes: 40,
    horasRealMes: 31,
    valorPlanMes: 520,
    valorRealMes: 403,
  },
];

// ---- Reusable pieces ----

function SectionCard({
  title,
  children,
  toolbar,
  className,
}: {
  title: string;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border bg-white ${className ?? ""}`}
      style={{ borderColor: "var(--border)" }}
    >
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
            {title}
          </h2>
        </div>
        <div className="mt-2 border-b" style={{ borderColor: "var(--border)" }} />
      </div>
      {toolbar && <div className="px-4 pt-3">{toolbar}</div>}
      <div className="p-4 pt-3">{children}</div>
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  priority,
  align = "left",
  onClick,
}: {
  label: string;
  active?: boolean;
  dir?: SortDir;
  priority?: number;
  align?: "left" | "right";
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 ${
        align === "right" ? "justify-end w-full" : ""
      }`}
      style={{
        color: active ? BRAND : "var(--muted-foreground)",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      <span>{label}</span>
      <ArrowUpDown size={11} style={{ opacity: active ? 1 : 0.6 }} />
      {priority !== undefined && (
        <span
          style={{
            fontSize: 10,
            background: BRAND,
            color: "#fff",
            borderRadius: 999,
            padding: "0 5px",
            lineHeight: "14px",
            marginLeft: 2,
          }}
        >
          {priority}
        </span>
      )}
    </button>
  );
}

function TableFooter({
  selected,
  total,
  showSelected = true,
}: {
  selected?: number;
  total: number;
  showSelected?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 border-t"
      style={{
        borderColor: "var(--border)",
        fontSize: 11,
        color: "var(--muted-foreground)",
        background: "#fafafa",
      }}
    >
      <span>{showSelected ? `${selected ?? 0} linhas selecionadas` : ""}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>Total {total}</span>
    </div>
  );
}

const thBase: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid var(--border)",
  background: "#fafafa",
  textAlign: "left",
};
const tdBase: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid var(--border)",
  fontSize: 12,
  color: "var(--foreground)",
};
const numStyle: React.CSSProperties = {
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

function Row({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <tr
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: selected ? HIGHLIGHT_BG : "transparent",
        boxShadow: selected ? `inset 3px 0 0 ${RED}` : undefined,
      }}
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLTableRowElement).style.background = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        if (!selected)
          (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
      }}
    >
      {children}
    </tr>
  );
}

// ---- Page ----

export default function VisaoGeral() {
  const [selMes, setSelMes] = useState<string | null>("09/2025");
  const [selEquipe, setSelEquipe] = useState<string | null>("Soluções Integradas");
  const [selServico, setSelServico] = useState<number | null>(101);
  const [busca, setBusca] = useState("");

  const mesSort = useSort<(typeof resumoMes)[number], "mes" | "plan" | "real">(
    resumoMes,
    (r, k) => (k === "mes" ? r.mes : (r as any)[k]),
  );
  const equipeSort = useSort<
    (typeof resumoEquipe)[number],
    "equipe" | "plan" | "real"
  >(resumoEquipe, (r, k) => (r as any)[k]);

  const servFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return servicos;
    return servicos.filter((s) =>
      [s.id, s.categoria, s.nome, s.status]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [busca]);
  const servSort = useSort<(typeof servicos)[number], keyof (typeof servicos)[number]>(
    servFiltrados,
    (r, k) => r[k] as any,
    { key: "nome", dir: "asc" },
  );

  // Atuações: default sort primary = equipe (1), secondary = atuacao (2)
  const atuacoesSorted = useMemo(() => {
    const copy = [...atuacoes];
    copy.sort(
      (a, b) =>
        a.equipe.localeCompare(b.equipe) || a.atuacao.localeCompare(b.atuacao),
    );
    return copy;
  }, []);
  const [atuSort, setAtuSort] = useState<
    SortState<"atuacao" | "equipe" | "horasDispMes" | "horasRealMes" | "valorPlanMes" | "valorRealMes">
  >(null);
  const atuDisplay = useMemo(() => {
    if (!atuSort) return atuacoesSorted;
    const copy = [...atuacoesSorted];
    copy.sort((a, b) => {
      const va = (a as any)[atuSort.key];
      const vb = (b as any)[atuSort.key];
      if (va < vb) return atuSort.dir === "asc" ? -1 : 1;
      if (va > vb) return atuSort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [atuacoesSorted, atuSort]);

  return (
    <div className="space-y-5" style={{ color: "var(--foreground)" }}>
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5"
        style={{ fontSize: 13, color: "var(--muted-foreground)" }}
        aria-label="breadcrumb"
      >
        <a href="#" style={{ color: "var(--muted-foreground)" }}>
          Home
        </a>
        <span>/</span>
        <span style={{ color: RED, fontWeight: 700 }}>Visão Geral</span>
      </nav>

      {/* Top grid: 40 / 60 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Resumo por Mês */}
        <div className="lg:col-span-2">
          <SectionCard title="Resumo por Mês">
            <div
              className="border rounded-md overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                <table className="w-full border-collapse">
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={thBase}>
                        <SortHeader
                          label="Mês/Ano"
                          active={mesSort.sort?.key === "mes"}
                          dir={mesSort.sort?.dir}
                          onClick={() => mesSort.toggle("mes")}
                        />
                      </th>
                      <th style={{ ...thBase, textAlign: "right" }}>
                        <SortHeader
                          label="Valor Planejado"
                          align="right"
                          active={mesSort.sort?.key === "plan"}
                          dir={mesSort.sort?.dir}
                          onClick={() => mesSort.toggle("plan")}
                        />
                      </th>
                      <th style={{ ...thBase, textAlign: "right" }}>
                        <SortHeader
                          label="Valor Realizado"
                          align="right"
                          active={mesSort.sort?.key === "real"}
                          dir={mesSort.sort?.dir}
                          onClick={() => mesSort.toggle("real")}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesSort.sorted.map((r) => (
                      <Row
                        key={r.mes}
                        selected={selMes === r.mes}
                        onClick={() =>
                          setSelMes(selMes === r.mes ? null : r.mes)
                        }
                      >
                        <td style={tdBase}>{r.mes}</td>
                        <td style={{ ...tdBase, ...numStyle }}>
                          {fmtBRL(r.plan)}
                        </td>
                        <td style={{ ...tdBase, ...numStyle }}>
                          {fmtBRL(r.real)}
                        </td>
                      </Row>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter
                selected={selMes ? 1 : 0}
                total={resumoMes.length}
              />
            </div>
          </SectionCard>
        </div>

        {/* Resumo por Equipe */}
        <div className="lg:col-span-3">
          <SectionCard title="Resumo por Equipe">
            <div
              className="border rounded-md overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th style={thBase}>
                      <SortHeader
                        label="Equipe"
                        active={equipeSort.sort?.key === "equipe"}
                        dir={equipeSort.sort?.dir}
                        onClick={() => equipeSort.toggle("equipe")}
                      />
                    </th>
                    <th style={{ ...thBase, textAlign: "right" }}>
                      <SortHeader
                        label="Valor Planejado"
                        align="right"
                        active={equipeSort.sort?.key === "plan"}
                        dir={equipeSort.sort?.dir}
                        onClick={() => equipeSort.toggle("plan")}
                      />
                    </th>
                    <th style={{ ...thBase, textAlign: "right" }}>
                      <SortHeader
                        label="Valor Realizado"
                        align="right"
                        active={equipeSort.sort?.key === "real"}
                        dir={equipeSort.sort?.dir}
                        onClick={() => equipeSort.toggle("real")}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {equipeSort.sorted.map((r) => (
                    <Row
                      key={r.equipe}
                      selected={selEquipe === r.equipe}
                      onClick={() =>
                        setSelEquipe(selEquipe === r.equipe ? null : r.equipe)
                      }
                    >
                      <td style={tdBase}>{r.equipe}</td>
                      <td style={{ ...tdBase, ...numStyle }}>
                        {fmtBRL(r.plan)}
                      </td>
                      <td style={{ ...tdBase, ...numStyle }}>
                        {fmtBRL(r.real)}
                      </td>
                    </Row>
                  ))}
                </tbody>
              </table>
              <TableFooter
                selected={selEquipe ? 1 : 0}
                total={resumoEquipe.length}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Serviços */}
      <SectionCard
        title="Serviços"
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center rounded-md border overflow-hidden"
              style={{ borderColor: "var(--border)", background: "#fff" }}
            >
              <div className="pl-2 pr-1" style={{ color: "var(--muted-foreground)" }}>
                <Search size={13} />
              </div>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder=""
                style={{ padding: "6px 8px", fontSize: 12, outline: "none", width: 160 }}
              />
              <button
                className="flex items-center gap-1 border-l px-2"
                style={{
                  borderColor: "var(--border)",
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  background: "#fafafa",
                }}
              >
                Pesquisa: Todas as Colunas de Texto
                <ChevronDown size={12} />
              </button>
            </div>
            <button
              className="px-3 py-1.5 rounded-md"
              style={{
                background: BRAND,
                color: "#fff",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Ir
            </button>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border"
              style={{
                borderColor: "var(--border)",
                fontSize: 12,
                color: "var(--foreground)",
                background: "#fff",
              }}
            >
              Ações
              <ChevronDown size={12} />
            </button>
            <button
              className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-md border"
              style={{
                borderColor: "var(--border)",
                fontSize: 12,
                color: "var(--foreground)",
                background: "#fff",
              }}
              onClick={() => setBusca("")}
            >
              <RotateCcw size={12} />
              Redefinir
            </button>
          </div>
        }
      >
        <div
          className="border rounded-md overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div style={{ overflowX: "auto" }}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th style={{ ...thBase, textAlign: "right" }}>
                    <SortHeader
                      label="ID"
                      align="right"
                      active={servSort.sort?.key === "id"}
                      onClick={() => servSort.toggle("id")}
                    />
                  </th>
                  <th style={thBase}>
                    <SortHeader
                      label="Categoria"
                      active={servSort.sort?.key === "categoria"}
                      onClick={() => servSort.toggle("categoria")}
                    />
                  </th>
                  <th style={thBase}>
                    <SortHeader
                      label="Nome Serviço"
                      active={servSort.sort?.key === "nome"}
                      onClick={() => servSort.toggle("nome")}
                    />
                  </th>
                  <th style={{ ...thBase, textAlign: "right" }}>
                    <SortHeader
                      label="Horas Planejadas"
                      align="right"
                      active={servSort.sort?.key === "horasPlan"}
                      onClick={() => servSort.toggle("horasPlan")}
                    />
                  </th>
                  <th style={{ ...thBase, textAlign: "right" }}>
                    <SortHeader
                      label="Horas Disp. Totais"
                      align="right"
                      active={servSort.sort?.key === "horasDispTot"}
                      onClick={() => servSort.toggle("horasDispTot")}
                    />
                  </th>
                  <th style={{ ...thBase, textAlign: "right" }}>
                    <SortHeader
                      label="Horas Disp. Mês"
                      align="right"
                      active={servSort.sort?.key === "horasDispMes"}
                      onClick={() => servSort.toggle("horasDispMes")}
                    />
                  </th>
                  <th style={{ ...thBase, textAlign: "right" }}>
                    <SortHeader
                      label="Valor Plan. Total"
                      align="right"
                      active={servSort.sort?.key === "valorPlanTot"}
                      onClick={() => servSort.toggle("valorPlanTot")}
                    />
                  </th>
                  <th style={{ ...thBase, textAlign: "right" }}>
                    <SortHeader
                      label="Valor Plan. Mês"
                      align="right"
                      active={servSort.sort?.key === "valorPlanMes"}
                      onClick={() => servSort.toggle("valorPlanMes")}
                    />
                  </th>
                  <th style={{ ...thBase, textAlign: "right" }}>
                    <SortHeader
                      label="Valor Realizado Mês"
                      align="right"
                      active={servSort.sort?.key === "valorRealMes"}
                      onClick={() => servSort.toggle("valorRealMes")}
                    />
                  </th>
                  <th style={thBase}>
                    <SortHeader
                      label="Status"
                      active={servSort.sort?.key === "status"}
                      onClick={() => servSort.toggle("status")}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {servSort.sorted.map((s) => (
                  <Row
                    key={s.id}
                    selected={selServico === s.id}
                    onClick={() =>
                      setSelServico(selServico === s.id ? null : s.id)
                    }
                  >
                    <td style={{ ...tdBase, ...numStyle }}>{s.id}</td>
                    <td style={tdBase}>{s.categoria}</td>
                    <td style={tdBase}>{s.nome}</td>
                    <td style={{ ...tdBase, ...numStyle }}>
                      {fmtNum(s.horasPlan)}
                    </td>
                    <td style={{ ...tdBase, ...numStyle }}>
                      {fmtNum(s.horasDispTot)}
                    </td>
                    <td style={{ ...tdBase, ...numStyle }}>
                      {fmtNum(s.horasDispMes)}
                    </td>
                    <td style={{ ...tdBase, ...numStyle }}>
                      {fmtBRL(s.valorPlanTot)}
                    </td>
                    <td style={{ ...tdBase, ...numStyle }}>
                      {fmtBRL(s.valorPlanMes)}
                    </td>
                    <td style={{ ...tdBase, ...numStyle }}>
                      {fmtBRL(s.valorRealMes)}
                    </td>
                    <td style={tdBase}>{s.status}</td>
                  </Row>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter
            selected={selServico ? 1 : 0}
            total={servFiltrados.length}
          />
        </div>
      </SectionCard>

      {/* Atuações */}
      <SectionCard title="Atuações">
        <div
          className="border rounded-md overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th style={thBase}>
                  <SortHeader
                    label="Atuação"
                    priority={atuSort?.key === "atuacao" ? undefined : 2}
                    active={atuSort?.key === "atuacao"}
                    dir={atuSort?.dir}
                    onClick={() =>
                      setAtuSort((s) =>
                        s?.key === "atuacao"
                          ? { key: "atuacao", dir: s.dir === "asc" ? "desc" : "asc" }
                          : { key: "atuacao", dir: "asc" },
                      )
                    }
                  />
                </th>
                <th style={thBase}>
                  <SortHeader
                    label="Equipe"
                    priority={atuSort?.key === "equipe" ? undefined : 1}
                    active={atuSort?.key === "equipe"}
                    dir={atuSort?.dir}
                    onClick={() =>
                      setAtuSort((s) =>
                        s?.key === "equipe"
                          ? { key: "equipe", dir: s.dir === "asc" ? "desc" : "asc" }
                          : { key: "equipe", dir: "asc" },
                      )
                    }
                  />
                </th>
                <th style={{ ...thBase, textAlign: "right" }}>
                  <SortHeader
                    label="Horas Disponibilizadas Mês"
                    align="right"
                    active={atuSort?.key === "horasDispMes"}
                    dir={atuSort?.dir}
                    onClick={() =>
                      setAtuSort((s) =>
                        s?.key === "horasDispMes"
                          ? { key: "horasDispMes", dir: s.dir === "asc" ? "desc" : "asc" }
                          : { key: "horasDispMes", dir: "asc" },
                      )
                    }
                  />
                </th>
                <th style={{ ...thBase, textAlign: "right" }}>
                  <SortHeader
                    label="Horas Realizadas Mês"
                    align="right"
                    active={atuSort?.key === "horasRealMes"}
                    dir={atuSort?.dir}
                    onClick={() =>
                      setAtuSort((s) =>
                        s?.key === "horasRealMes"
                          ? { key: "horasRealMes", dir: s.dir === "asc" ? "desc" : "asc" }
                          : { key: "horasRealMes", dir: "asc" },
                      )
                    }
                  />
                </th>
                <th style={{ ...thBase, textAlign: "right" }}>
                  <SortHeader
                    label="Valor Planejado Mês"
                    align="right"
                    active={atuSort?.key === "valorPlanMes"}
                    dir={atuSort?.dir}
                    onClick={() =>
                      setAtuSort((s) =>
                        s?.key === "valorPlanMes"
                          ? { key: "valorPlanMes", dir: s.dir === "asc" ? "desc" : "asc" }
                          : { key: "valorPlanMes", dir: "asc" },
                      )
                    }
                  />
                </th>
                <th style={{ ...thBase, textAlign: "right" }}>
                  <SortHeader
                    label="Valor Realizado Mês"
                    align="right"
                    active={atuSort?.key === "valorRealMes"}
                    dir={atuSort?.dir}
                    onClick={() =>
                      setAtuSort((s) =>
                        s?.key === "valorRealMes"
                          ? { key: "valorRealMes", dir: s.dir === "asc" ? "desc" : "asc" }
                          : { key: "valorRealMes", dir: "asc" },
                      )
                    }
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {atuDisplay.map((a) => (
                <tr
                  key={a.atuacao}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                  style={{ borderBottom: `1px solid var(--border)` }}
                >
                  <td style={tdBase}>{a.atuacao}</td>
                  <td style={tdBase}>{a.equipe}</td>
                  <td style={{ ...tdBase, ...numStyle }}>
                    {fmtNum(a.horasDispMes)}
                  </td>
                  <td style={{ ...tdBase, ...numStyle }}>
                    {fmtNum(a.horasRealMes)}
                  </td>
                  <td style={{ ...tdBase, ...numStyle }}>
                    {fmtBRL(a.valorPlanMes)}
                  </td>
                  <td style={{ ...tdBase, ...numStyle }}>
                    {fmtBRL(a.valorRealMes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableFooter total={atuDisplay.length} showSelected={false} />
        </div>
      </SectionCard>
    </div>
  );
}
