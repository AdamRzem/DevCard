import { createServerClient } from "./client";

// =====================
// TYPES
// =====================

export type UserRecord = {
  id: string;
  github_id: string;
  github_username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  company: string | null;
  location: string | null;
  card_theme: string;
  card_layout: string;
  is_public: boolean;
  view_count: number;
  github_data: unknown;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CardRecord = {
  id: string;
  user_id: string;
  slug: string;
  theme: string;
  layout: string;
  sections: string[];
  custom_colors: Record<string, string>;
  is_public: boolean;
  storage_path: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type PublicCardOwnerRecord = Pick<
  UserRecord,
  "id" | "github_id" | "github_username" | "display_name" | "avatar_url" | "bio" | "company" | "location"
>;

export type PublicCardRecord = {
  card: CardRecord;
  owner: PublicCardOwnerRecord;
  imageUrl: string | null;
};

function hasOwnField<T extends object, K extends string>(
  value: T,
  key: K
): value is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(value, key);
}

// =====================
// USER HELPERS
// =====================

/**
 * Upsert a user record keyed by github_id.
 * Returns the full user record after write.
 *
 * Replaces the old DynamoDB `saveUser()` function.
 * The return shape is wrapped to match the existing
 * `GitHubSyncPersistenceMeta` contract used by consumers.
 */
export async function upsertUser(input: {
  githubId: string;
  githubUsername: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  company?: string | null;
  location?: string | null;
  githubData?: unknown;
  lastFetchedAt?: string;
}): Promise<{ status: "written"; updatedAt: string }> {
  const db = createServerClient();

  const payload: Record<string, unknown> = {
    github_id: input.githubId,
    github_username: input.githubUsername,
    updated_at: new Date().toISOString(),
  };

  // Preserve existing data on conflict by only updating optional fields when explicitly provided.
  if (hasOwnField(input, "displayName")) payload.display_name = input.displayName ?? null;
  if (hasOwnField(input, "avatarUrl")) payload.avatar_url = input.avatarUrl ?? null;
  if (hasOwnField(input, "bio")) payload.bio = input.bio ?? null;
  if (hasOwnField(input, "email")) payload.email = input.email ?? null;
  if (hasOwnField(input, "company")) payload.company = input.company ?? null;
  if (hasOwnField(input, "location")) payload.location = input.location ?? null;
  if (hasOwnField(input, "githubData")) payload.github_data = input.githubData ?? null;
  if (hasOwnField(input, "lastFetchedAt")) {
    payload.last_fetched_at = input.lastFetchedAt ?? null;
  }

  const { data, error } = await db
    .from("users")
    .upsert(
      payload,
      {
        onConflict: "github_id",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) throw new Error(`upsertUser failed: ${error.message}`);

  const record = data as UserRecord;
  return { status: "written", updatedAt: record.updated_at };
}

export async function getUserByGithubId(
  githubId: string
): Promise<UserRecord | null> {
  const db = createServerClient();

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("github_id", githubId)
    .single();

  if (error?.code === "PGRST116") return null; // No rows found
  if (error) throw new Error(`getUserByGithubId failed: ${error.message}`);
  return data as UserRecord;
}

export async function getUserByUsername(
  username: string
): Promise<UserRecord | null> {
  const db = createServerClient();

  // Escape SQL wildcard characters to prevent pattern matching when using ilike.
  const escapedUsername = username.replace(/[%_\\]/g, "\\$&");
  const { data, error } = await db
    .from("users")
    .select("*")
    .ilike("github_username", escapedUsername)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(`getUserByUsername failed: ${error.message}`);
  return data as UserRecord;
}

export async function incrementUserViewCount(
  githubId: string
): Promise<void> {
  const db = createServerClient();

  const { error } = await db.rpc("increment_user_view_count", {
    p_github_id: githubId,
  });

  if (error)
    throw new Error(`incrementUserViewCount failed: ${error.message}`);
}

// =====================
// CARD HELPERS
// =====================

export async function upsertCard(input: {
  userId: string;
  slug: string;
  theme: string;
  layout: string;
  sections: string[];
  customColors?: Record<string, string>;
  isPublic?: boolean;
  storagePath?: string | null;
  cardId?: string;
}): Promise<CardRecord> {
  const db = createServerClient();
  const normalizedSlug = input.slug.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  const { data: existingData, error: existingError } = await db
    .from("cards")
    .select("*")
    .eq("slug", normalizedSlug)
    .single();

  if (existingError && existingError.code !== "PGRST116") {
    throw new Error(`upsertCard failed: ${existingError.message}`);
  }

  if (existingData) {
    const existingCard = existingData as CardRecord;

    if (existingCard.user_id !== input.userId) {
      throw new Error("upsertCard failed: slug is already owned by another user.");
    }

    const updatePayload: Record<string, unknown> = {
      theme: input.theme,
      layout: input.layout,
      sections: input.sections,
      updated_at: nowIso,
    };

    // Keep existing values unless the caller explicitly provides replacements.
    if (hasOwnField(input, "customColors")) {
      updatePayload.custom_colors = input.customColors ?? {};
    }
    if (hasOwnField(input, "isPublic")) {
      updatePayload.is_public = input.isPublic;
    }
    if (hasOwnField(input, "storagePath")) {
      updatePayload.storage_path = input.storagePath ?? null;
    }

    const { data, error } = await db
      .from("cards")
      .update(updatePayload)
      .eq("id", existingCard.id)
      .select()
      .single();

    if (error) {
      throw new Error(`upsertCard failed (${error.code ?? "unknown"}): ${error.message}`);
    }
    return data as CardRecord;
  }

  const insertPayload: Record<string, unknown> = {
    user_id: input.userId,
    slug: normalizedSlug,
    theme: input.theme,
    layout: input.layout,
    sections: input.sections,
    updated_at: nowIso,
  };

  if (hasOwnField(input, "customColors")) {
    insertPayload.custom_colors = input.customColors ?? {};
  }
  if (hasOwnField(input, "isPublic")) {
    insertPayload.is_public = input.isPublic;
  }
  if (hasOwnField(input, "storagePath")) {
    insertPayload.storage_path = input.storagePath ?? null;
  }
  if (typeof input.cardId === "string" && input.cardId.trim().length > 0) {
    insertPayload.id = input.cardId.trim();
  }

  const { data, error } = await db
    .from("cards")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw new Error(`upsertCard failed (${error.code ?? "unknown"}): ${error.message}`);
  }
  return data as CardRecord;
}

export async function getCardBySlug(
  slug: string
): Promise<CardRecord | null> {
  const db = createServerClient();
  const normalizedSlug = slug.trim().toLowerCase();

  const { data, error } = await db
    .from("cards")
    .select("*")
    .eq("slug", normalizedSlug)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(`getCardBySlug failed: ${error.message}`);
  return data as CardRecord;
}

export async function getPublicCardBySlug(
  slug: string
): Promise<PublicCardRecord | null> {
  const db = createServerClient();
  const normalizedSlug = slug.trim().toLowerCase();

  const { data, error } = await db
    .from("cards")
    .select(
      "id,user_id,slug,theme,layout,sections,custom_colors,is_public,storage_path,view_count,created_at,updated_at,users!inner(id,github_id,github_username,display_name,avatar_url,bio,company,location,is_public)"
    )
    .eq("slug", normalizedSlug)
    .eq("is_public", true)
    .eq("users.is_public", true)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) {
    throw new Error(`getPublicCardBySlug failed: ${error.message}`);
  }

  const row = data as CardRecord & {
    users:
      | (PublicCardOwnerRecord & {
          is_public?: boolean;
        })
      | Array<
          PublicCardOwnerRecord & {
            is_public?: boolean;
          }
        >;
  };

  const ownerData = Array.isArray(row.users) ? row.users[0] : row.users;
  if (!ownerData) return null;

  const cardFields = { ...row } as Record<string, unknown>;
  delete cardFields.users;
  const card = cardFields as CardRecord;

  return {
    card,
    owner: ownerData as PublicCardOwnerRecord,
    imageUrl: card.storage_path ? getCardImageUrl(card.storage_path) : null,
  };
}

