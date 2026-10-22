import { createFileRoute } from "@tanstack/react-router";
import App from "@/pace/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pace Service" },
      {
        name: "description",
        content:
          "Streamline project management with comprehensive tools for team collaboration, resource allocation, budgeting, and reporting for efficient workflow.",
      },
      { property: "og:title", content: "Pace Service" },
      {
        property: "og:description",
        content:
          "Gestão de projetos, equipes, recursos e orçamentos em um só lugar.",
      },
    ],
  }),
  component: App,
});
