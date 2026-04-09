import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  type GetCommandInput,
  QueryCommand,
  type QueryCommandInput,
  TransactWriteCommand,
  type TransactWriteCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

const MANUAL_PLACEHOLDER_PREFIX = "MANUAL_REPLACE";
const USERS_SK = "PROFILE";
const SLUG_LOCK_SUFFIX = "LOCK";
const SLUG_INDEX_NAME = "slug-index";

export class AwsPersistenceError extends Error {
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
    this.name = "AwsPersistenceError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable;
    this.cause = options.cause;
  }
}

export type SaveUserInput = {
  githubId: string;
  githubUsername: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  company?: string | null;
  location?: string | null;
  cardTheme?: string;
  cardLayout?: string;
  cardCustomization?: Record<string, unknown>;
  isPublic?: boolean;
  viewCount?: number;
  githubData?: unknown;
  lastFetchedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SaveUserResult =
  | {
      status: "written";
      updatedAt: string;
    }
  | {
      status: "skipped";
      reason: string;
    }
  | {
      status: "stale";
      reason: string;
    };

export type SaveCardInput = {
  githubId: string;
  cardId: string;
  slug: string;
  theme: string;
  layout: string;
  sections: string[];
  customColors?: Record<string, string>;
  isPublic?: boolean;
  s3ImageKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SaveCardResult =
  | {
      status: "written";
      cardId: string;
      slug: string;
      updatedAt: string;
    }
  | {
      status: "skipped";
      reason: string;
    };

export type IncrementViewCountResult =
  | {
      status: "written";
      viewCount: number;
    }
  | {
      status: "skipped";
      reason: string;
    };

export type DevCardUserRecord = {
  PK: string;
  SK: string;
  githubId?: string;
  githubUsername?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  company?: string | null;
  location?: string | null;
  isPublic?: boolean;
  viewCount?: number;
  lastFetchedAt?: string;
  githubData?: unknown;
  [key: string]: unknown;
};

export type DevCardCardRecord = {
  PK: string;
  SK: string;
  slug?: string;
  githubId?: string;
  cardId?: string;
  theme?: string;
  layout?: string;
  sections?: string[];
  customColors?: Record<string, string>;
  s3ImageKey?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type AwsReadiness =
  | {
      enabled: true;
    }
  | {
      enabled: false;
      reason: string;
    };

let documentClient: DynamoDBDocumentClient | null = null;

function hasConfiguredValue(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value.trim();
  return normalized.length > 0 && !normalized.startsWith(MANUAL_PLACEHOLDER_PREFIX);
}

function normalizeSlug(rawSlug: string) {
  return rawSlug.trim().toLowerCase();
}

function toUserPartitionKey(githubId: string) {
  return `USER#${githubId}`;
}

function toCardSortKey(cardId: string) {
  return `CARD#${cardId}`;
}

function toSlugLockPartitionKey(slug: string) {
  return `SLUG#${slug}`;
}

function toNativeValue(value: unknown) {
  return value as NativeAttributeValue;
}

const AWS_USERS_REQUIREMENTS: Array<[name: string, value: string | undefined]> = [
  ["AWS_REGION", process.env.AWS_REGION],
  ["DYNAMODB_TABLE_USERS", process.env.DYNAMODB_TABLE_USERS],
];

const AWS_CARDS_REQUIREMENTS: Array<[name: string, value: string | undefined]> = [
  ["AWS_REGION", process.env.AWS_REGION],
  ["DYNAMODB_TABLE_CARDS", process.env.DYNAMODB_TABLE_CARDS],
];

function getMissingRequiredEnv(required: Array<[name: string, value: string | undefined]>) {
  return required
    .filter(([, value]) => !hasConfiguredValue(value))
    .map(([name]) => name);
}

function shouldFailClosed() {
  return process.env.NODE_ENV === "production";
}

function ensureAwsReady(
  operationName: string,
  required: Array<[name: string, value: string | undefined]>,
): AwsReadiness {
  const missing = getMissingRequiredEnv(required);

  if (missing.length === 0) {
    return { enabled: true };
  }

  const reason = `${operationName} skipped because AWS persistence env is not configured: ${missing.join(
    ", ",
  )}`;

  if (shouldFailClosed()) {
    throw new AwsPersistenceError(reason, {
      code: "AWS_CONFIG_MISSING",
      statusCode: 500,
      retryable: false,
    });
  }

  return {
    enabled: false,
    reason,
  };
}

function getOptionalStaticCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const hasAccessKeyId = hasConfiguredValue(accessKeyId);
  const hasSecretAccessKey = hasConfiguredValue(secretAccessKey);

  if (hasAccessKeyId !== hasSecretAccessKey) {
    throw new AwsPersistenceError(
      "AWS static credentials are partially configured. Set both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or neither.",
      {
        code: "AWS_CONFIG_MISSING",
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

function getDocumentClient() {
  if (documentClient) {
    return documentClient;
  }

  const credentials = getOptionalStaticCredentials();

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION!,
    ...(credentials ? { credentials } : {}),
  });

  documentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });

  return documentClient;
}

function getUsersTableName() {
  const tableName = process.env.DYNAMODB_TABLE_USERS;

  if (!hasConfiguredValue(tableName)) {
    throw new AwsPersistenceError("DynamoDB users table name is missing.", {
      code: "AWS_CONFIG_MISSING",
      statusCode: 500,
      retryable: false,
    });
  }

  return tableName;
}

function getCardsTableName() {
  const tableName = process.env.DYNAMODB_TABLE_CARDS;

  if (!hasConfiguredValue(tableName)) {
    throw new AwsPersistenceError("DynamoDB cards table name is missing.", {
      code: "AWS_CONFIG_MISSING",
      statusCode: 500,
      retryable: false,
    });
  }

  return tableName;
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

function hasTransactionCancellationCode(error: unknown, code: string) {
  if (
    !error ||
    typeof error !== "object" ||
    !("CancellationReasons" in error) ||
    !Array.isArray((error as { CancellationReasons?: unknown }).CancellationReasons)
  ) {
    return false;
  }

  const reasons = (error as {
    CancellationReasons: Array<{
      Code?: string;
    }>;
  }).CancellationReasons;

  return reasons.some((reason) => reason.Code === code);
}

function mapAwsError(operationName: string, error: unknown): AwsPersistenceError {
  if (error instanceof AwsPersistenceError) {
    return error;
  }

  const errorName = getErrorName(error);

  if (errorName === "ValidationException") {
    return new AwsPersistenceError(`${operationName} failed validation.`, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      retryable: false,
      cause: error,
    });
  }

  if (errorName === "ResourceNotFoundException") {
    return new AwsPersistenceError(`${operationName} failed because a DynamoDB resource is missing.`, {
      code: "AWS_RESOURCE_MISSING",
      statusCode: 500,
      retryable: false,
      cause: error,
    });
  }

  if (
    errorName === "ProvisionedThroughputExceededException" ||
    errorName === "ThrottlingException" ||
    errorName === "RequestLimitExceeded" ||
    errorName === "InternalServerError" ||
    errorName === "ServiceUnavailable" ||
    errorName === "TransactionInProgressException"
  ) {
    return new AwsPersistenceError(`${operationName} failed due to a transient DynamoDB error.`, {
      code: "AWS_TRANSIENT_ERROR",
      statusCode: 503,
      retryable: true,
      cause: error,
    });
  }

  if (errorName === "ConditionalCheckFailedException") {
    return new AwsPersistenceError(`${operationName} failed because a conditional write check failed.`, {
      code: "CONDITIONAL_CHECK_FAILED",
      statusCode: 409,
      retryable: false,
      cause: error,
    });
  }

  if (errorName === "TransactionCanceledException") {
    const hasConditionalFailure =
      hasTransactionCancellationCode(error, "ConditionalCheckFailed") ||
      (error instanceof Error && error.message.includes("ConditionalCheckFailed"));

    if (hasConditionalFailure) {
      return new AwsPersistenceError(`${operationName} failed due to a write conflict.`, {
        code: "WRITE_CONFLICT",
        statusCode: 409,
        retryable: false,
        cause: error,
      });
    }

    return new AwsPersistenceError(`${operationName} transaction was canceled by DynamoDB.`, {
      code: "TRANSACTION_CANCELED",
      statusCode: 500,
      retryable: false,
      cause: error,
    });
  }

  return new AwsPersistenceError(`${operationName} failed with an unexpected DynamoDB error.`, {
    code: "AWS_UNKNOWN_ERROR",
    statusCode: 500,
    retryable: false,
    cause: error,
  });
}

function assertNonEmpty(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new AwsPersistenceError(`${fieldName} is required.`, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      retryable: false,
    });
  }

  return normalized;
}

