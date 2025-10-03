import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'PromptHub v2',
  tagline: 'La Plataforma de IA que tu Empresa Necesita',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://prompthub.com',
  baseUrl: '/',

  organizationName: 'prompthub',
  projectName: 'prompthub-docs',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: undefined,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          routeBasePath: 'blog',
          blogTitle: 'Blog de PromptHub',
          blogDescription: 'Noticias, actualizaciones y mejores prácticas para aprovechar al máximo la IA',
          blogSidebarTitle: 'Últimos posts',
          blogSidebarCount: 'ALL',
          postsPerPage: 10,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/prompthub-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'PromptHub v2',
      logo: {
        alt: 'PromptHub Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'left'
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: '/',
          label: 'Volver a la App',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            {
              label: 'Introducción',
              to: '/docs/intro',
            },
            {
              label: 'Guía de Inicio',
              to: '/docs/getting-started',
            },
            {
              label: 'Mejores Prácticas',
              to: '/docs/best-practices',
            },
          ],
        },
        {
          title: 'API',
          items: [
            {
              label: 'Referencia Completa',
              to: '/docs/api/overview',
            },
            {
              label: 'Autenticación',
              to: '/docs/api/authentication',
            },
            {
              label: 'Endpoints',
              to: '/docs/api/endpoints',
            },
          ],
        },
        {
          title: 'Recursos',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Changelog',
              to: '/docs/changelog',
            },
            {
              label: 'Soporte',
              href: 'mailto:support@prompthub.com',
            },
          ],
        },
        {
          title: 'Empresa',
          items: [
            {
              label: 'Acerca de',
              href: '/#about',
            },
            {
              label: 'Precios',
              href: '/#pricing',
            },
            {
              label: 'Contacto',
              href: 'mailto:hello@prompthub.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} PromptHub. Todos los derechos reservados.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'python', 'php', 'ruby'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
