import { permanentRedirect } from "next/navigation";

type CardSlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        query.append(key, entry);
      }
      continue;
    }

    if (typeof value === "string") {
      query.set(key, value);
    }
  }

  const queryText = query.toString();
  return queryText.length > 0 ? `?${queryText}` : "";
}

export default async function CardSlugPage({
  params,
  searchParams,
}: CardSlugPageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const query = toQueryString(await searchParams);

  permanentRedirect(`/${encodeURIComponent(normalizedSlug)}${query}`);
}