function assertSlug(slug: string) {
  const normalized = normalizeSlug(slug);
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slugPattern.test(normalized)) {
    throw new AwsPersistenceError("Card slug is invalid. Use lowercase letters, numbers, and hyphens.", {
      code: "INVALID_SLUG",
      statusCode: 400,
      retryable: false,
    });
  }

  return normalized;
}

export async function saveUser(input: SaveUserInput): Promise<SaveUserResult> {
  const readiness = ensureAwsReady("saveUser", AWS_USERS_REQUIREMENTS);

  if (!readiness.enabled) {
    return {
      status: "skipped",
      reason: readiness.reason,
    };
  }

  const githubId = assertNonEmpty(input.githubId, "githubId");
  const githubUsername = assertNonEmpty(input.githubUsername, "githubUsername");
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  const createdAt = input.createdAt ?? updatedAt;

  const names: Record<string, string> = {
    "#entityType": "entityType",
    "#schemaVersion": "schemaVersion",
    "#githubId": "githubId",
    "#githubUsername": "githubUsername",
    "#updatedAt": "updatedAt",
    "#createdAt": "createdAt",
    "#isPublic": "isPublic",
    "#viewCount": "viewCount",
    "#cardTheme": "cardTheme",
    "#cardLayout": "cardLayout",
    "#cardCustomization": "cardCustomization",
  };

  const values: Record<string, NativeAttributeValue> = {
    ":entityType": "USER_PROFILE",
    ":schemaVersion": 1,
    ":githubId": githubId,
    ":githubUsername": githubUsername,
    ":updatedAt": updatedAt,
    ":createdAt": createdAt,
    ":isPublicDefault": input.isPublic ?? false,
    ":viewCountDefault": input.viewCount ?? 0,
    ":cardThemeDefault": input.cardTheme ?? "dark-minimal",
    ":cardLayoutDefault": input.cardLayout ?? "full",
    ":cardCustomizationDefault": toNativeValue(input.cardCustomization ?? {}),
  };

  const setClauses = [
    "#entityType = if_not_exists(#entityType, :entityType)",
    "#schemaVersion = if_not_exists(#schemaVersion, :schemaVersion)",
    "#githubId = if_not_exists(#githubId, :githubId)",
    "#githubUsername = :githubUsername",
    "#updatedAt = :updatedAt",
    "#createdAt = if_not_exists(#createdAt, :createdAt)",
    "#isPublic = if_not_exists(#isPublic, :isPublicDefault)",
    "#viewCount = if_not_exists(#viewCount, :viewCountDefault)",
    "#cardTheme = if_not_exists(#cardTheme, :cardThemeDefault)",
    "#cardLayout = if_not_exists(#cardLayout, :cardLayoutDefault)",
    "#cardCustomization = if_not_exists(#cardCustomization, :cardCustomizationDefault)",
  ];

  const optionalFields: Array<{
    value: unknown;
    attributeName: string;
    placeholderName: string;
    placeholderValue: string;
  }> = [
    {
      value: input.displayName,
      attributeName: "displayName",
      placeholderName: "#displayName",
      placeholderValue: ":displayName",
    },
    {
      value: input.avatarUrl,
      attributeName: "avatarUrl",
      placeholderName: "#avatarUrl",
      placeholderValue: ":avatarUrl",
    },
    {
      value: input.bio,
      attributeName: "bio",
      placeholderName: "#bio",
      placeholderValue: ":bio",
    },
    {
      value: input.email,
      attributeName: "email",
      placeholderName: "#email",
      placeholderValue: ":email",
    },
    {
      value: input.company,
      attributeName: "company",
      placeholderName: "#company",
      placeholderValue: ":company",
    },
    {
      value: input.location,
      attributeName: "location",
      placeholderName: "#location",
      placeholderValue: ":location",
    },
    {
      value: input.githubData,
      attributeName: "githubData",
      placeholderName: "#githubData",
      placeholderValue: ":githubData",
    },
  ];

  for (const field of optionalFields) {
    if (field.value === undefined) {
      continue;
    }

    names[field.placeholderName] = field.attributeName;
    values[field.placeholderValue] = toNativeValue(field.value);
    setClauses.push(`${field.placeholderName} = ${field.placeholderValue}`);
  }

  let conditionExpression: string | undefined;

  if (input.lastFetchedAt) {
    names["#lastFetchedAt"] = "lastFetchedAt";
    values[":lastFetchedAt"] = input.lastFetchedAt;
    setClauses.push("#lastFetchedAt = :lastFetchedAt");
    conditionExpression = "attribute_not_exists(#lastFetchedAt) OR #lastFetchedAt < :lastFetchedAt";
  }

  const commandInput: UpdateCommandInput = {
    TableName: getUsersTableName(),
    Key: {
      PK: toUserPartitionKey(githubId),
      SK: USERS_SK,
    },
    UpdateExpression: `SET ${setClauses.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ConditionExpression: conditionExpression,
  };

  try {
    await getDocumentClient().send(new UpdateCommand(commandInput));

    return {
      status: "written",
      updatedAt,
    };
  } catch (error) {
    if (input.lastFetchedAt && getErrorName(error) === "ConditionalCheckFailedException") {
      return {
        status: "stale",
        reason: "A newer GitHub snapshot is already persisted.",
      };
    }

    throw mapAwsError("saveUser", error);
  }
}

export async function getUser(githubId: string): Promise<DevCardUserRecord | null> {
  const readiness = ensureAwsReady("getUser", AWS_USERS_REQUIREMENTS);

  if (!readiness.enabled) {
    return null;
  }

  const normalizedGithubId = assertNonEmpty(githubId, "githubId");

  const commandInput: GetCommandInput = {
    TableName: getUsersTableName(),
    Key: {
      PK: toUserPartitionKey(normalizedGithubId),
      SK: USERS_SK,
    },
  };

  try {
    const response = await getDocumentClient().send(new GetCommand(commandInput));
    return (response.Item as DevCardUserRecord | undefined) ?? null;
  } catch (error) {
    throw mapAwsError("getUser", error);
  }
}

export async function saveCard(input: SaveCardInput): Promise<SaveCardResult> {
  const readiness = ensureAwsReady("saveCard", AWS_CARDS_REQUIREMENTS);

  if (!readiness.enabled) {
    return {
      status: "skipped",
      reason: readiness.reason,
    };
  }

  const githubId = assertNonEmpty(input.githubId, "githubId");
  const cardId = assertNonEmpty(input.cardId, "cardId");
  const slug = assertSlug(input.slug);

  if (input.sections.length === 0) {
    throw new AwsPersistenceError("Card sections cannot be empty.", {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      retryable: false,
    });
  }

  const userPk = toUserPartitionKey(githubId);
  const cardSk = toCardSortKey(cardId);
  const slugLockPk = toSlugLockPartitionKey(slug);
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  const createdAt = input.createdAt ?? updatedAt;

  const cardsTableName = getCardsTableName();

  let previousSlug: string | null = null;

  try {
    const existingCardResponse = await getDocumentClient().send(
      new GetCommand({
        TableName: cardsTableName,
        Key: {
          PK: userPk,
          SK: cardSk,
        },
        ConsistentRead: true,
        ProjectionExpression: "#slug",
        ExpressionAttributeNames: {
          "#slug": "slug",
        },
      }),
    );

    const maybeSlug = existingCardResponse.Item?.slug;
    if (typeof maybeSlug === "string" && maybeSlug.trim().length > 0) {
      previousSlug = maybeSlug.toLowerCase();
    }
  } catch (error) {
    throw mapAwsError("saveCard", error);
  }

  const cardUpdateSetClauses = [
    "#entityType = if_not_exists(#entityType, :entityType)",
    "#schemaVersion = if_not_exists(#schemaVersion, :schemaVersion)",
    "#githubId = if_not_exists(#githubId, :githubId)",
    "#cardId = if_not_exists(#cardId, :cardId)",
    "#slug = :slug",
    "#theme = :theme",
    "#layout = :layout",
    "#sections = :sections",
    "#updatedAt = :updatedAt",
    "#createdAt = if_not_exists(#createdAt, :createdAt)",
    "#customColors = :customColors",
  ];

  const cardUpdateNames: Record<string, string> = {
    "#entityType": "entityType",
    "#schemaVersion": "schemaVersion",
    "#githubId": "githubId",
    "#cardId": "cardId",
    "#slug": "slug",
    "#theme": "theme",
    "#layout": "layout",
    "#sections": "sections",
    "#isPublic": "isPublic",
    "#updatedAt": "updatedAt",
    "#createdAt": "createdAt",
    "#customColors": "customColors",
    "#version": "version",
  };

  const cardUpdateValues: Record<string, NativeAttributeValue> = {
    ":entityType": "CARD",
    ":schemaVersion": 1,
    ":githubId": githubId,
    ":cardId": cardId,
    ":slug": slug,
    ":theme": input.theme,
    ":layout": input.layout,
    ":sections": input.sections,
    ":updatedAt": updatedAt,
    ":createdAt": createdAt,
    ":customColors": toNativeValue(input.customColors ?? {}),
    ":versionIncrement": 1,
  };

  if (input.isPublic !== undefined) {
    cardUpdateSetClauses.push("#isPublic = :isPublic");
    cardUpdateValues[":isPublic"] = input.isPublic;
  } else {
    cardUpdateSetClauses.push("#isPublic = if_not_exists(#isPublic, :isPublicDefault)");
    cardUpdateValues[":isPublicDefault"] = false;
  }

  if (input.s3ImageKey !== undefined) {
    cardUpdateSetClauses.push("#s3ImageKey = :s3ImageKey");
    cardUpdateNames["#s3ImageKey"] = "s3ImageKey";
    cardUpdateValues[":s3ImageKey"] = input.s3ImageKey;
  }

  const transactItems: TransactWriteCommandInput["TransactItems"] = [
    {
      Put: {
        TableName: cardsTableName,
        Item: {
          PK: slugLockPk,
          SK: SLUG_LOCK_SUFFIX,
          entityType: "SLUG_LOCK",
          ownerUserPk: userPk,
          ownerCardSk: cardSk,
          updatedAt,
          createdAt,
        },
        ConditionExpression:
          "attribute_not_exists(PK) OR (#ownerUserPk = :ownerUserPk AND #ownerCardSk = :ownerCardSk)",
        ExpressionAttributeNames: {
          "#ownerUserPk": "ownerUserPk",
          "#ownerCardSk": "ownerCardSk",
        },
        ExpressionAttributeValues: {
          ":ownerUserPk": userPk,
          ":ownerCardSk": cardSk,
        },
      },
    },
    {
      Update: {
        TableName: cardsTableName,
        Key: {
          PK: userPk,
          SK: cardSk,
        },
        UpdateExpression: `SET ${cardUpdateSetClauses.join(
          ", ",
        )} ADD #version :versionIncrement`,
        ExpressionAttributeNames: cardUpdateNames,
        ExpressionAttributeValues: cardUpdateValues,
      },
    },
  ];

  if (previousSlug && previousSlug !== slug) {
    transactItems.push({
      Delete: {
        TableName: cardsTableName,
        Key: {
          PK: toSlugLockPartitionKey(previousSlug),
          SK: SLUG_LOCK_SUFFIX,
        },
        ConditionExpression: "#ownerUserPk = :ownerUserPk AND #ownerCardSk = :ownerCardSk",
        ExpressionAttributeNames: {
          "#ownerUserPk": "ownerUserPk",
          "#ownerCardSk": "ownerCardSk",
        },
        ExpressionAttributeValues: {
          ":ownerUserPk": userPk,
          ":ownerCardSk": cardSk,
        },
      },
    });
  }

  try {
    await getDocumentClient().send(
      new TransactWriteCommand({
        TransactItems: transactItems,
      }),
    );

    return {
      status: "written",
      cardId,
      slug,
      updatedAt,
    };
  } catch (error) {
    throw mapAwsError("saveCard", error);
  }
}

