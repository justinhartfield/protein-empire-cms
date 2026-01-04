/**
 * Recipe Lifecycle Hooks
 * 
 * Triggers GitHub Actions workflow when recipes are created, updated, or deleted.
 */

const GITHUB_WEBHOOK_URL = process.env.GITHUB_WEBHOOK_URL;
const GITHUB_WEBHOOK_TOKEN = process.env.GITHUB_WEBHOOK_TOKEN;

async function triggerGitHubWorkflow(site?: string) {
  if (!GITHUB_WEBHOOK_URL || !GITHUB_WEBHOOK_TOKEN) {
    console.log('GitHub webhook not configured, skipping...');
    return;
  }

  try {
    const response = await fetch(GITHUB_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_WEBHOOK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'strapi-content-update',
        client_payload: {
          site: site || '',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (response.ok) {
      console.log('GitHub workflow triggered successfully');
    } else {
      console.error('Failed to trigger GitHub workflow:', response.status);
    }
  } catch (error) {
    console.error('Error triggering GitHub workflow:', error);
  }
}

interface RecipeWithSite {
  site?: {
    domain?: string;
  };
}

async function getSiteDomain(recipeId: number): Promise<string | null> {
  try {
    const recipe = await strapi.entityService.findOne('api::recipe.recipe', recipeId, {
      populate: ['site'],
    }) as RecipeWithSite | null;
    return recipe?.site?.domain || null;
  } catch {
    return null;
  }
}

export default {
  async afterCreate(event: { result: { id: number } }) {
    const { result } = event;
    const site = await getSiteDomain(result.id);
    // Debounce: wait 5 seconds before triggering to batch multiple changes
    setTimeout(() => triggerGitHubWorkflow(site || undefined), 5000);
  },

  async afterUpdate(event: { result: { id: number } }) {
    const { result } = event;
    const site = await getSiteDomain(result.id);
    setTimeout(() => triggerGitHubWorkflow(site || undefined), 5000);
  },

  async afterDelete() {
    // Can't get site from deleted recipe, trigger full rebuild
    setTimeout(() => triggerGitHubWorkflow(), 5000);
  },
};
