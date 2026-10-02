import Link from "next/link";

type Breadcrumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-foreground/60">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${item.href ?? "current"}`}
            className="flex items-center gap-2"
          >
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link
                className="underline-offset-4 hover:underline"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