export async function getCardBySlug(slug: string): Promise<DevCardCardRecord | null> {
  const readiness = ensureAwsReady("getCardBySlug", AWS_CARDS_REQUIREMENTS);

  if (!readiness.enabled) {
    return null;
  }

  const normalizedSlug = assertSlug(slug);

  const commandInput: QueryCommandInput = {
    TableName: getCardsTableName(),
    IndexName: SLUG_INDEX_NAME,
    KeyConditionExpression: "#slug = :slug",
    ExpressionAttributeNames: {
      "#slug": "slug",
    },
    ExpressionAttributeValues: {
      ":slug": normalizedSlug,
    },
    Limit: 2,
  };

  try {
    const response = await getDocumentClient().send(new QueryCommand(commandInput));
    const items = (response.Items as DevCardCardRecord[] | undefined) ?? [];

    if (items.length === 0) {
      return null;
    }

    if (items.length > 1) {
      throw new AwsPersistenceError("Multiple cards exist for the same slug.", {
        code: "SLUG_CONFLICT",
        statusCode: 409,
        retryable: false,
      });
    }

    return items[0];
  } catch (error) {
    throw mapAwsError("getCardBySlug", error);
  }
}

export async function incrementViewCount(githubId: string): Promise<IncrementViewCountResult> {
  const readiness = ensureAwsReady("incrementViewCount", AWS_USERS_REQUIREMENTS);

  if (!readiness.enabled) {
    return {
      status: "skipped",
      reason: readiness.reason,
    };
  }

  const normalizedGithubId = assertNonEmpty(githubId, "githubId");
  const updatedAt = new Date().toISOString();

  const commandInput: UpdateCommandInput = {
    TableName: getUsersTableName(),
    Key: {
      PK: toUserPartitionKey(normalizedGithubId),
      SK: USERS_SK,
    },
    UpdateExpression:
      "SET #updatedAt = :updatedAt, #viewCount = if_not_exists(#viewCount, :zero) + :increment",
    ExpressionAttributeNames: {
      "#updatedAt": "updatedAt",
      "#viewCount": "viewCount",
    },
    ExpressionAttributeValues: {
      ":updatedAt": updatedAt,
      ":zero": 0,
      ":increment": 1,
    },
    ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const response = await getDocumentClient().send(new UpdateCommand(commandInput));
    const nextViewCount = response.Attributes?.viewCount;

    if (typeof nextViewCount !== "number") {
      throw new AwsPersistenceError("incrementViewCount did not return a numeric counter.", {
        code: "INTERNAL_COUNTER_ERROR",
        statusCode: 500,
        retryable: false,
      });
    }

    return {
      status: "written",
      viewCount: nextViewCount,
    };
  } catch (error) {
    throw mapAwsError("incrementViewCount", error);
  }
}
