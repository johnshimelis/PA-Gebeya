const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

// Manually define your routes here
const routes = [
  '/',
  '/about',
  '/contact',
  '/products',
  '/products/:id', // Dynamic routes
];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://www.pegebeya.com' });

  // Convert routes into a readable stream
  const stream = Readable.from(routes.map(route => ({ url: route, changefreq: 'daily', priority: 0.7 })));

  // Pipe the routes to the sitemap stream
  stream.pipe(sitemap);

  const sitemapBuffer = await streamToPromise(sitemap).then((data) => data.toString());

  // Write the sitemap.xml to the public folder
  fs.writeFileSync('./public/sitemap.xml', sitemapBuffer);

  console.log('Sitemap generated!');
}

generateSitemap();
