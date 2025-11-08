"use client"

import { motion } from 'framer-motion'
import remarkGfm from 'remark-gfm'
import ReactMarkdown, { type Components } from 'react-markdown'
import { ScrollProgress } from '@/components/ui/scroll-progress'

type ArticlePageProps = {
  sectionLabel?: string
  title: string
  dek?: string | null
  author?: string | null
  publishedAt?: string | null
  content: string
  categories?: string[] | null
}

const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h2 className="mt-12 text-balance text-4xl font-semibold tracking-tight first:mt-0" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h3 className="mt-12 text-balance text-3xl font-semibold tracking-tight first:mt-0" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h4 className="mt-10 text-2xl font-semibold tracking-tight first:mt-0" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h5 className="mt-8 text-xl font-semibold tracking-tight first:mt-0" {...props} />
  ),
  h5: ({ node, ...props }) => (
    <h6 className="mt-8 text-lg font-semibold tracking-tight first:mt-0" {...props} />
  ),
  h6: ({ node, ...props }) => (
    <p className="mt-6 text-base font-semibold uppercase tracking-wider text-foreground/70 first:mt-0" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-6 text-lg leading-[1.9] text-foreground/85 first:mt-0" {...props} />
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
    <li className="pl-2 text-lg leading-relaxed text-foreground/85 marker:text-foreground/50" {...props} />
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
  strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
  em: ({ node, ...props }) => <em className="text-foreground/80" {...props} />,
  code: ({ node, className, children, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code
          className="rounded-md bg-foreground/5 px-2 py-0.5 text-[0.95rem] font-medium text-foreground"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        className="block overflow-x-auto rounded-2xl bg-foreground/5 p-6 text-[0.95rem] leading-relaxed text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ node, ...props }) => (
    <pre
      className="mt-8 overflow-x-auto rounded-2xl bg-foreground/5 p-6 text-[0.95rem] leading-relaxed text-foreground first:mt-0"
      {...props}
    />
  ),
  img: ({ node, ...props }) => (
    <img className="my-10 w-full rounded-3xl bg-foreground/5 object-cover" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="mt-8 overflow-hidden rounded-3xl border border-foreground/10">
      <table className="w-full border-collapse text-left text-lg text-foreground/85" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th className="border-b border-foreground/10 bg-foreground/5 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-foreground" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="border-b border-foreground/10 px-6 py-4 text-base text-foreground/80" {...props} />
  )
}

const easing = [0.19, 1, 0.22, 1] as [number, number, number, number]

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easing } }
}

const heroVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.12, duration: 0.7, ease: easing }
  })
}

const badgeListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.28 }
  }
}

const badgeVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easing } }
}

const bodyVariants = {
  hidden: { opacity: 0, y: 24, clipPath: 'inset(12% 0% 12% 0%)' },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.9, ease: easing, delay: 0.35 }
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function ArticlePage({
  sectionLabel,
  title,
  dek,
  author,
  publishedAt,
  content,
  categories
}: ArticlePageProps) {
  const formattedDate = formatDate(publishedAt)
  const normalizedCategories = categories
    ?.map((category) => category?.trim())
    .filter((category): category is string => Boolean(category && category.length > 0))

  return (
    <motion.article
      className="bg-gradient-to-b from-background via-background/98 to-background"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-28 sm:px-8">
        <ScrollProgress />
        <motion.div
          className="flex flex-col gap-6"
          initial="hidden"
          animate="visible"
        >
          {sectionLabel ? (
            <motion.span
              variants={heroVariants}
              custom={0}
              className="text-xs font-semibold uppercase tracking-[0.4em] text-foreground/60"
            >
              {sectionLabel}
            </motion.span>
          ) : null}
          {normalizedCategories && normalizedCategories.length > 0 ? (
            <motion.div
              className="flex flex-wrap gap-2"
              variants={badgeListVariants}
            >
              {normalizedCategories.map((category) => (
                <motion.span
                  key={category}
                  variants={badgeVariants}
                  className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-foreground/70"
                >
                  {category}
                </motion.span>
              ))}
            </motion.div>
          ) : null}
          <div className="space-y-6">
            <motion.h1
              variants={heroVariants}
              custom={1}
              className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            >
              {title}
            </motion.h1>
            {dek ? (
              <motion.p
                variants={heroVariants}
                custom={2}
                className="text-lg leading-relaxed text-foreground/70 sm:text-xl"
              >
                {dek}
              </motion.p>
            ) : null}
            {(author || formattedDate) ? (
              <motion.div
                variants={heroVariants}
                custom={3}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/60"
              >
                {author ? <span>By {author}</span> : null}
                {formattedDate ? (
                  <span className="flex items-center gap-2 before:block before:h-1 before:w-1 before:rounded-full before:bg-foreground/30 sm:before:h-1.5 sm:before:w-1.5 sm:before:rounded-full">
                    {formattedDate}
                  </span>
                ) : null}
              </motion.div>
            ) : null}
          </div>
        </motion.div>
        <motion.div
          className="mt-16"
          initial="hidden"
          animate="visible"
          variants={bodyVariants}
        >
          <div className="article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </motion.article>
  )
}
