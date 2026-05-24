"use client";

import Image from "next/image";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h2
      className="mt-12 text-balance text-4xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h3
      className="mt-12 text-balance text-3xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h4
      className="mt-10 text-2xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h4: ({ node, ...props }) => (
    <h5
      className="mt-8 text-xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h5: ({ node, ...props }) => (
    <h6
      className="mt-8 text-lg font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h6: ({ node, ...props }) => (
    <p
      className="mt-6 text-base font-semibold uppercase tracking-wider text-foreground/70 first:mt-0"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p
      className="mt-6 text-lg leading-[1.9] text-foreground/85 first:mt-0"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="mt-6 list-disc space-y-3 pl-6 text-lg leading-relaxed text-foreground/85 first:mt-0"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="mt-6 list-decimal space-y-3 pl-6 text-lg leading-relaxed text-foreground/85 first:mt-0"
      {...props}
    />
  ),
  li: ({ node, ...props }) => (
    <li
      className="pl-2 text-lg leading-relaxed text-foreground/85 marker:text-foreground/50"
      {...props}
    />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="mt-8 border-l-2 border-foreground/20 pl-6 text-xl italic text-foreground/70 first:mt-0"
      {...props}
    />
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-12 border-foreground/10" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a
      className="font-medium text-foreground underline decoration-foreground/40 decoration-2 underline-offset-4 transition hover:decoration-foreground"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: ({ node, ...props }) => <em className="text-foreground/80" {...props} />,
  code: ({ node, className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded-md bg-foreground/5 px-2 py-0.5 text-[0.95rem] font-medium text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="block overflow-x-auto rounded-2xl bg-foreground/5 p-6 text-[0.95rem] leading-relaxed text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => (
    <pre
      className="mt-8 overflow-x-auto rounded-2xl bg-foreground/5 p-6 text-[0.95rem] leading-relaxed text-foreground first:mt-0"
      {...props}
    />
  ),
  img: ({ node, ...props }) => {
    const src = typeof props.src === "string" ? props.src : "";
    if (!src) return null;
    return (
      <Image
        src={src}
        alt={typeof props.alt === "string" ? props.alt : ""}
        width={1600}
        height={900}
        unoptimized
        className="my-10 h-auto w-full rounded-3xl bg-foreground/5 object-cover"
      />
    );
  },
  table: ({ node, ...props }) => (
    <div className="mt-8 overflow-hidden rounded-3xl border border-foreground/10">
      <table
        className="w-full border-collapse text-left text-lg text-foreground/85"
        {...props}
      />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th
      className="border-b border-foreground/10 bg-foreground/5 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-foreground"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td
      className="border-b border-foreground/10 px-6 py-4 text-base text-foreground/80"
      {...props}
    />
  ),
};

type ArticleMarkdownProps = {
  content: string;
  className?: string;
};

export function ArticleMarkdown({ content, className }: ArticleMarkdownProps) {
  return (
    <div className={className ?? "article-body"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export { markdownComponents };
