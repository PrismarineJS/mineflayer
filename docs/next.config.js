const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});
 
module.exports = withNextra({
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en'
  },
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
});
