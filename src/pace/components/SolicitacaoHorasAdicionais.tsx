import { useMemo, useState } from "react";
import { Search, ChevronDown, RotateCcw, Pencil, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface Solicitacao {
  codigo: number;
  servico: string;
  atuacao: string;
  equipe: string;
  recurso: string;
  mesAno: string;
  qtdHoras: number | null;
  percentual: number | null;
  justificativa: string;
  data: string;
  status: "Aprovado" | "Pendente" | "Rejeitado";
}

const DADOS: Solicitacao[] = [
  { codigo: 281, servico: "Melhorias - Administrativo/Financeiro", atuacao: "Desenvolvimento", equipe: "Núcleo Industrial CDI", recurso: "João Guilherme dos Santos Peretti", mesAno: "06/2026", qtdHoras: 32.0, percentual: 17.78, justificativa: "Projeto Cortex Lake do ADm", data: "26/06/2026 12:19:52", status: "Aprovado" },
  { codigo: 261, servico: "Melhoria - BI", atuacao: "Análise", equipe: "Núcleo BI", recurso: "Renato Lima", mesAno: "05/2026", qtdHoras: 10.0, percentual: 5.68, justificativa: "Plantão Extra", data: "29/05/2026 11:28:53", status: "Aprovado" },
  { codigo: 221, servico: "Melhorias - Soluções Integradas", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", recurso: "Dirceu Roden", mesAno: "04/2026", qtdHoras: null, percentual: 13.64, justificativa: "O valor excedido corresponde as 24h liberadas para o Dirceu trabalhar no final de semana.", data: "28/04/2026 15:29:31", status: "Aprovado" },
  { codigo: 201, servico: "Melhoria - BI", atuacao: "Análise", equipe: "Núcleo BI", recurso: "Renato Lima", mesAno: "04/2026", qtdHoras: null, percentual: 11.36, justificativa: "Excedente Feriado", data: "24/04/2026 15:55:15", status: "Aprovado" },
  { codigo: 181, servico: "Geração de Pedidos de Transferência em Lote de Produtos", atuacao: "Análise", equipe: "Núcleo Comercial/Marketing", recurso: "Gustavo Stoffels Hahn", mesAno: "03/2026", qtdHoras: null, percentual: 47.62, justificativa: "Solicitação de horas por conta de ajustes no sistema que acabaram não computando as horas que já haviam sido solicitadas", data: "19/03/2026 08:49:45", status: "Aprovado" },
  { codigo: 161, servico: "Sustentação - Soluções Integradas", atuacao: "Sustentação", equipe: "Soluções Integradas", recurso: "Thiago Rafael Heilmann", mesAno: "12/2025", qtdHoras: null, percentual: 5.82, justificativa: "Estas são as horas de plantão do dia 24 do thiago. Ja alinhadas previamente.", data: "22/12/2025 15:57:28", status: "Aprovado" },
  { codigo: 142, servico: "Site dos Currículos", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", recurso: "Thiago Rafael Heilmann", mesAno: "12/2025", qtdHoras: null, percentual: 4.76, justificativa: "Planejei menos horas no mês, preciso destas para fechar as 176 horas para este recurso", data: "22/12/2025 12:30:45", status: "Aprovado" },
  { codigo: 141, servico: "BR Orçamento", atuacao: "Design", equipe: "Soluções Integradas", recurso: "Paloma Delgado", mesAno: "12/2025", qtdHoras: null, percentual: 28.12, justificativa: "Planejei o mês com menos horas, preciso de mais horas pra cada recurso completar as 176", data: "22/12/2025 12:28:03", status: "Aprovado" },
  { codigo: 121, servico: "Portal do cliente - Representante", atuacao: "Análise", equipe: "Soluções Integradas", recurso: "", mesAno: "10/2025", qtdHoras: 10.0, percentual: null, justificativa: "me perdi na distribuição", data: "30/10/2025 16:31:01", status: "Aprovado" },
  { codigo: 102, servico: "Portal do cliente - Representante", atuacao: "Análise", equipe: "Soluções Integradas", recurso: "", mesAno: "10/2025", qtdHoras: 20.0, percentual: null, justificativa: "horas solicitadas para outros projetos que não deram seguimento esse mes. Faltou nesse dai", data: "28/10/2025 09:48:42", status: "Aprovado" },
  { codigo: 101, servico: "Site dos Currículos", atuacao: "Análise", equipe: "Soluções Integradas", recurso: "", mesAno: "10/2025", qtdHoras: 20.0, percentual: null, justificativa: "Com possibilidade de horas maiores no dev desse projeto, é necessário maior numero de horas para", data: "28/10/2025 09:43:35", status: "Aprovado" },
  { codigo: 81, servico: "Melhorias - Soluções Integradas", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", recurso: "Dirceu Roden", mesAno: "09/2025", qtdHoras: 15.0, percentual: 8.52, justificativa: "Horas extras de finalização de sprint", data: "29/09/2025 17:10:12", status: "Aprovado" },
  { codigo: 61, servico: "BR Orçamento", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", recurso: "Paloma Delgado", mesAno: "08/2025", qtdHoras: 8.0, percentual: 4.54, justificativa: "Ajustes solicitados pelo cliente", data: "20/08/2025 10:22:01", status: "Aprovado" },
  { codigo: 41, servico: "Portal Power BI - Fase 1", atuacao: "Análise", equipe: "Núcleo BI", recurso: "Renato Lima", mesAno: "07/2025", qtdHoras: 6.0, percentual: 3.4, justificativa: "Reunião adicional com stakeholders", data: "15/07/2025 09:05:33", status: "Aprovado" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatusBadge({ status }: { status: Solicitacao["status"] }) {
  const map: Record<Solicitacao["status"], { bg: string; color: string }> = {
    Aprovado: { bg: "transparent", color: "var(--foreground)" },
    Pendente: { bg: "#fef9c3", color: "#a16207" },
    Rejeitado: { bg: "#fee2e2", color: "#b91c1c" },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: 13, color: s.color, background: s.bg, padding: status === "Aprovado" ? 0 : "2px 8px", borderRadius: 999 }}>
      {status}
    </span>
  );
}

export default function SolicitacaoHorasAdicionais() {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 14;

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return DADOS;
    return DADOS.filter((d) =>
      [d.servico, d.atuacao, d.equipe, d.recurso, d.mesAno, d.justificativa, d.status].some((c) =>
        c.toLowerCase().includes(q),
      ),
    );
  }, [busca]);

  const total = filtrados.length;
  const inicio = (pagina - 1) * porPagina;
  const fim = Math.min(inicio + porPagina, total);
  const pagDados = filtrados.slice(inicio, fim);

  return (
    <div className="min-h-full space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "var(--muted-foreground)" }}>Home</span>
        <span style={{ color: "var(--muted-foreground)" }}>\</span>
        <span style={{ color: "#dc2626", fontWeight: 600 }}>Solicitação de Horas Adicionais</span>
      </div>

      {/* Card */}
      <div className="rounded-md border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>Solicitação de Horas Adicionais</h2>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-[420px]">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded border flex-1" style={{ borderColor: "var(--border)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
              <input
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
                placeholder="Pesquisa: Todas as Colunas de Texto"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button className="px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>Ir</button>
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>
            Ações <ChevronDown size={12} />
          </button>

          <div className="flex-1" />

          <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>
            <RotateCcw size={14} /> Redefinir
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="px-3 py-2 w-10"></th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  <span className="inline-flex items-center gap-1">Código <ChevronDown size={10} /></span>
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Serviço</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Atuação</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Equipe</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Recurso</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Mês/Ano</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>QTD Horas</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Percentual</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Justificativa</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Data da Solicitação</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagDados.map((r) => (
                <tr key={r.codigo} className="border-b align-top" style={{ borderColor: "var(--border)" }}>
                  <td className="px-3 py-2.5">
                    <button title="Editar" className="p-1 rounded hover:bg-[color:var(--accent)]/40">
                      <Pencil size={14} style={{ color: "#f59e0b" }} />
                    </button>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.codigo}</td>
                  <td className="px-3 py-2.5 max-w-[220px]" style={{ color: "var(--foreground)" }}>{r.servico}</td>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.atuacao}</td>
                  <td className="px-3 py-2.5 max-w-[180px]" style={{ color: "var(--foreground)" }}>{r.equipe}</td>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.recurso}</td>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.mesAno}</td>
                  <td className="px-3 py-2.5 text-right" style={{ color: "var(--foreground)" }}>{r.qtdHoras != null ? fmt(r.qtdHoras) : ""}</td>
                  <td className="px-3 py-2.5 text-right" style={{ color: "var(--foreground)" }}>{r.percentual != null ? fmt(r.percentual) : ""}</td>
                  <td className="px-3 py-2.5 max-w-[280px]" style={{ color: "var(--foreground)" }}>{r.justificativa}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--foreground)" }}>{r.data}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-end gap-1 p-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <button onClick={() => setPagina(1)} className="p-1 rounded border" style={{ borderColor: "var(--border)" }}><ChevronsLeft size={14} /></button>
          <button onClick={() => setPagina((p) => Math.max(1, p - 1))} className="p-1 rounded border" style={{ borderColor: "var(--border)" }}><ChevronLeft size={14} /></button>
          <span className="px-2 py-0.5 rounded border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>{pagina}</span>
          <button onClick={() => setPagina((p) => (fim < total ? p + 1 : p))} className="p-1 rounded border" style={{ borderColor: "var(--border)" }}><ChevronRight size={14} /></button>
          <button onClick={() => setPagina(Math.ceil(total / porPagina) || 1)} className="p-1 rounded border" style={{ borderColor: "var(--border)" }}><ChevronsRight size={14} /></button>
          <span className="ml-3">{total === 0 ? "0 - 0 de 0" : `${inicio + 1} - ${fim} de ${total}`}</span>
        </div>
      </div>
    </div>
  );
}
