const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});
 
module.exports = withNextra({
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
});
