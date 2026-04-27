const OWNER_FALLBACK_USERNAME = "adamrzem";

function normalizeUsername(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

export function getOwnerUsername() {
  return normalizeUsername(process.env.NEXT_PUBLIC_OWNER_USERNAME) || OWNER_FALLBACK_USERNAME;
}

export function isOwnerUsername(value?: string | null) {
  return normalizeUsername(value) === getOwnerUsername();
}
