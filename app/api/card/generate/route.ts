import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  deleteCardImage,
  getCardBySlug,
  getCardImageUrl,
  getUserByGithubId,
  type CardRecord,
  upsertCard,
  uploadCardImage,
} from "@/lib/supabase/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type GenerateCardRequest = {
  slug: string;
  theme: string;
  layout: string;
  sections: string[];
  customColors?: Record<string, string>;
  isPublic?: boolean;
  imageBase64?: string;
};

type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function isSlugConflictError(error: unknown): boolean {
  const message = toErrorMessage(error).toLowerCase();

  return (
    message.includes("slug is already in use") ||
    message.includes("slug is already owned") ||
    message.includes("23505") ||
    message.includes("duplicate key value") ||
    message.includes("cards_slug_key")
  );
}

function validateCustomColors(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}

function validateGenerateCardBody(body: unknown): ValidationResult<GenerateCardRequest> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      error: "Request body must be a JSON object.",
    };
  }

  const record = body as Record<string, unknown>;

  if (!hasNonEmptyString(record.slug)) {
    return {
      ok: false,
      error: "Field 'slug' must be a non-empty string.",
    };
  }

  if (!hasNonEmptyString(record.theme)) {
    return {
      ok: false,
      error: "Field 'theme' must be a non-empty string.",
    };
  }

  if (!hasNonEmptyString(record.layout)) {
    return {
      ok: false,
      error: "Field 'layout' must be a non-empty string.",
    };
  }

  if (!Array.isArray(record.sections) || record.sections.length === 0) {
    return {
      ok: false,
      error: "Field 'sections' must be a non-empty string array.",
    };
  }

  if (!record.sections.every((section) => hasNonEmptyString(section))) {
    return {
      ok: false,
      error: "Field 'sections' must contain only non-empty strings.",
    };
  }

  if (
    typeof record.customColors !== "undefined" &&
    !validateCustomColors(record.customColors)
  ) {
    return {
      ok: false,
      error: "Field 'customColors' must be an object with string values.",
    };
  }

  if (typeof record.isPublic !== "undefined" && typeof record.isPublic !== "boolean") {
    return {
      ok: false,
      error: "Field 'isPublic' must be a boolean when provided.",
    };
  }

  if (typeof record.imageBase64 !== "undefined" && !hasNonEmptyString(record.imageBase64)) {
    return {
      ok: false,
      error: "Field 'imageBase64' must be a non-empty string when provided.",
    };
  }

  return {
    ok: true,
    value: {
      slug: record.slug.trim(),
      theme: record.theme.trim(),
      layout: record.layout.trim(),
      sections: record.sections.map((section) => section.trim()),
      customColors: record.customColors as Record<string, string> | undefined,
      isPublic: record.isPublic as boolean | undefined,
      imageBase64: record.imageBase64 as string | undefined,
    },
  };
}

function isPngBuffer(buffer: Uint8Array): boolean {
  if (buffer.length < PNG_SIGNATURE.length) {
    return false;
  }

  return PNG_SIGNATURE.every((value, index) => buffer[index] === value);
}

function decodePngBase64(value: string): ValidationResult<Uint8Array> {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return {
      ok: false,
      error: "Field 'imageBase64' cannot be empty.",
    };
  }

  const dataUrlMatch = /^data:([^;,]+);base64,(.+)$/i.exec(trimmed);
  let base64Payload = trimmed;

  if (dataUrlMatch) {
    const mimeType = dataUrlMatch[1].toLowerCase();

    if (mimeType !== "image/png") {
      return {
        ok: false,
        error: "Field 'imageBase64' data URL must use image/png mime type.",
      };
    }

    base64Payload = dataUrlMatch[2];
  }

  let normalizedBase64 = base64Payload.replace(/\s+/g, "");

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedBase64)) {
    return {
      ok: false,
      error: "Field 'imageBase64' is not valid base64.",
    };
  }

  const remainder = normalizedBase64.length % 4;
  if (remainder === 1) {
    return {
      ok: false,
      error: "Field 'imageBase64' is not valid base64.",
    };
  }

  if (remainder > 0) {
    normalizedBase64 += "=".repeat(4 - remainder);
  }

  const decoded = new Uint8Array(Buffer.from(normalizedBase64, "base64"));

  if (decoded.length === 0) {
    return {
      ok: false,
      error: "Field 'imageBase64' decoded to an empty buffer.",
    };
  }

  if (decoded.length > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: "Field 'imageBase64' exceeds the 5MB size limit.",
    };
  }

  if (!isPngBuffer(decoded)) {
    return {
      ok: false,
      error: "Field 'imageBase64' must contain PNG image bytes.",
    };
  }

  return {
    ok: true,
    value: decoded,
  };
}

