import { useMemo, useState } from "react";
import { Search, ChevronDown, RotateCcw, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, X, FileText } from "lucide-react";

interface Linha {
  codigo: number;
  servico: string;
  atuacao: string;
  equipe: string;
  mesAno: string;
  recurso: string;
  valor: number | null;
  horas: number | null;
  justificativa: string;
  data: string;
  temRelatorio: boolean;
  status: "Aprovado" | "Pendente" | "Rejeitado";
}

const DADOS: Linha[] = [
  { codigo: 281, servico: "Melhorias - Administrativo/Financeiro", atuacao: "Desenvolvimento", equipe: "Núcleo Industrial CDI", mesAno: "06/2026", recurso: "João Guilherme dos Santos Peretti", valor: 480.0, horas: 32.0, justificativa: "Projeto Cortex Lake do ADm", data: "26/06/2026 12:19:52", temRelatorio: false, status: "Aprovado" },
  { codigo: 261, servico: "Melhoria - BI", atuacao: "Análise", equipe: "Núcleo BI", mesAno: "05/2026", recurso: "Renato Lima", valor: 100.0, horas: 10.0, justificativa: "Plantão Extra", data: "29/05/2026 11:28:53", temRelatorio: true, status: "Aprovado" },
  { codigo: 221, servico: "Melhorias - Soluções Integradas", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", mesAno: "04/2026", recurso: "Dirceu Roden", valor: 1560.0, horas: null, justificativa: "O valor excedido corresponde as 24h liberadas para o Dirceu trabalhar no final de semana.", data: "28/04/2026 15:29:31", temRelatorio: false, status: "Aprovado" },
  { codigo: 201, servico: "Melhoria - BI", atuacao: "Análise", equipe: "Núcleo BI", mesAno: "04/2026", recurso: "Renato Lima", valor: 200.0, horas: null, justificativa: "Excedente Feriado", data: "24/04/2026 15:55:15", temRelatorio: true, status: "Aprovado" },
  { codigo: 181, servico: "Geração de Pedidos de Transferência em Lote de Produtos", atuacao: "Análise", equipe: "Núcleo Comercial/Marketing", mesAno: "03/2026", recurso: "Gustavo Stoffels Hahn", valor: 600.0, horas: null, justificativa: "Solicitação de horas por conta de ajustes no sistema que acabaram não computando as horas que já haviam sido solicitadas", data: "19/03/2026 08:49:45", temRelatorio: false, status: "Aprovado" },
  { codigo: 161, servico: "Sustentação - Soluções Integradas", atuacao: "Sustentação", equipe: "Soluções Integradas", mesAno: "12/2025", recurso: "Thiago Rafael Heilmann", valor: 98.93, horas: null, justificativa: "Estas são as horas de plantão do dia 24 do thiago. Ja alinhadas previamente.", data: "22/12/2025 15:57:28", temRelatorio: false, status: "Aprovado" },
  { codigo: 142, servico: "Site dos Currículos", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", mesAno: "12/2025", recurso: "Thiago Rafael Heilmann", valor: 80.93, horas: null, justificativa: "Planejei menos horas no mês, preciso destas para fechar as 176 horas para este recurso", data: "22/12/2025 12:30:45", temRelatorio: true, status: "Aprovado" },
  { codigo: 141, servico: "BR Orçamento", atuacao: "Design", equipe: "Soluções Integradas", mesAno: "12/2025", recurso: "Paloma Delgado", valor: 390.93, horas: null, justificativa: "Planejei o mês com menos horas, preciso de mais horas pra cada recurso completar as 176", data: "22/12/2025 12:28:03", temRelatorio: false, status: "Aprovado" },
  { codigo: 121, servico: "Portal do cliente - Representante", atuacao: "Análise", equipe: "Soluções Integradas", mesAno: "10/2025", recurso: "", valor: null, horas: 10.0, justificativa: "me perdi na distribuição", data: "30/10/2025 16:31:01", temRelatorio: true, status: "Aprovado" },
  { codigo: 102, servico: "Portal do cliente - Representante", atuacao: "Análise", equipe: "Soluções Integradas", mesAno: "10/2025", recurso: "", valor: null, horas: 20.0, justificativa: "horas solicitadas para outros projetos que não deram seguimento esse mes. Faltou nesse dai", data: "28/10/2025 09:48:42", temRelatorio: true, status: "Aprovado" },
  { codigo: 101, servico: "Site dos Currículos", atuacao: "Análise", equipe: "Soluções Integradas", mesAno: "10/2025", recurso: "", valor: null, horas: 20.0, justificativa: "Com possibilidade de horas maiores no dev desse projeto, é necessário maior numero de horas para", data: "28/10/2025 09:43:35", temRelatorio: false, status: "Pendente" },
  { codigo: 81, servico: "Melhorias - Soluções Integradas", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", mesAno: "09/2025", recurso: "Dirceu Roden", valor: 750.0, horas: 15.0, justificativa: "Horas extras de finalização de sprint", data: "29/09/2025 17:10:12", temRelatorio: true, status: "Aprovado" },
  { codigo: 61, servico: "BR Orçamento", atuacao: "Desenvolvimento", equipe: "Soluções Integradas", mesAno: "08/2025", recurso: "Paloma Delgado", valor: 400.0, horas: 8.0, justificativa: "Ajustes solicitados pelo cliente", data: "20/08/2025 10:22:01", temRelatorio: false, status: "Aprovado" },
  { codigo: 41, servico: "Portal Power BI - Fase 1", atuacao: "Análise", equipe: "Núcleo BI", mesAno: "07/2025", recurso: "Renato Lima", valor: 300.0, horas: 6.0, justificativa: "Reunião adicional com stakeholders", data: "15/07/2025 09:05:33", temRelatorio: true, status: "Aprovado" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_OPCOES: Linha["status"][] = ["Aprovado", "Pendente", "Rejeitado"];

function statusStyle(s: Linha["status"]) {
  if (s === "Aprovado") return { color: "#dc2626" };
  if (s === "Pendente") return { color: "#a16207" };
  return { color: "#b91c1c" };
}

export default function AutorizacaoHorasAdicionais() {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Linha[]>(DADOS);
  const [relatorioAberto, setRelatorioAberto] = useState<Linha | null>(null);
  const [statusEdit, setStatusEdit] = useState<number | null>(null);
  const porPagina = 14;

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return dados;
    return dados.filter((d) =>
      [d.servico, d.atuacao, d.equipe, d.recurso, d.mesAno, d.justificativa, d.status].some((c) =>
        c.toLowerCase().includes(q),
      ),
    );
  }, [busca, dados]);

  const total = filtrados.length;
  const inicio = (pagina - 1) * porPagina;
  const fim = Math.min(inicio + porPagina, total);
  const pagDados = filtrados.slice(inicio, fim);

  function alterarStatus(codigo: number, novo: Linha["status"]) {
    setDados((prev) => prev.map((d) => (d.codigo === codigo ? { ...d, status: novo } : d)));
    setStatusEdit(null);
  }

  return (
    <div className="min-h-full space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "var(--muted-foreground)" }}>Home</span>
        <span style={{ color: "var(--muted-foreground)" }}>\</span>
        <span style={{ color: "#dc2626", fontWeight: 600 }}>Autorização de Horas Adicionais</span>
      </div>

      <div className="rounded-md border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>Autorização de Horas Adicionais</h2>
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
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  <span className="inline-flex items-center gap-1">Código <ChevronDown size={10} /></span>
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Serviço</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Atuação</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Equipe</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Mês/Ano</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Recurso</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Valor</th>
                <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Horas</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Justificativa</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Data da Solicitação</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Relatório</th>
                <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--foreground)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagDados.map((r) => (
                <tr key={r.codigo} className="border-b align-top" style={{ borderColor: "var(--border)" }}>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.codigo}</td>
                  <td className="px-3 py-2.5 max-w-[200px]" style={{ color: "var(--foreground)" }}>{r.servico}</td>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.atuacao}</td>
                  <td className="px-3 py-2.5 max-w-[180px]" style={{ color: "var(--foreground)" }}>{r.equipe}</td>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.mesAno}</td>
                  <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>{r.recurso}</td>
                  <td className="px-3 py-2.5 text-right" style={{ color: "var(--foreground)" }}>{r.valor != null ? fmt(r.valor) : ""}</td>
                  <td className="px-3 py-2.5 text-right" style={{ color: "var(--foreground)" }}>{r.horas != null ? fmt(r.horas) : ""}</td>
                  <td className="px-3 py-2.5 max-w-[260px]" style={{ color: "var(--foreground)" }}>{r.justificativa}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--foreground)" }}>{r.data}</td>
                  <td className="px-3 py-2.5">
                    {r.temRelatorio ? (
                      <button
                        onClick={() => setRelatorioAberto(r)}
                        className="text-sm hover:underline"
                        style={{ color: "#dc2626" }}
                      >
                        Relatório
                      </button>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 relative">
                    <button
                      onClick={() => setStatusEdit(statusEdit === r.codigo ? null : r.codigo)}
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                      style={statusStyle(r.status)}
                    >
                      {r.status} <ChevronDown size={11} />
                    </button>
                    {statusEdit === r.codigo && (
                      <div
                        className="absolute z-10 mt-1 rounded border shadow-md"
                        style={{ background: "var(--card)", borderColor: "var(--border)", minWidth: 130 }}
                      >
                        {STATUS_OPCOES.map((s) => (
                          <button
                            key={s}
                            onClick={() => alterarStatus(r.codigo, s)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-[color:var(--accent)]/40"
                            style={statusStyle(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
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

      {/* Modal Relatório */}
      {relatorioAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setRelatorioAberto(null)}
        >
          <div
            className="rounded-md border w-full max-w-2xl"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#dc2626" }} />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>
                  Relatório — Solicitação #{relatorioAberto.codigo}
                </h3>
              </div>
              <button onClick={() => setRelatorioAberto(null)} className="p-1 rounded hover:bg-[color:var(--accent)]/40">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm" style={{ color: "var(--foreground)" }}>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Serviço</div>{relatorioAberto.servico}</div>
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Atuação</div>{relatorioAberto.atuacao}</div>
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Equipe</div>{relatorioAberto.equipe}</div>
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Recurso</div>{relatorioAberto.recurso || "—"}</div>
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Mês/Ano</div>{relatorioAberto.mesAno}</div>
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Data</div>{relatorioAberto.data}</div>
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Valor</div>{relatorioAberto.valor != null ? `R$ ${fmt(relatorioAberto.valor)}` : "—"}</div>
                <div><div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Horas</div>{relatorioAberto.horas != null ? fmt(relatorioAberto.horas) : "—"}</div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Justificativa</div>
                <p className="mt-1">{relatorioAberto.justificativa}</p>
              </div>
              <div className="rounded border p-3" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Análise complementar</div>
                <p>Documentação anexada pelo solicitante comprovando o esforço extra realizado no período. Recomenda-se aprovação.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setRelatorioAberto(null)} className="px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
