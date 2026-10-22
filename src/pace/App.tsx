import { useState } from "react";
import { CadastroPessoas } from "./components/CadastroPessoas";
import { CadastroOrganizacao } from "./components/CadastroOrganizacao";
import { CadastroAtuacoes } from "./components/CadastroAtuacoes";
import { CadastroCategorias } from "./components/CadastroCategorias";
import { CadastroTabelasPreco } from "./components/CadastroTabelasPreco";
import { CadastroValoresHoraRecurso } from "./components/CadastroValoresHoraRecurso";
import { CadastroCategoriaxAtuacao } from "./components/CadastroCategoriaxAtuacao";
import { CadastroServicos } from "./components/CadastroServicos";
import { GestaoPerfis } from "./components/GestaoPerfis";
import { CadastroProjetos } from "./components/CadastroProjetos";
import { GestaoNotificacoes } from "./components/GestaoNotificacoes";
import { BoardTarefas } from "./components/BoardTarefas";
import DistribuicaoHoras from "./components/DistribuicaoHoras";
import SolicitacaoHorasAdicionais from "./components/SolicitacaoHorasAdicionais";
import AutorizacaoHorasAdicionais from "./components/AutorizacaoHorasAdicionais";
import AprovacaoOrcamento from "./components/AprovacaoOrcamento";
import VisaoGeral from "./components/VisaoGeral";
import ResumoRecurso from "./components/ResumoRecurso";
import ResumoEquipe from "./components/ResumoEquipe";
import {
  Users,
  UsersRound,
  Tag,
  DollarSign,
  Clock,
  Layers,
  Briefcase,
  CalendarClock,
  PlusCircle,
  CheckSquare,
  FileCheck,
  Bell,
  LayoutDashboard,
  BarChart2,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Settings,
  Search,
  FolderOpen,
  Link,
} from "lucide-react";

/* MARKER-MAKE-KIT-INVOKED */

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  section: string;
};

const menuItems: MenuItem[] = [
  { id: "pessoas", label: "Pessoas", icon: <Users size={16} />, section: "Cadastros" },
  { id: "equipes", label: "Organização", icon: <UsersRound size={16} />, section: "Cadastros" },
  { id: "gerenciador-perfis", label: "Gerenciador de Perfis", icon: <Users size={16} />, section: "Cadastros" },
  { id: "gerenciador-avisos", label: "Gerenciador de Avisos", icon: <Bell size={16} />, section: "Cadastros" },
  { id: "tabelas-preco", label: "Tabelas de Preço", icon: <DollarSign size={16} />, section: "Recursos" },
  { id: "valores-hora", label: "Valores Hora Recurso", icon: <Clock size={16} />, section: "Recursos" },
  { id: "cat-atuacao", label: "Categoria × Atuação por Recurso", icon: <Layers size={16} />, section: "Recursos" },
  { id: "autorizacao-horas", label: "Autorização de Horas Adicionais", icon: <CheckSquare size={16} />, section: "Aprovações" },
  { id: "aprovacao-orcamento", label: "Aprovação de Orçamento", icon: <FileCheck size={16} />, section: "Aprovações" },
  { id: "board-tarefas", label: "Board de Tarefas", icon: <LayoutDashboard size={16} />, section: "Gestão de Tarefas" },
  { id: "categorias", label: "Categorias", icon: <Tag size={16} />, section: "Gestão de Tarefas" },
  { id: "atuacoes", label: "Atuações", icon: <Briefcase size={16} />, section: "Gestão de Tarefas" },
  { id: "labels", label: "Labels", icon: <Tag size={16} />, section: "Gestão de Tarefas" },
  { id: "vinculos-labels", label: "Vínculos e Regras das Labels", icon: <Link size={16} />, section: "Gestão de Tarefas" },
  { id: "relatorios-visao-geral", label: "Visão Geral", icon: <BarChart2 size={16} />, section: "Análise" },
  { id: "relatorios-resumo-recurso", label: "Resumo por Recurso", icon: <BarChart2 size={16} />, section: "Análise" },
  { id: "relatorios-resumo-equipe", label: "Resumo por Equipe", icon: <BarChart2 size={16} />, section: "Análise" },
  
  { id: "servicos", label: "Serviços", icon: <Briefcase size={16} />, section: "Gestão" },
  { id: "distribuicao-horas", label: "Distribuição de Horas", icon: <CalendarClock size={16} />, section: "Gestão" },
  { id: "solicitacao-horas", label: "Solicitação de Horas Adicionais", icon: <PlusCircle size={16} />, section: "Gestão" },
  { id: "projetos", label: "Projetos", icon: <FolderOpen size={16} />, section: "Gestão" },
];

