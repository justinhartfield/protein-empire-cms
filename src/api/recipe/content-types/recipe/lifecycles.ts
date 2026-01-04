/**
 * Recipe Lifecycle Hooks
 * 
 * Triggers GitHub Actions workflow when recipes are created, updated, or deleted.
 */

const GITHUB_WEBHOOK_URL = process.env.GITHUB_WEBHOOK_URL;
const GITHUB_WEBHOOK_TOKEN = process.env.GITHUB_WEBHOOK_TOKEN;

async function triggerGitHubWorkflow() {
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

export default {
  afterCreate() {
    // Debounce: wait 5 seconds before triggering to batch multiple changes
    setTimeout(() => triggerGitHubWorkflow(), 5000);
  },

  afterUpdate() {
    setTimeout(() => triggerGitHubWorkflow(), 5000);
  },

  afterDelete() {
    setTimeout(() => triggerGitHubWorkflow(), 5000);
  },
};
