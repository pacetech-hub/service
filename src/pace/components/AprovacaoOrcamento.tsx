import { useState } from "react";
import { Search, ChevronDown, AlertTriangle } from "lucide-react";

interface Linha {
  mesAno: string;
  equipe: string;
  horas: number;
  valor: number;
  status: "Aprovado" | "Pendente" | "Rejeitado";
}

interface Divergencia {
  recurso: string;
  horasMes: number;
  horasSolicitadas: number;
  justificativa: string;
}

const LINHAS: Linha[] = [
  { mesAno: "06/2026", equipe: "Administrativo Financeiro CIPA", horas: 2110, valor: 38640, status: "Aprovado" },
  { mesAno: "05/2026", equipe: "Administrativo Financeiro CIPA", horas: 1863, valor: 11520, status: "Aprovado" },
  { mesAno: "04/2026", equipe: "Administrativo Financeiro CIPA", horas: 1699, valor: 9860, status: "Aprovado" },
  { mesAno: "03/2026", equipe: "Administrativo Financeiro CIPA", horas: 1564, valor: 9520, status: "Aprovado" },
];

const DIVERGENCIAS: Record<string, Divergencia[]> = {
  "06/2026": [
    { recurso: "Igor Freitas", horasMes: 200, horasSolicitadas: 200, justificativa: "Horas adicionais para o projeto dos juros e ajuda no sistema de manuteções." },
    { recurso: "Lucas Mateus Fauth", horasMes: 200, horasSolicitadas: 200, justificativa: "Horas adicionais para o assunto do mdm solicitado pelo Bira para os coletores." },
    { recurso: "Natan Muriel Henrich", horasMes: 208, horasSolicitadas: 208, justificativa: "20 horas referente as apis do rh para os currículos + 8 horas referente aos 2 últimos fechamentos cfe combinado com o gestor." },
  ],
};

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AprovacaoOrcamento() {
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>(LINHAS);

  const linhaSel = selecionada !== null ? linhas[selecionada] : null;
  const divergencias = linhaSel ? DIVERGENCIAS[linhaSel.mesAno] ?? [] : [];
  const podeDesaprovar = linhaSel?.status === "Aprovado";

  const desaprovar = () => {
    if (selecionada === null) return;
    setLinhas((prev) =>
      prev.map((l, i) => (i === selecionada ? { ...l, status: "Pendente" } : l)),
    );
  };

  return (
    <div className="min-h-full space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "var(--muted-foreground)" }}>Home</span>
        <span style={{ color: "var(--muted-foreground)" }}>\</span>
        <span style={{ color: "#dc2626", fontWeight: 600 }}>Aprovação de Orçamento de Equipe</span>
      </div>

      {/* Aviso */}
      <div
        className="rounded-md border p-4 flex items-start gap-3"
        style={{ background: "#fffbeb", borderColor: "#fde68a" }}
      >
        <AlertTriangle size={28} style={{ color: "#f59e0b" }} />
        <div>
          <div className="font-semibold" style={{ color: "var(--foreground)" }}>Aviso Importante</div>
          <div className="text-sm" style={{ color: "var(--foreground)" }}>
            Certifique-se de que as tabelas de preços dos serviços estão devidamente atualizadas.
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-md border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded border min-w-[260px]" style={{ borderColor: "var(--border)" }}>
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
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border" style={{ borderColor: "var(--border)" }}>
            Ações <ChevronDown size={12} />
          </button>

          <div className="flex-1" />

          {podeDesaprovar && (
            <button
              onClick={desaprovar}
              className="px-4 py-1.5 text-sm rounded text-white font-semibold"
              style={{ background: "#dc2626" }}
            >
              Desaprovar
            </button>
          )}
        </div>

        {/* Tabela principal */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="text-left px-3 py-2 text-xs font-semibold">Mês Ano ↓≡2</th>
                <th className="text-left px-3 py-2 text-xs font-semibold">Equipe ↑≡3</th>
                <th className="text-right px-3 py-2 text-xs font-semibold">Horas</th>
                <th className="text-right px-3 py-2 text-xs font-semibold">Valor</th>
                <th className="text-left px-3 py-2 text-xs font-semibold">Status ↓≡1</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => {
                const sel = selecionada === i;
                return (
                  <tr
                    key={i}
                    onClick={() => setSelecionada(i)}
                    className="border-b cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      background: sel ? "#fef2f2" : undefined,
                    }}
                  >
                    <td className="px-3 py-2">{l.mesAno}</td>
                    <td className="px-3 py-2">{l.equipe}</td>
                    <td className="px-3 py-2 text-right" style={sel ? { outline: "2px solid #dc2626", outlineOffset: "-2px" } : undefined}>
                      {fmt(l.horas)}
                    </td>
                    <td className="px-3 py-2 text-right">{fmt(l.valor)}</td>
                    <td className="px-3 py-2">{l.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Divergências */}
      <div>
        <div className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>Divergências</div>
        <div className="rounded-md border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-left px-3 py-2 text-xs font-semibold">Recurso ↑≡</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold">Horas Mês</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold">Horas Solicitadas</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold">Justificativa</th>
                </tr>
              </thead>
              <tbody>
                {linhaSel === null ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10" style={{ color: "var(--muted-foreground)" }}>
                      Selecionar 1 linha na região principal
                    </td>
                  </tr>
                ) : divergencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10" style={{ color: "var(--muted-foreground)" }}>
                      Sem divergências para este período
                    </td>
                  </tr>
                ) : (
                  divergencias.map((d, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: "var(--border)" }}>
                      <td className="px-3 py-2">{d.recurso}</td>
                      <td className="px-3 py-2 text-right">{d.horasMes}</td>
                      <td className="px-3 py-2 text-right">{d.horasSolicitadas}</td>
                      <td className="px-3 py-2">{d.justificativa}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-1 p-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <button className="px-2 py-1">|&lt;</button>
            <button className="px-2 py-1">&lt;</button>
            <button className="px-2 py-1">&gt;</button>
            <button className="px-2 py-1">&gt;|</button>
          </div>
        </div>
      </div>
    </div>
  );
}