const sections = Array.from(new Set(menuItems.map((m) => m.section)));

function groupBySection(items: MenuItem[]) {
  return sections.map((section) => ({
    section,
    items: items.filter((m) => m.section === section),
  }));
}

const contentPlaceholders: Record<string, { title: string; description: string }> = {
  pessoas: { title: "Pessoas", description: "Gerencie o cadastro de pessoas — colaboradores, parceiros e contatos." },
  equipes: { title: "Organização", description: "Estruture as divisões da empresa, hierarquia organizacional e responsáveis." },
  atuacoes: { title: "Atuações", description: "Cadastre e gerencie os tipos de atuação disponíveis para os recursos." },
  categorias: { title: "Categorias", description: "Defina e organize as categorias utilizadas no sistema." },
  "tabelas-preco": { title: "Tabelas de Preço", description: "Mantenha as tabelas de preço associadas a serviços e recursos." },
  "valores-hora": { title: "Valores Hora Recurso", description: "Configure o valor-hora por recurso para cálculo de custos." },
  "cat-atuacao": { title: "Categoria × Atuação por Recurso", description: "Associe categorias a tipos de atuação por recurso." },
  projetos: { title: "Projetos", description: "Gerencie os projetos da organização, seus responsáveis e status." },
  servicos: { title: "Serviços", description: "Cadastre e gerencie os serviços prestados pela organização." },
  "distribuicao-horas": { title: "Distribuição de Horas", description: "Planeje e distribua a alocação de horas por equipe e período." },
  "solicitacao-horas": { title: "Solicitação de Horas Adicionais", description: "Registre solicitações de horas além da carga normal." },
  "autorizacao-horas": { title: "Autorização de Horas Adicionais", description: "Analise e autorize solicitações de horas adicionais pendentes." },
  "aprovacao-orcamento": { title: "Aprovação de Orçamento", description: "Revise e aprove orçamentos submetidos pelas equipes." },
  "gerenciador-avisos": { title: "Gerenciador de Avisos", description: "Crie e gerencie comunicados e avisos para as equipes." },
  "board-tarefas": { title: "Board de Tarefas", description: "Visualize e gerencie tarefas em formato kanban." },
  labels: { title: "Labels", description: "Crie e gerencie etiquetas para classificação de tarefas e registros." },
  "vinculos-labels": { title: "Vínculos e Regras das Labels", description: "Defina regras e vínculos entre labels, projetos e categorias." },
  "relatorios-visao-geral": { title: "Visão Geral", description: "Dashboard consolidado com indicadores principais do sistema." },
  "relatorios-resumo-recurso": { title: "Resumo por Recurso", description: "Relatório detalhado de alocação e tempos por recurso." },
  "relatorios-resumo-equipe": { title: "Resumo por Equipe", description: "Relatório de performance e distribuição de horas por equipe." },
  
};

