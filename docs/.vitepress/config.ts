import { defineConfig } from "vitepress";

export default defineConfig({
  title: "nodenogg.in",
  lang: "en-GB",
  description: "Guide to the nodenogg.in project",
  ignoreDeadLinks: true,
  cleanUrls: true,
  themeConfig: {
    footer: {
      copyright: "Made by Winchester School of Art, University of Southampton. All rights reserved.",
    },
    search: {
      provider: "local",
    },
    sidebar: [
      {
        text: "Welcome",
        items: [
          {
            text: "Introduction", link: "/introduction",
          },
          {
            text: "Roadmap", link: "/roadmap",
          },
          {
            text: "History", link: "/history",
          },
          {
            text: "About", link: "/about",
          },
        ]
      },
      {
        text: "Guides",
        items: [
          {
            text: "Getting Started",
            link: "/guide/getting-started",
          },
          {
            text: "Testimonials",
            link: "/guide/testimonials",
          },
        ],
      },

      {
        text: "Education Technology",
        items: [
          {
            text: "Principles",
            link: "/edtech/principles",
          },
        ],
      },

      {
        text: "Software Architecture",
        items: [
          { text: "Roadmap", link: "/architecture/roadmap" },
          {
            text: "Overview",
            link: "/architecture/01-overview",
          },
          {
            text: "Codebase",
            link: "/architecture/02-codebase",
          },
          {
            text: "Data",
            link: "/architecture/03-data",
          },
          {
            text: "Sync",
            link: "/architecture/04-sync",
          },
          {
            text: "Agents",
            link: "/architecture/05-agents",
          },
          {
            text: "Views",
            link: "/architecture/06-views",
          },
          {
            text: "Open questions",
            link: "/architecture/07-open-questions",
          },
        ],
      },
      {
        text: "Development",
        items: [
          { text: "Changelog", link: "/CHANGELOG" },
          { text: "Release Workflow", link: "/technical/release-workflow" },
        ],
      },
    ],
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
  },
});
