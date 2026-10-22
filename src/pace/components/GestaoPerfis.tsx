import { Fragment, useState } from "react";
import {
  Shield,
  Plus,
  Crown,
  BarChart3,
  UserCheck,
  Eye,
  Check,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

type ScreenDef = { id: string; label: string };
type ModuleDef = { id: string; label: string; screens: ScreenDef[] };

const modules: ModuleDef[] = [
  {
    id: "cadastros",
    label: "Cadastros",
    screens: [
      { id: "pessoas", label: "Pessoas" },
      { id: "organizacao", label: "Organização" },
      { id: "atuacoes", label: "Atuações" },
      { id: "categorias", label: "Categorias" },
    ],
  },
  {
    id: "recursos",
    label: "Recursos",
    screens: [
      { id: "tabela-precos", label: "Tabela de Preços" },
      { id: "valores-hora", label: "Valores Hora Recurso" },
      { id: "cat-atuacao", label: "Categoria × Atuação por Recurso" },
    ],
  },
  {
    id: "operacional",
    label: "Operacional",
    screens: [
      { id: "projetos", label: "Projetos" },
      { id: "servicos", label: "Serviços" },
      { id: "distribuicao", label: "Distribuição de Horas" },
      { id: "solicitacao", label: "Solicitação de Horas Adicionais" },
      { id: "avisos", label: "Gerenciador de Avisos" },
    ],
  },
  {
    id: "aprovacoes",
    label: "Aprovações",
    screens: [
      { id: "autorizacao-horas", label: "Autorização de Horas Adicionais" },
      { id: "aprovacao-orcamento", label: "Aprovação de Orçamento" },
    ],
  },
  {
    id: "gestao-tarefas",
    label: "Gestão de Tarefas",
    screens: [
      { id: "board", label: "Board de Tarefas" },
      { id: "labels", label: "Labels" },
      { id: "vinculos", label: "Vínculos e Regras das Labels" },
    ],
  },
  {
    id: "analise",
    label: "Análise",
    screens: [{ id: "relatorios", label: "Relatórios" }],
  },
];

type Perms = [boolean, boolean, boolean, boolean]; // ver, criar, editar, excluir
type PermissionMatrix = Record<string, Perms>;

type Profile = {
  id: string;
  name: string;
  description: string;
  icon: "crown" | "chart" | "user-check" | "eye";
  color: "amber" | "purple" | "green" | "gray";
  users: number;
  permissions: PermissionMatrix;
};

function buildMatrix(filler: (screenId: string) => Perms): PermissionMatrix {
  const m: PermissionMatrix = {};
  modules.forEach((mod) =>
    mod.screens.forEach((s) => {
      const key = `${mod.id}.${s.id}`;
      m[key] = filler(key);
    }),
  );
  return m;
}

const allTrue: Perms = [true, true, true, true];
const allFalse: Perms = [false, false, false, false];

const initialProfiles: Profile[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total ao sistema e configurações",
    icon: "crown",
    color: "amber",
    users: 2,
    permissions: buildMatrix(() => [...allTrue] as Perms),
  },
  {
    id: "gestor",
    name: "Gestor",
    description: "Relatórios, aprovações e gestão de área",
    icon: "chart",
    color: "purple",
    users: 3,
    permissions: buildMatrix((k) => {
      if (k.startsWith("aprovacoes.")) return [true, true, true, false];
      if (k.startsWith("analise.")) return [true, true, false, false];
      if (k.startsWith("operacional.")) return [true, true, true, false];
      if (k.startsWith("gestao-tarefas.")) return [true, true, true, false];
      return [true, false, false, false];
    }),
  },
  {
    id: "recurso",
    name: "Recurso",
    description: "Lançamento e edição de dados do dia a dia",
    icon: "user-check",
    color: "green",
    users: 8,
    permissions: buildMatrix((k) => {
      if (k === "operacional.distribuicao" || k === "operacional.solicitacao")
        return [true, true, true, false];
      if (k.startsWith("gestao-tarefas.")) return [true, true, true, false];
      if (k.startsWith("analise.")) return [true, false, false, false];
      return [true, false, false, false];
    }),
  },
  {
    id: "visualizador",
    name: "Visualizador",
    description: "Somente leitura, sem edição",
    icon: "eye",
    color: "gray",
    users: 4,
    permissions: buildMatrix(() => [true, false, false, false] as Perms),
  },
];

const iconMap = {
  crown: Crown,
  chart: BarChart3,
  "user-check": UserCheck,
  eye: Eye,
};

const colorMap: Record<Profile["color"], { bg: string; fg: string }> = {
  amber: { bg: "#fef3c7", fg: "#b45309" },
  purple: { bg: "#ede9fe", fg: "#6d28d9" },
  green: { bg: "#d1fae5", fg: "#047857" },
  gray: { bg: "#e5e7eb", fg: "#4b5563" },
};

const PRIMARY = "#1a56db";

