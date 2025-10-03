import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Introducción',
      items: [
        'intro',
        'getting-started',
        'quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Guías',
      items: [
        'guides/creating-prompts',
        'guides/using-playground',
        'guides/managing-tokens',
        'guides/team-collaboration',
      ],
    },
    {
      type: 'category',
      label: 'Características',
      items: [
        'features/multi-model-support',
        'features/prompt-versioning',
        'features/analytics',
        'features/media-prompts',
      ],
    },
    {
      type: 'category',
      label: 'Administración',
      items: [
        'admin/overview',
        'admin/user-management',
        'admin/system-settings',
        'admin/security',
      ],
    },
    {
      type: 'doc',
      id: 'best-practices',
    },
    {
      type: 'doc',
      id: 'changelog',
    },
  ],

  apiSidebar: [
    {
      type: 'doc',
      id: 'api/overview',
    },
    {
      type: 'doc',
      id: 'api/authentication',
    },
    {
      type: 'category',
      label: 'Endpoints',
      items: [
        'api/endpoints/prompts',
        'api/endpoints/execute',
        'api/endpoints/improve',
        'api/endpoints/translate',
        'api/endpoints/users',
      ],
    },
    {
      type: 'doc',
      id: 'api/rate-limits',
    },
    {
      type: 'doc',
      id: 'api/errors',
    },
    {
      type: 'doc',
      id: 'api/webhooks',
    },
    {
      type: 'category',
      label: 'Ejemplos',
      items: [
        'api/examples/node',
        'api/examples/python',
        'api/examples/php',
        'api/examples/curl',
      ],
    },
  ],
};

export default sidebars;
