import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MANUAL_PLACEHOLDER_PREFIX = "MANUAL_REPLACE";
const DEFAULT_SIGNED_URL_EXPIRATION_SECONDS = 15 * 60;

type CardImageVariant = "social" | "square" | "badge";

const CARD_IMAGE_SUFFIX_BY_VARIANT: Record<CardImageVariant, string> = {
  social: "",
  square: "-sq",
  badge: "-badge",
};

export class AwsStorageError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryable: boolean;
  override readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      code: string;
      statusCode: number;
      retryable: boolean;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "AwsStorageError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable;
    this.cause = options.cause;
  }
}

let s3Client: S3Client | null = null;

function hasConfiguredValue(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value.trim();
  return normalized.length > 0 && !normalized.startsWith(MANUAL_PLACEHOLDER_PREFIX);
}

function assertNonEmpty(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new AwsStorageError(`${fieldName} is required.`, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      retryable: false,
    });
  }

  return normalized;
}

function getMissingS3Env() {
  const required: Array<[name: string, value: string | undefined]> = [
    ["AWS_REGION", process.env.AWS_REGION],
    ["S3_BUCKET_NAME", process.env.S3_BUCKET_NAME],
  ];

  return required
    .filter(([, value]) => !hasConfiguredValue(value))
    .map(([name]) => name);
}

function ensureS3Ready(operationName: string) {
  const missing = getMissingS3Env();

  if (missing.length === 0) {
    return;
  }

  throw new AwsStorageError(
    `${operationName} failed because S3 configuration is missing: ${missing.join(", ")}`,
    {
      code: "S3_CONFIG_MISSING",
      statusCode: 500,
      retryable: false,
    },
  );
}

function getOptionalStaticCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const hasAccessKeyId = hasConfiguredValue(accessKeyId);
  const hasSecretAccessKey = hasConfiguredValue(secretAccessKey);

  if (hasAccessKeyId !== hasSecretAccessKey) {
    throw new AwsStorageError(
      "AWS static credentials are partially configured. Set both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or neither.",
      {
        code: "S3_CONFIG_MISSING",
        statusCode: 500,
        retryable: false,
      },
    );
  }

  if (!hasAccessKeyId || !hasSecretAccessKey) {
    return undefined;
  }

  return {
    accessKeyId: accessKeyId!.trim(),
    secretAccessKey: secretAccessKey!.trim(),
  };
}

function getErrorName(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    typeof (error as { name?: unknown }).name === "string"
  ) {
    return (error as { name: string }).name;
  }

  return "UnknownError";
}

function mapS3Error(operationName: string, error: unknown): AwsStorageError {
  if (error instanceof AwsStorageError) {
    return error;
  }

  const errorName = getErrorName(error);

  if (errorName === "NoSuchBucket" || errorName === "NotFound") {
    return new AwsStorageError(`${operationName} failed because the S3 bucket or object was not found.`, {
      code: "S3_NOT_FOUND",
      statusCode: 404,
      retryable: false,
      cause: error,
    });
  }

  if (
    errorName === "Throttling" ||
    errorName === "RequestTimeout" ||
    errorName === "ServiceUnavailable" ||
    errorName === "InternalError"
  ) {
    return new AwsStorageError(`${operationName} failed due to a transient S3 error.`, {
      code: "S3_TRANSIENT_ERROR",
      statusCode: 503,
      retryable: true,
      cause: error,
    });
  }

  return new AwsStorageError(`${operationName} failed with an unexpected S3 error.`, {
    code: "S3_UNKNOWN_ERROR",
    statusCode: 500,
    retryable: false,
    cause: error,
  });
}

function getS3Client() {
  if (s3Client) {
    return s3Client;
  }

  const credentials = getOptionalStaticCredentials();

  s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    ...(credentials ? { credentials } : {}),
  });

  return s3Client;
}

function getBucketName() {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!hasConfiguredValue(bucketName)) {
    throw new AwsStorageError("S3 bucket name is missing.", {
      code: "S3_CONFIG_MISSING",
      statusCode: 500,
      retryable: false,
    });
  }

  return bucketName;
}

function getCloudFrontDomain() {
  const domain = process.env.CLOUDFRONT_DOMAIN;

  if (!domain || !hasConfiguredValue(domain)) {
    return null;
  }

  return domain.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function normalizeS3Key(key: string) {
  return assertNonEmpty(key, "key").replace(/^\/+/, "");
}

function encodeS3KeyPath(key: string) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function normalizeIdentifier(value: string, fieldName: string) {
  const normalized = assertNonEmpty(value, fieldName).replace(/[^a-zA-Z0-9_-]/g, "-");

  if (!normalized) {
    throw new AwsStorageError(`${fieldName} contains no valid characters.`, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      retryable: false,
    });
  }

  return normalized;
}

function toCardImageKey(githubId: string, cardId: string, variant: CardImageVariant) {
  const normalizedGithubId = normalizeIdentifier(githubId, "githubId");
  const normalizedCardId = normalizeIdentifier(cardId, "cardId");
  const suffix = CARD_IMAGE_SUFFIX_BY_VARIANT[variant];

  return `cards/${normalizedGithubId}/${normalizedCardId}${suffix}.png`;
}

export async function uploadCardImage(
  githubId: string,
  cardId: string,
  buffer: Uint8Array,
  options?: {
    variant?: CardImageVariant;
    cacheControl?: string;
  },
): Promise<string> {
  ensureS3Ready("uploadCardImage");

  if (buffer.byteLength === 0) {
    throw new AwsStorageError("Card image buffer cannot be empty.", {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      retryable: false,
    });
  }

  const variant = options?.variant ?? "social";
  const key = toCardImageKey(githubId, cardId, variant);

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: "image/png",
        CacheControl: options?.cacheControl ?? "public, max-age=31536000, immutable",
      }),
    );

    return key;
  } catch (error) {
    throw mapS3Error("uploadCardImage", error);
  }
}

export function getCardImageUrl(key: string): string {
  ensureS3Ready("getCardImageUrl");

  const normalizedKey = normalizeS3Key(key);
  const encodedKey = encodeS3KeyPath(normalizedKey);
  const cloudFrontDomain = getCloudFrontDomain();

  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${encodedKey}`;
  }

  const bucketName = getBucketName();
  const region = process.env.AWS_REGION!;

  return `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function generatePresignedDownloadUrl(
  key: string,
  options?: {
    expiresInSeconds?: number;
  },
): Promise<string> {
  ensureS3Ready("generatePresignedDownloadUrl");

  const normalizedKey = normalizeS3Key(key);
  const expiresInSeconds = options?.expiresInSeconds ?? DEFAULT_SIGNED_URL_EXPIRATION_SECONDS;

  if (expiresInSeconds <= 0) {
    throw new AwsStorageError("expiresInSeconds must be greater than zero.", {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      retryable: false,
    });
  }

  try {
    return await getSignedUrl(
      getS3Client(),
      new GetObjectCommand({
        Bucket: getBucketName(),
        Key: normalizedKey,
      }),
      {
        expiresIn: expiresInSeconds,
      },
    );
  } catch (error) {
    throw mapS3Error("generatePresignedDownloadUrl", error);
  }
}