export default function App() {
  const [activeItem, setActiveItem] = useState("board-tarefas");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = search.trim()
    ? menuItems.filter((m) => m.label.toLowerCase().includes(search.toLowerCase()))
    : menuItems;

  const grouped = groupBySection(filtered);
  const current = contentPlaceholders[activeItem];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div
          className="flex items-center justify-center rounded size-8 shrink-0"
          style={{ background: "var(--sidebar-primary)" }}
        >
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>GS</span>
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, lineHeight: "1.2" }}>
              Pace Service
            </div>
            <div style={{ color: "var(--sidebar-foreground)", fontSize: 11, opacity: 0.6 }}>
              ERP Corporativo
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div
            className="flex items-center gap-2 rounded px-3 py-1.5"
            style={{ background: "var(--sidebar-accent)", border: "1px solid var(--sidebar-border)" }}
          >
            <Search size={13} style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Buscar módulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full"
              style={{ color: "var(--sidebar-foreground)", fontSize: 12 }}
            />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: "none" }}>
        {grouped.map(({ section, items }) =>
          items.length === 0 ? null : (
            <div key={section} className="mb-3">
              {!collapsed && (
                <div
                  className="px-2 mb-1 uppercase tracking-widest"
                  style={{ color: "var(--sidebar-foreground)", fontSize: 10, opacity: 0.45, fontWeight: 600, letterSpacing: "0.1em" }}
                >
                  {section}
                </div>
              )}
              {items.map((item) => {
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveItem(item.id);
                      setMobileOpen(false);
                    }}
                    title={collapsed ? item.label : undefined}
                    className="flex items-center gap-3 w-full rounded px-2 py-1.5 mb-0.5 text-left transition-colors"
                    style={{
                      background: isActive ? "var(--sidebar-primary)" : "transparent",
                      color: isActive ? "#fff" : "var(--sidebar-foreground)",
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      opacity: isActive ? 1 : 0.8,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-accent)";
                        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.opacity = "0.8";
                      }
                    }}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && isActive && (
                      <ChevronRight size={12} className="ml-auto shrink-0" style={{ opacity: 0.6 }} />
                    )}
                  </button>
                );
              })}
            </div>
          )
        )}
        {filtered.length === 0 && (
          <div className="px-2 py-4 text-center" style={{ color: "var(--sidebar-foreground)", fontSize: 12, opacity: 0.5 }}>
            Nenhum módulo encontrado.
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 flex items-center gap-3" style={{ borderColor: "var(--sidebar-border)" }}>
        <div
          className="size-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--sidebar-accent)", color: "var(--sidebar-foreground)", fontSize: 11, fontWeight: 600 }}
        >
          AD
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>Admin</div>
            <div style={{ color: "var(--sidebar-foreground)", fontSize: 11, opacity: 0.5 }}>admin@empresa.com</div>
          </div>
        )}
        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded transition-colors"
              style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.5")}
              title="Configurações"
            >
              <Settings size={14} />
            </button>
            <button
              className="p-1 rounded transition-colors"
              style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.5")}
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="size-full flex overflow-hidden" style={{ background: "var(--background)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col h-full shrink-0 transition-all duration-200"
        style={{
          width: collapsed ? 56 : 240,
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative flex flex-col h-full z-10"
            style={{ width: 240, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center gap-3 px-5 py-3 shrink-0 border-b"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1 rounded transition-colors"
            style={{ color: "var(--foreground)" }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>

          {/* Collapse toggle — desktop */}
          <button
            className="hidden md:flex p-1 rounded transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)")}
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
            <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Sistema</span>
            <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} />
            <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 500 }}>
              {current?.title ?? "—"}
            </span>
          </div>

          {/* Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
            style={{ background: "var(--accent)", fontSize: 11, color: "var(--accent-foreground)", fontWeight: 500 }}
          >
            <Bell size={11} />
            <span>3 avisos</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {activeItem === "pessoas" && <CadastroPessoas />}
          {activeItem === "equipes" && <CadastroOrganizacao />}
          {activeItem === "atuacoes" && <CadastroAtuacoes />}
          {activeItem === "categorias" && <CadastroCategorias />}
          {activeItem === "tabelas-preco" && <CadastroTabelasPreco />}
          {activeItem === "valores-hora" && <CadastroValoresHoraRecurso />}
          {activeItem === "cat-atuacao" && <CadastroCategoriaxAtuacao />}
          {activeItem === "servicos" && <CadastroServicos />}
          {activeItem === "gerenciador-perfis" && <GestaoPerfis />}
          {activeItem === "projetos" && <CadastroProjetos />}
          {activeItem === "gerenciador-avisos" && <GestaoNotificacoes />}
          {activeItem === "board-tarefas" && <BoardTarefas />}
          {activeItem === "distribuicao-horas" && <DistribuicaoHoras />}
          {activeItem === "solicitacao-horas" && <SolicitacaoHorasAdicionais />}
          {activeItem === "autorizacao-horas" && <AutorizacaoHorasAdicionais />}
          {activeItem === "aprovacao-orcamento" && <AprovacaoOrcamento />}
          {activeItem === "relatorios-visao-geral" && <VisaoGeral />}
          {activeItem === "relatorios-resumo-recurso" && <ResumoRecurso />}
          {activeItem === "relatorios-resumo-equipe" && <ResumoEquipe />}
          {activeItem !== "pessoas" && activeItem !== "equipes" && activeItem !== "atuacoes" && activeItem !== "categorias" && activeItem !== "tabelas-preco" && activeItem !== "valores-hora" && activeItem !== "cat-atuacao" && activeItem !== "servicos" && activeItem !== "gerenciador-perfis" && activeItem !== "projetos" && activeItem !== "gerenciador-avisos" && activeItem !== "board-tarefas" && activeItem !== "distribuicao-horas" && activeItem !== "solicitacao-horas" && activeItem !== "autorizacao-horas" && activeItem !== "aprovacao-orcamento" && activeItem !== "relatorios-visao-geral" && activeItem !== "relatorios-resumo-recurso" && activeItem !== "relatorios-resumo-equipe" && current && (
            <div>
              {/* Page header */}
              <div className="mb-8">
                <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--foreground)", lineHeight: "1.3" }}>
                  {current.title}
                </h1>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
                  {current.description}
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total de Registros", value: "1.284", delta: "+12 esta semana" },
                  { label: "Ativos", value: "947", delta: "73,7% do total" },
                  { label: "Pendentes", value: "38", delta: "−5 vs semana passada" },
                  { label: "Atualizados Hoje", value: "21", delta: "última: 14:32" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg p-4 border"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: "var(--foreground)", lineHeight: "1" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>
                      {stat.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* Placeholder table */}
              <div
                className="rounded-lg border overflow-hidden"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>
                    Registros recentes
                  </span>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 12, fontWeight: 500 }}
                  >
                    <PlusCircle size={13} />
                    Novo Registro
                  </button>
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      {["#", "Nome / Referência", "Status", "Responsável", "Atualizado em"].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2.5 text-left border-b"
                          style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", borderColor: "var(--border)" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "001", name: "Entrada de exemplo alfa", status: "Ativo", resp: "Ana Costa", date: "10/06/2026" },
                      { id: "002", name: "Entrada de exemplo beta", status: "Pendente", resp: "Carlos Lima", date: "09/06/2026" },
                      { id: "003", name: "Entrada de exemplo gama", status: "Ativo", resp: "Fernanda Reis", date: "08/06/2026" },
                      { id: "004", name: "Entrada de exemplo delta", status: "Inativo", resp: "Roberto Dias", date: "07/06/2026" },
                      { id: "005", name: "Entrada de exemplo épsilon", status: "Ativo", resp: "Mariana Souza", date: "06/06/2026" },
                    ].map((row, i) => (
                      <tr
                        key={row.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--accent)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                      >
                        <td className="px-4 py-2.5" style={{ fontSize: 12, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
                          {row.id}
                        </td>
                        <td className="px-4 py-2.5" style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>
                          {row.name}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className="px-2 py-0.5 rounded-full"
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              background:
                                row.status === "Ativo" ? "#dcfce7" :
                                row.status === "Pendente" ? "#fef9c3" : "#fee2e2",
                              color:
                                row.status === "Ativo" ? "#15803d" :
                                row.status === "Pendente" ? "#a16207" : "#b91c1c",
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5" style={{ fontSize: 12, color: "var(--foreground)" }}>
                          {row.resp}
                        </td>
                        <td className="px-4 py-2.5" style={{ fontSize: 12, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
                          {row.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
