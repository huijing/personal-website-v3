import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/consts";
import { createExcerpt } from "@/utils";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: true, linkify: true });

export async function GET(context) {
  const posts = await getCollection("blog");

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts
      .sort((a, b) => +new Date(b.data.date) - +new Date(a.data.date))
      .filter((post) => !post.data.nofeed)
      .map((post) => {
        const link = post.data.external_url
          ? post.data.external_url
          : new URL(`/blog/${post.id}/`, context.site).href;
        const description = post.data.description ?? createExcerpt(post.body ?? "", 160);
        const fullHtml = md.render(post.body ?? "");

        return {
          title: post.data.title,
          link,
          pubDate: new Date(post.data.date),
          description,
          content: fullHtml,
        };
      }),
  });
}
