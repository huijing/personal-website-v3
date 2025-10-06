---
date: "2025-10-06T09:09:20+08:00"
slug: "migrating-from-hugo-to-astro"
og_image: /images/posts/hugo-to-astro.jpg
tags:
  - astro
  - devlife
title: "Migrating from Hugo to Astro"
---

I'm migrating my blog again. This blog has been in existence for more than 11 years. It started as a Jekyll site. Then I [moved to Hugo](/blog/migrating-from-jekyll-to-hugo/). Now I'm moving it to [Astro](https://astro.build/). The design has NEVER changed, which makes me quite contrarian to most frontend developers in the industry. But when I came up with the design back then, I wanted it to feel like me. And today, when I look at my blog, it still feels like me. I guess this says more about me as a person than my actual blog design, but I'm past the age where I care any more.

Hugo says I have 287 pages on my blog but I only have 226 blog posts <span class="emoji" role="img" tabindex="0" aria-label="thinking face">&#x1F914;</span>. But the point is, I have a lot of pages to migrate. Do I really have to port over everything, you might ask? Well, yes. I do. This is my entire web developer journey, how could I possibly leave anything behind? Also, why am I migrating to begin with? Honestly, I completely lost the plot with Hugo.

When they released their revamped template system in [v0.146.0](https://github.com/gohugoio/hugo/releases/tag/v0.146.0), I couldn't wrap my head around it. My listing pages all broke locally. If you check my blog statistics, I clearly haven't been writing that much since 2021 anyway, but I don't actually know Go or work on Hugo websites. So this is not a Hugo problem, it's a me problem. I also started living in Astro since 2023, when I was documentation infrastructure czar (this is a fake title) at the [Interledger Foundation](https://interledger.org/).

Needless to say, I have fallen in love with Astro and its fantastic community. I will always have good things to say about Astro. At this point in my career, I feel reasonably confident in my migration capabilities. I've built my career on similar projects, enough to learn that it's never easy, and things will break, but nothing can't be fixed. Probably not going to be a single day project this time though.

However, this is now a mid-sized website (that earns NOTHING, haha), so I did need to think through some migration strategies.

## Set up Astro site

I also love [bun](https://bun.com/). At first, it was because I liked the logo, because I'm superficial like that. But I've felt the benefits of its package manager, how it does `.env` files, how it supports TypeScript natively and so on. Yay, bun.

Anyway, first step was creating a new Astro project:

```bash
bunx create-astro@latest website
```

Astro [warns you](https://docs.astro.build/en/recipes/bun/) that using Astro with Bun is a little rough around the edges, but it was alright for me. I went with the blog template.

## Migrate generated components

The blog template has some Astro components like the site header and footer. I figured those could be the first things to go over. I did have quite a lot of template logic going on, but low-hanging fruit first tends to be how I do things. I had not looked at my styling code in years, but the Sass features I had been using are pretty much native CSS at this point, so this was a good time for a styles refactor.

I had previously broken up my files into different Sass files loosely based on Harry Robert's [ITCSS](https://www.creativebloq.com/web-design/manage-large-css-projects-itcss-101517528), so it did make porting over to Astro components relatively easy. I rewrote all the Sass back to native CSS because I really wasn't doing anything spectacular Sassy to begin with. Just some nesting and colour functions. Nothing today's native CSS couldn't handle.

Once the base styles came over, there was an illusion that things were progressing quickly. No, they were not. This was largely due to the amount of template logic I had introduced over the years. Porting over the stuff in the `head` element took a good while, because I had relied on a lot of post frontmatter to do that. So that also meant setting up the frontmatter in Astro via the _content.config.ts_ file.

I also needed to inject some logic into the [RSS feed implementation](https://docs.astro.build/en/recipes/rss/) because my blog listed writing that I did for external publications and I wanted the canonical links to point to those external URLs. The external URL thing ended up taking a lot more time than I expected, but at least it works now. By now the plan to migrate generated components first had gone out the window, because I got distracted by migrating pages instead.

```js
import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/consts";

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
      })),
  });
}
```

## Migrate pages

There were not that many pages (i.e. not blog posts) on my website, but the only straight-forward page was the "About" page. My "Talks" and "Work" pages were a combination of frontmatter filtering and looping over external data files. The meat of the site was my blog, so there was the full listing page, tag pages and the home page which showed the latest 10 posts. Also had a contact page, résumé page and custom 404 page.

By this point, I had fully realised that my brain reads Javascript with a fluency that does not exist for Hugo's style of Go templating syntax. Migrating the tag pages were a good example of this. For Astro, creating tag pages was a matter of filtering the blog [content collection](https://docs.astro.build/en/guides/content-collections/) for posts with tags in their frontmatter. I'll probably write up the details of the implementation in a separate post.

I also had data for my talk slides and side projects in separate YAML files, and had some logic that would display different URLs, if it should link to a blog post or an external URL. That logic in Hugo was… let's just say I'm not that great with double curly braces? I'm just more used to mapping arrays. Honestly, the most complicated logic was probably the `head` element if I'm being honest. Those OG tags, canonical URLs and `noindex` scenarios needed some extra scrutiny.

But in a nutshell, compare this:

<!-- prettier-ignore -->
```html
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name=viewport content="width=device-width, initial-scale=1">

  <title>{{ if .Params.title }}{{ .Params.title | safeHTML }}{{ else }}{{ .Site.Title }}{{ end }}</title>
  <meta name="description" content="{{ if (eq .Type "blog") }}{{ .Summary | truncate 130 }}{{ else }}{{ .Site.Params.description }}{{ end }}">

  {{ if .Params.noindex }}
  <meta name="robots" content="noindex">
  {{ end }}

  {{ template "_internal/opengraph.html" . }}
  {{ template "_internal/twitter_cards.html" . }}

  <meta name="twitter:site" content="@hj_chen">
  <meta name="p:domain_verify" content="1623582e8d2881f774efff746a6f3f1f">
  <meta name="msvalidate.01" content="30F5181A4C23EE64C2F947E2910DDBBA">

  {{ if .Params.external_url }}
  <link rel="canonical" href="{{ .Params.external_url }}">
  {{ else }}
  <link rel="canonical" href="{{ .Permalink }}">
  {{ end }}
  
  {{ with .OutputFormats.Get "RSS" -}}
    {{ printf `<link rel="%s" type="%s" href="%s" title="%s">` .Rel .MediaType.Type .Permalink $.Site.Title | safeHTML }}
  {{ end -}}
  
  <link href="https://micro.blog/huijing" rel="me">
  <link rel="monetization" href="https://ilp.gatehub.net/747467740/USD" />

  {{ if (eq .Type "blog") }}
  {{ $options := (dict "targetPath" "posts.css" "outputStyle" "compressed" "enableSourceMap" true) }}
  {{ $style := resources.Get "sass/posts.scss" | resources.ToCSS $options }}
  <link rel="stylesheet" href="{{ $style.RelPermalink }}">
  {{ else }}
  {{ $options := (dict "targetPath" "pages.css" "outputStyle" "compressed" "enableSourceMap" true) }}
  {{ $style := resources.Get "sass/pages.scss" | resources.ToCSS $options }}
  <link rel="stylesheet" href="{{ $style.RelPermalink }}">
  {{ end }}

  <link rel="preload" href="/assets/fonts/eightbitoperatorplus8-bold-webfont.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/eightbitoperatorplus-regular-webfont.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/magnetic-pro-black.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/magnetic-pro-light.woff2" as="font" type="font/woff2" crossorigin>
  
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png">
  <link rel="icon" type="image/png" href="/assets/favicons/favicon-32x32.png" sizes="32x32">
  <link rel="icon" type="image/png" href="/assets/favicons/favicon-16x16.png" sizes="16x16">
  <link rel="manifest" href="/assets/favicons/manifest.json">
  <link rel="mask-icon" href="/assets/favicons/safari-pinned-tab.svg" color="#009418">
  <link rel="shortcut icon" href="/assets/favicons/favicon.ico">
  <meta name="msapplication-config" content="/assets/favicons/browserconfig.xml">
  <meta name="theme-color" content="#ffffff">
</head>
```

with this:

<!-- prettier-ignore -->
```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="sitemap" href="/sitemap-index.xml" />
  <link rel="alternate" type="application/rss+xml" title={SITE_TITLE} href={new URL("rss.xml", Astro.site)}
  />
  <meta name="generator" content={Astro.generator} />

  <title>{title ? `${title} | ${SITE_TITLE}` : SITE_TITLE}</title>
  <meta name="author" content="Chen Hui Jing" />
  <meta name="title" content={title ? `${title} | ${SITE_TITLE}` : SITE_TITLE} />
  <meta name="description" content={description ? description : SITE_DESCRIPTION} />
  {noindex && <meta name="robots" content="noindex, nofollow" />}
  <link rel="canonical" href={canonicalURL} />

  <link rel="preload" href="/assets/fonts/eightbitoperatorplus8-bold-webfont.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/eightbitoperatorplus-regular-webfont.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/magnetic-pro-black.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/magnetic-pro-light.woff2" as="font" type="font/woff2" crossorigin>

  <meta property="og:title" content={title ? `${title} | ${SITE_TITLE}` : SITE_TITLE} />
  <meta property="og:type" content={ogType ? ogType : "website"} />
  <meta property="og:image" content={ogImageUrl ? ogImageUrl : new URL("/images/avatar-ponytail@2x.png", Astro.site).href} />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:description" content={description ? description : SITE_DESCRIPTION} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title ? `${title} | ${SITE_TITLE}` : SITE_TITLE} />
  <meta name="twitter:image" content={ogImageUrl ? ogImageUrl : new URL("/images/avatar-ponytail@2x.png", Astro.site).href} />
  <meta name="twitter:description" content={description ? description : SITE_DESCRIPTION} />

  <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
  <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16" />
  <link rel="manifest" href="/favicons/manifest.json" />
  <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#009418" />
  <link rel="shortcut icon" href="/favicons/favicon.ico" />
  <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
  <meta name="theme-color" content="#ffffff" />

  <meta name="twitter:site" content="@hj_chen" />
  <meta name="p:domain_verify" content="1623582e8d2881f774efff746a6f3f1f" />
  <meta name="msvalidate.01" content="30F5181A4C23EE64C2F947E2910DDBBA" />
  <link href="https://micro.blog/huijing" rel="me" />
  <link rel="monetization" href="https://ilp.gatehub.net/747467740/USD" />
</head>
```

## Migrate blog posts

For the blog posts themselves, my content had always been in markdown since day 1 (which would be 4257 days ago). However, given that this is my third migration, I have started to think more about the use of components to keep things DRY. I then recalled the first time I did the migration, I had similar concerns. It was evident, looking at the current state of the blog posts this time, that I was in two minds back then.

In that previous migration blogpost, former me literally said:

> But I oscillated between using Hugo’s custom shortcodes versus writing out HTML in full for my responsive images because I kept thinking what would happen if I migrated again. That would mean writing the stuff in the shortcodes within my content.

Somewhere along the lines in 2023, I sort of lost the plot, and ended up using shortcodes for a bit. Thankfully, my decreased writing output meant that it wasn't that much to deal with. But for now, I did create temporary components in Astro, that I plan to slowly migrate anyway from back to just the HTML in full. I hope I remember this, if not, it's gonna be kinda hilarious for migration number 3.

You know what, I'll create an issue to track this. I don't understand why previous me did not do this when all my stuff is on GitHub to begin with. <span class="emoji" role="img" tabindex="0" aria-label="face with rolling eyes">&#x1F644;</span>

Astro is a TypeScript-first kind of framework, so type safety is totally a thing. Anyway, the documentation states: “Every frontmatter or data property of your collection entries must be defined using a Zod data type”. Considering I had 1001 frontmatter properties for all kinds of rendering logic (see the above section), my schema was a little long-ish.

```ts
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: () =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      og_image: z.string().optional(),
      description: z.string().optional(),
      hastweet: z.boolean().default(false),
      hascaniuse: z.boolean().default(false),
      hascodepen: z.boolean().default(false),
      project: z.string().optional(),
      project_image: z.string().optional(),
      external_url: z.string().url().optional(),
      external_site: z.string().optional(),
      nofeed: z.boolean().default(false),
      noindex: z.boolean().default(false),
    }),
});
```

I had run the blog template when I first created the site and the schema had included `Image` as a type, and I'd thought to use it for my 2 image frontmatter properties but turns out, it doesn't really work? I did not dig into it but there was a [whole GitHub issue](https://github.com/withastro/astro/issues/12673) and the conclusion was, just use a string. <span class="kaomoji">¯\\\_(ツ)\_/¯ </span>

## Wrapping up

The first time I migrated, it took 3 days. This one sort of took 3 days as well. So maybe that's the average amount of time needed to migrate a website. I'm sure it will take less time if I ever complete paying off my tech debt of framework-locked partials/shortcodes/components. But maybe I'll actually stick with Astro since it's really close to HTML, CSS and Javascript.

Check back in 5 years I guess.
