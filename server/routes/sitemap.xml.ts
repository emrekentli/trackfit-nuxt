export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const requestUrl = getRequestURL(event);
  const siteUrl = config.public.siteUrl || requestUrl.origin;

  const routes = [
    { path: '/', changefreq: 'weekly', priority: 1.0 },
  ];

  const urls = routes
    .map(
      (route) =>
        `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  event.node.res.setHeader('Content-Type', 'application/xml');
  return xml;
});
