export const SITE_NAME = "Gen Uprising";

export function getSiteUrl(): URL {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_URL;

  if (configured) {
    const value = /^https?:\/\//i.test(configured)
      ? configured
      : `https://${configured}`;
    return new URL(value);
  }

  return new URL("http://localhost:3000");
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString();
}
