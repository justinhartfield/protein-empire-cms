# Protein Empire CMS - Railway Deployment Guide

This guide walks you through deploying the Protein Empire Strapi CMS to Railway.

## Prerequisites

- A [Railway](https://railway.app) account
- A [GitHub](https://github.com) account
- The `protein-empire-cms` repository pushed to GitHub

## Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. Select the `protein-empire-cms` repository

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically provision a PostgreSQL instance
4. The `DATABASE_URL` will be auto-injected into your Strapi service

## Step 3: Configure Environment Variables

In your Strapi service, go to **Variables** and add:

```
# Required
DATABASE_CLIENT=postgres
NODE_ENV=production

# Generate these with: openssl rand -base64 16
APP_KEYS=<key1>,<key2>,<key3>,<key4>
API_TOKEN_SALT=<random-string>
ADMIN_JWT_SECRET=<random-string>
TRANSFER_TOKEN_SALT=<random-string>
JWT_SECRET=<random-string>
ENCRYPTION_KEY=<random-string>

# Optional: Set after deployment
PUBLIC_URL=https://your-app.up.railway.app
```

### Generate Secrets

Run this command to generate all secrets at once:

```bash
echo "APP_KEYS=$(openssl rand -base64 16),$(openssl rand -base64 16),$(openssl rand -base64 16),$(openssl rand -base64 16)"
echo "API_TOKEN_SALT=$(openssl rand -base64 16)"
echo "ADMIN_JWT_SECRET=$(openssl rand -base64 16)"
echo "TRANSFER_TOKEN_SALT=$(openssl rand -base64 16)"
echo "JWT_SECRET=$(openssl rand -base64 16)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 16)"
```

## Step 4: Deploy

1. Railway will automatically build and deploy your app
2. Wait for the build to complete (usually 3-5 minutes)
3. Click on the deployment to see logs

## Step 5: Get Your Public URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** to get a Railway subdomain
3. Or add a custom domain if you have one
4. Update the `PUBLIC_URL` environment variable with your domain

## Step 6: Create Admin User

1. Visit `https://your-app.up.railway.app/admin`
2. Create your first administrator account
3. Save these credentials securely!

## Step 7: Create API Token

1. Go to **Settings** → **API Tokens**
2. Click **"Create new API Token"**
3. Name: `Build System`
4. Type: **Full access**
5. Copy the token and save it securely

## Step 8: Configure GitHub Actions

Add these secrets to your `protein-empire` repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add:
   - `STRAPI_URL`: Your Railway Strapi URL (e.g., `https://protein-empire-cms.up.railway.app`)
   - `STRAPI_API_TOKEN`: The API token you created

## Step 9: Seed Initial Data

Run the seed script to import your recipes:

```bash
STRAPI_URL=https://your-app.up.railway.app \
STRAPI_API_TOKEN=your-api-token \
node scripts/seed-data.js
```

## Step 10: Configure Webhook (Optional)

To auto-deploy sites when content changes:

1. Create a GitHub Personal Access Token with `repo` scope
2. Add to Railway environment variables:
   - `GITHUB_WEBHOOK_URL`: `https://api.github.com/repos/YOUR_USERNAME/protein-empire/dispatches`
   - `GITHUB_WEBHOOK_TOKEN`: Your GitHub token

---

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Ensure `DATABASE_CLIENT=postgres` is set
- Check Railway logs for specific errors

### Database Connection Issues

- Verify PostgreSQL is running in your project
- Check that `DATABASE_URL` is being injected (Railway does this automatically)

### Admin Panel Not Loading

- Ensure `PUBLIC_URL` matches your actual domain
- Try clearing browser cache
- Check for CORS errors in browser console

### API Returns 403

- Verify API token is correct
- Check token permissions in Strapi admin

---

## Costs

Railway offers:
- **Free Tier**: $5/month credit (usually enough for low-traffic CMS)
- **Hobby Plan**: $5/month for more resources
- **Pro Plan**: $20/month for production workloads

PostgreSQL is included in your plan's resource allocation.

---

## Next Steps

After deployment:

1. ✅ Create admin account
2. ✅ Create API token for build system
3. ✅ Run seed script to import recipes
4. ✅ Configure GitHub Actions secrets
5. ✅ Test the build workflow
6. ✅ Set up webhook for auto-deployment
