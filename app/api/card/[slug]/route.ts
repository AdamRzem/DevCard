import { NextResponse } from "next/server";

import {
  getPublicCardBySlug,
  incrementCardViewCount,
} from "@/lib/supabase/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CardRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export async function GET(_request: Request, { params }: CardRouteContext) {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return NextResponse.json(
      {
        error: "Card not found.",
      },
      { status: 404 },
    );
  }

  try {
    const publicCard = await getPublicCardBySlug(normalizedSlug);

    if (!publicCard) {
      return NextResponse.json(
        {
          error: "Card not found.",
        },
        { status: 404 },
      );
    }

    let resolvedViewCount = publicCard.card.view_count;

    try {
      const updatedViewCount = await incrementCardViewCount(normalizedSlug);
      if (updatedViewCount > 0) {
        resolvedViewCount = updatedViewCount;
      }
    } catch (incrementError) {
      if (process.env.NODE_ENV === "production") {
        console.error("Public card view increment failed.", {
          slug: normalizedSlug,
          detail: toErrorMessage(incrementError),
        });
      } else {
        console.warn("Public card view increment failed.", {
          slug: normalizedSlug,
          detail: toErrorMessage(incrementError),
        });
      }
    }

    return NextResponse.json({
      data: {
        slug: publicCard.card.slug,
        theme: publicCard.card.theme,
        layout: publicCard.card.layout,
        sections: publicCard.card.sections,
        customColors: publicCard.card.custom_colors,
        imageUrl: publicCard.imageUrl,
        viewCount: resolvedViewCount,
        updatedAt: publicCard.card.updated_at,
        owner: {
          username: publicCard.owner.github_username,
          displayName:
            publicCard.owner.display_name ?? publicCard.owner.github_username,
          avatarUrl: publicCard.owner.avatar_url,
          bio: publicCard.owner.bio,
          company: publicCard.owner.company,
          location: publicCard.owner.location,
          githubUrl: `https://github.com/${publicCard.owner.github_username}`,
        },
      },
    });
  } catch (error) {
    const responseBody =
      process.env.NODE_ENV === "production"
        ? {
            error: "Failed to load public card.",
          }
        : {
            error: "Failed to load public card.",
            detail: toErrorMessage(error),
          };

    return NextResponse.json(responseBody, { status: 500 });
  }
}