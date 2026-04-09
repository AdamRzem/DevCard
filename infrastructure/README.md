# AWS Setup Guide (Phase 5)

This guide configures DynamoDB, S3, CloudFront, and IAM for DevCard.

## 1) Choose AWS Region

Use one region consistently for all resources.

Recommended for this project:
- Region: `eu-central-1`

Set in env:
- `AWS_REGION=eu-central-1`

## 2) Create DynamoDB Tables

Open AWS Console:
- https://console.aws.amazon.com/dynamodb/

### Table A: users

Create table:
- Table name: `devcard-users`
- Partition key: `PK` (String)
- Sort key: `SK` (String)

Used key pattern:
- User profile item: `PK=USER#<github_id>`, `SK=PROFILE`

Env value to set:
- `DYNAMODB_TABLE_USERS=devcard-users`

### Table B: cards

Create table:
- Table name: `devcard-cards`
- Partition key: `PK` (String)
- Sort key: `SK` (String)

Used key pattern:
- Card item: `PK=USER#<github_id>`, `SK=CARD#<card_id>`
- Slug lock item: `PK=SLUG#<slug>`, `SK=LOCK`

Add GSI for slug lookup:
- Index name: `slug-index`
- Partition key: `slug` (String)
- Sort key: not required

Env value to set:
- `DYNAMODB_TABLE_CARDS=devcard-cards`

## 3) Create S3 Bucket

Open AWS Console:
- https://console.aws.amazon.com/s3/

Create bucket:
- Bucket name: choose globally unique name (for example `devcard-images-yourname`)
- Region: same as app (`eu-central-1`)
- Block public access: keep enabled

Env value to set:
- `S3_BUCKET_NAME=<your-bucket-name>`

### Bucket CORS

In bucket settings, add this CORS rule:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Replace `https://your-production-domain` with your deployed app URL.

## 4) Create CloudFront Distribution

Open AWS Console:
- https://console.aws.amazon.com/cloudfront/

Create distribution:
- Origin: S3 bucket from step 3
- Viewer protocol policy: Redirect HTTP to HTTPS
- Cache policy: use managed optimized policy

After creation, copy Distribution domain name, example:
- `d1234abcd.cloudfront.net`

Env value to set:
- `CLOUDFRONT_DOMAIN=d1234abcd.cloudfront.net`

## 5) Preferred: Use IAM Role Credentials in Production

For production deployments, prefer workload roles over long-lived access keys:
- EC2: attach an instance profile role.
- ECS: attach a task role.
- Lambda: attach an execution role.
- Other hosts: use native workload identity support when available.

When role credentials are available, you do not need to set:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Use static access keys primarily for local development.

## 6) Create IAM User for Local/Non-Role Access

Open AWS Console:
- https://console.aws.amazon.com/iam/

Create user:
- User name: `devcard-app` (example)
- Access type: create access key for SDK/CLI usage

Attach inline policies:
- `infrastructure/policies/dynamodb-policy.json`
- `infrastructure/policies/s3-policy.json`

After creating the access key, copy:
- Access key ID -> `AWS_ACCESS_KEY_ID`
- Secret access key -> `AWS_SECRET_ACCESS_KEY`

Important:
- Secret access key is shown once. Save it immediately.

## 7) Update Local Env

Update `.env.local` with real values:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID` (optional when role credentials are available)
- `AWS_SECRET_ACCESS_KEY` (optional when role credentials are available)
- `DYNAMODB_TABLE_USERS`
- `DYNAMODB_TABLE_CARDS`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DOMAIN`

## 8) Verify Connectivity

Start app:

```bash
npm run dev
```

Manual checks:
- Sign in with GitHub successfully.
- Call `POST /api/github/sync` from dashboard flow.
- Confirm profile item appears in `devcard-users` table.
- Confirm no secrets are logged in terminal output.

## 9) Security Notes

- Use least-privilege IAM policies only.
- Do not commit `.env.local`.
- Rotate IAM access keys periodically.
- For production, prefer short-lived credentials (role-based) over long-lived user keys when possible.
