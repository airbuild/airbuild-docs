// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.airbuild.dev',
  integrations: [
    starlight({
      title: 'AirBuild Docs',
      description: 'OTA app distribution platform — upload builds, share install links, manage testers.',
      logo: {
        light: './src/assets/logo-light.png',
        dark: './src/assets/logo-dark.png',
        replacesTitle: true,
      },
      favicon: './src/assets/favicon.png',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/airbuild' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/airbuild' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
            { label: 'Create an Organization', slug: 'getting-started/organization' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Upload Builds', slug: 'guides/upload-builds' },
            { label: 'Install Links & QR Codes', slug: 'guides/install-links' },
            { label: 'iOS OTA Installation', slug: 'guides/ios-installation' },
            { label: 'Android APK Installation', slug: 'guides/android-installation' },
            { label: 'UDID Capture', slug: 'guides/udid-capture' },
            { label: 'Team Management', slug: 'guides/team-management' },
            { label: 'Billing & Plans', slug: 'guides/billing' },
          ],
        },
        {
          label: 'Developer',
          items: [
            { label: 'API Keys', slug: 'developer/api-keys' },
            { label: 'REST API Reference', slug: 'developer/api-reference' },
            { label: 'Webhooks', slug: 'developer/webhooks' },
            { label: 'CLI Tool', slug: 'developer/cli' },
            { label: 'SDKs', slug: 'developer/sdks' },
          ],
        },
        {
          label: 'Resources',
          items: [
            { label: 'FAQ', slug: 'resources/faq' },
            { label: 'Troubleshooting', slug: 'resources/troubleshooting' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
