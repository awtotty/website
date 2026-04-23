import { getCollection } from "astro:content";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toRFC822(d: Date): string {
  return d.toUTCString();
}

export async function GET() {
  const posts = await getCollection("blog");
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const siteUrl = "https://austin-totty.com";

  const items = sorted
    .map(
      (post) => `
    <item>
      <title>${xmlEscape(post.data.title)}</title>
      <link>${xmlEscape(`${siteUrl}/blog/${post.id}`)}</link>
      <description>${xmlEscape(post.data.description)}</description>
      <pubDate>${toRFC822(post.data.date)}</pubDate>
      <guid>${xmlEscape(`${siteUrl}/blog/${post.id}`)}</guid>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Austin Totty</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>Thoughts on software, design, and whatever else.</description>
    <language>en-us</language>
    <atom:link href="${xmlEscape(`${siteUrl}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />
    <atom:link href="${xmlEscape(`${siteUrl}/blog/rss.xml`)}" rel="hub" />${items}
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}