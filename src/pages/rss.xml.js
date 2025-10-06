import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/consts";
import { createExcerpt } from "@/utils";

export async function GET(context) {
  const posts = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts
      .sort((a, b) => +new Date(b.data.date) - +new Date(a.data.date))
      .filter((post) => !post.data.nofeed)
      .map((post) => ({
        ...post.data,
        link: post.data.external_url ? post.data.external_url : `/blog/${post.id}/`,
        pubDate: new Date(post.data.date),
        description: post.data.description || createExcerpt(post.body, 160),
      })),
  });
}