export async function incrementCardViewCount(slug: string): Promise<number> {
  const db = createServerClient();

  const { data, error } = await db.rpc("increment_card_view_count", {
    p_slug: slug.trim().toLowerCase(),
  });

  if (error) {
    throw new Error(`incrementCardViewCount failed: ${error.message}`);
  }

  return typeof data === "number" ? data : 0;
}

// =====================
// STORAGE HELPERS
// =====================

export async function uploadCardImage(
  githubId: string,
  cardId: string,
  buffer: Uint8Array
): Promise<string> {
  const db = createServerClient();
  const objectPath = `${githubId}/${cardId}.png`;

  const { error } = await db.storage
    .from("card-images")
    .upload(objectPath, buffer, {
      contentType: "image/png",
      upsert: true,
      cacheControl: "31536000",
    });

  if (error) throw new Error(`uploadCardImage failed: ${error.message}`);
  return objectPath;
}

export async function deleteCardImage(storagePath: string): Promise<void> {
  const db = createServerClient();
  const normalizedPath = storagePath.trim();

  if (!normalizedPath) {
    return;
  }

  const { error } = await db.storage.from("card-images").remove([normalizedPath]);

  if (error) throw new Error(`deleteCardImage failed: ${error.message}`);
}

export function getCardImageUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  // Public bucket — no signed URL needed
  return `${url}/storage/v1/object/public/card-images/${storagePath}`;
}