export function GestaoPerfis() {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [selectedId, setSelectedId] = useState<string>(initialProfiles[0].id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selected = profiles.find((p) => p.id === selectedId)!;

  const updateSelected = (patch: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === selectedId ? { ...p, ...patch } : p)),
    );
  };

  const togglePerm = (key: string, idx: number) => {
    const current = selected.permissions[key] ?? allFalse;
    const next = [...current] as Perms;
    next[idx] = !next[idx];
    updateSelected({
      permissions: { ...selected.permissions, [key]: next },
    });
  };

  const handleSave = () => {
    if (!selected.name.trim()) {
      toast.error("Informe o nome do perfil.");
      return;
    }
    toast.success(`Perfil "${selected.name}" salvo com sucesso.`);
  };

  const handleDelete = () => {
    const remaining = profiles.filter((p) => p.id !== selectedId);
    if (remaining.length === 0) {
      toast.error("Não é possível excluir o último perfil.");
      setConfirmDelete(false);
      return;
    }
    setProfiles(remaining);
    setSelectedId(remaining[0].id);
    setConfirmDelete(false);
    toast.success(`Perfil "${selected.name}" excluído.`);
  };

  const handleNew = () => {
    const id = `perfil-${Date.now()}`;
    const novo: Profile = {
      id,
      name: "Novo perfil",
      description: "",
      icon: "user-check",
      color: "gray",
      users: 0,
      permissions: buildMatrix(() => [...allFalse] as Perms),
    };
    setProfiles((prev) => [...prev, novo]);
    setSelectedId(id);
  };

  return (
    <div className="min-h-full space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827" }}>
              Gestão de Perfis
            </h1>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              Defina perfis de acesso e configure permissões por módulo do sistema.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border bg-white text-sm hover:bg-gray-50"
            style={{ borderColor: "#d1d5db", color: "#374151" }}
          >
            Fechar
          </button>
        </div>

        {/* Card 1 — Perfis cadastrados */}
        <section className="bg-white rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "#e5e7eb" }}
          >
            <div className="flex items-center gap-2">
              <Shield size={18} style={{ color: PRIMARY }} />
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                Perfis cadastrados
              </h2>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-white text-sm font-medium"
              style={{ background: PRIMARY }}
            >
              <Plus size={14} />
              Novo perfil
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profiles.map((p) => {
              const isSel = p.id === selectedId;
              const Icon = iconMap[p.icon];
              const c = colorMap[p.color];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className="text-left rounded-lg p-4 transition-all"
                  style={{
                    background: isSel ? "#f0f5ff" : "#fff",
                    border: isSel ? `2px solid ${PRIMARY}` : "1px solid #e5e7eb",
                  }}
                >
                  <div
                    className="size-10 rounded-full flex items-center justify-center mb-3"
                    style={{ background: c.bg, color: c.fg }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, minHeight: 32 }}>
                    {p.description}
                  </div>
                  <span
                    className="inline-block mt-3 px-2 py-0.5 rounded-full"
                    style={{ background: "#dbeafe", color: "#1e40af", fontSize: 11, fontWeight: 500 }}
                  >
                    {p.users} usuário{p.users === 1 ? "" : "s"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Card 2 — Editar perfil */}
        <section className="bg-white rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
          <div
            className="flex items-center justify-between px-5 py-4 border-b gap-3 flex-wrap"
            style={{ borderColor: "#e5e7eb" }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
              Editar perfil —{" "}
              <span style={{ color: PRIMARY }}>{selected.name}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium hover:bg-red-50"
                style={{ borderColor: "#fecaca", color: "#dc2626" }}
              >
                <Trash2 size={14} />
                Excluir
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-white text-sm font-medium"
                style={{ background: PRIMARY }}
              >
                <Check size={14} />
                Salvar
              </button>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
                  Nome do perfil
                </label>
                <input
                  type="text"
                  value={selected.name}
                  onChange={(e) => updateSelected({ name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded border outline-none text-sm focus:ring-2"
                  style={{ borderColor: "#d1d5db" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
                  Descrição
                </label>
                <input
                  type="text"
                  value={selected.description}
                  onChange={(e) => updateSelected({ description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded border outline-none text-sm focus:ring-2"
                  style={{ borderColor: "#d1d5db" }}
                />
              </div>
            </div>

            {/* Matriz */}
            <div>
              <div
                className="mb-2 uppercase tracking-wider"
                style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}
              >
                Matriz de permissões
              </div>
              <div className="overflow-x-auto border rounded" style={{ borderColor: "#e5e7eb" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th
                        className="text-left px-4 py-2"
                        style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}
                      >
                        Módulo / Tela
                      </th>
                      {["Visualizar", "Criar", "Editar", "Excluir"].map((h) => (
                        <th
                          key={h}
                          className="text-center px-4 py-2"
                          style={{ fontSize: 12, color: "#374151", fontWeight: 600, width: 100 }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((mod) => (
                      <Fragment key={mod.id}>
                        <tr style={{ background: "#f3f4f6" }}>
                          <td
                            colSpan={5}
                            className="px-4 py-1.5 uppercase tracking-wider"
                            style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}
                          >
                            {mod.label}
                          </td>
                        </tr>
                        {mod.screens.map((s) => {
                          const key = `${mod.id}.${s.id}`;
                          const perms = selected.permissions[key] ?? allFalse;
                          return (
                            <tr
                              key={key}
                              className="border-t hover:bg-gray-50"
                              style={{ borderColor: "#f3f4f6" }}
                            >
                              <td className="px-4 py-2" style={{ color: "#111827", fontSize: 13 }}>
                                {s.label}
                              </td>
                              {perms.map((v, i) => (
                                <td key={i} className="text-center px-4 py-2">
                                  <input
                                    type="checkbox"
                                    checked={v}
                                    onChange={() => togglePerm(key, i)}
                                    className="size-4 cursor-pointer"
                                    style={{ accentColor: PRIMARY }}
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                Excluir perfil
              </h3>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4" style={{ fontSize: 13, color: "#374151" }}>
              Tem certeza que deseja excluir o perfil{" "}
              <strong>{selected.name}</strong>? Esta ação não pode ser desfeita.
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "#e5e7eb" }}>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded border text-sm"
                style={{ borderColor: "#d1d5db", color: "#374151" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded text-white text-sm font-medium"
                style={{ background: "#dc2626" }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
