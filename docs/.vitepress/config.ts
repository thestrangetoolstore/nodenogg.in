import { defineConfig } from "vitepress";

export default defineConfig({
  title: "nodenogg.in",
  lang: "en-GB",
  description: "Guides for using nodenogg.in",
  ignoreDeadLinks: true,
  cleanUrls: true,
  base: "/",
  // lastUpdated: true,
  themeConfig: {
    // lastUpdated: {
    //   text: "Last updated",
    //   formatOptions: {
    //     dateStyle: "full",
    //     timeStyle: "medium"
    //   }
    // },
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
            text: "How",
            link: "/guide/how",
          },
          {
            text: "Scenerios",
            link: "/guide/scenerios",
          },
          {
            text: "Features",
            link: "/guide/features",
          },
          {
            text: "Terminnology",
            link: "/guide/terminology",
          },
          {
            text: "FAQ's",
            link: "/guide/faq",
          },
          {
            text: "Why",
            link: "/guide/why",
          },
          {
            text: "Testimonials",
            link: "/guide/testimonials",
          },
          {
            text: "Feedback",
            link: "/guide/feedback",
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

      // {
      //   text: "Software Architecture",
      //   items: [
      //     { text: "Roadmap", link: "/roadmap" },
      //     {
      //       text: "Overview",
      //       link: "/architecture/01-overview",
      //     },
      //     {
      //       text: "Codebase",
      //       link: "/architecture/02-codebase",
      //     },
      //     {
      //       text: "Data",
      //       link: "/architecture/03-data",
      //     },
      //     {
      //       text: "Sync",
      //       link: "/architecture/04-sync",
      //     },
      //     {
      //       text: "Agents",
      //       link: "/architecture/05-agents",
      //     },
      //     {
      //       text: "Views",
      //       link: "/architecture/06-views",
      //     },
      //     {
      //       text: "Open questions",
      //       link: "/architecture/07-open-questions",
      //     },
      //   ],
      // },
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