function toCardResponse(card: CardRecord, imageUrl: string | null) {
  return {
    id: card.id,
    userId: card.user_id,
    slug: card.slug,
    theme: card.theme,
    layout: card.layout,
    sections: card.sections,
    customColors: card.custom_colors,
    isPublic: card.is_public,
    storagePath: card.storage_path,
    imageUrl,
    viewCount: card.view_count,
    createdAt: card.created_at,
    updatedAt: card.updated_at,
  };
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || !session.githubId) {
    return NextResponse.json(
      {
        error: "Unauthorized. Sign in with GitHub first.",
      },
      { status: 401 },
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const validation = validateGenerateCardBody(rawBody);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: validation.error,
      },
      { status: 400 },
    );
  }

  const input = validation.value;

  let imageBuffer: Uint8Array | null = null;
  if (input.imageBase64) {
    const decoded = decodePngBase64(input.imageBase64);

    if (!decoded.ok) {
      return NextResponse.json(
        {
          error: decoded.error,
        },
        { status: 400 },
      );
    }

    imageBuffer = decoded.value;
  }

  try {
    const user = await getUserByGithubId(session.githubId);

    if (!user) {
      return NextResponse.json(
        {
          error: "Authenticated user profile was not found.",
        },
        { status: 404 },
      );
    }

    const existingCard = await getCardBySlug(input.slug);
    if (existingCard && existingCard.user_id !== user.id) {
      return NextResponse.json(
        {
          error: "Card slug is already in use.",
        },
        { status: 409 },
      );
    }

    const upsertBase = {
      userId: user.id,
      slug: input.slug,
      theme: input.theme,
      layout: input.layout,
      sections: input.sections,
    };

    const optionalCardOverrides = {
      ...(typeof input.customColors !== "undefined"
        ? { customColors: input.customColors }
        : {}),
      ...(typeof input.isPublic === "boolean" ? { isPublic: input.isPublic } : {}),
    };

    let card: CardRecord;

    if (imageBuffer && existingCard) {
      const storagePath = await uploadCardImage(user.github_id, existingCard.id, imageBuffer);

      card = await upsertCard({
        ...upsertBase,
        ...optionalCardOverrides,
        storagePath,
      });
    } else if (imageBuffer) {
      const cardId = crypto.randomUUID();
      const storagePath = await uploadCardImage(user.github_id, cardId, imageBuffer);

      try {
        card = await upsertCard({
          ...upsertBase,
          ...optionalCardOverrides,
          cardId,
          storagePath,
        });
      } catch (error) {
        try {
          await deleteCardImage(storagePath);
        } catch (cleanupError) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Card image cleanup failed.", {
              storagePath,
              detail: toErrorMessage(cleanupError),
            });
          }
        }

        throw error;
      }
    } else {
      card = await upsertCard({
        ...upsertBase,
        ...optionalCardOverrides,
      });
    }

    const imageUrl = card.storage_path ? getCardImageUrl(card.storage_path) : null;

    return NextResponse.json({
      data: toCardResponse(card, imageUrl),
    });
  } catch (error) {
    if (isSlugConflictError(error)) {
      return NextResponse.json(
        {
          error: "Card slug is already in use.",
        },
        { status: 409 },
      );
    }

    const responseBody =
      process.env.NODE_ENV === "production"
        ? {
            error: "Card generation failed.",
          }
        : {
            error: "Card generation failed.",
            detail: toErrorMessage(error),
          };

    return NextResponse.json(responseBody, { status: 500 });
  }
}