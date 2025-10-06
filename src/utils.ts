import MarkdownIt from "markdown-it";
import { convert } from "html-to-text";
const parser = new MarkdownIt();

export const createExcerpt = (body: string | undefined, maxLength = 160): string => {
  if (!body) return "";
  const html = parser.render(body);
  const options = {
    wordwrap: null,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
      { selector: "figure", format: "skip" },
    ],
  };
  const text = convert(html, options).replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const excerpt = truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim();

  return `${excerpt}…`;
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};
