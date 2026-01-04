/**
 * Protein Empire CMS - Data Seed Script
 * 
 * This script imports recipe data from JSON files into Strapi.
 * Run after deploying Strapi and creating an admin user.
 * 
 * Usage:
 *   STRAPI_URL=https://your-strapi.railway.app \
 *   STRAPI_API_TOKEN=your-api-token \
 *   node scripts/seed-data.js
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required');
  console.log('Create an API token in Strapi Admin > Settings > API Tokens');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`
};

// Site configurations matching packages/config/sites.js
const sites = [
  { domain: 'proteincookies.co', name: 'ProteinCookies', foodType: 'Cookies', brandColor: '#f59e0b' },
  { domain: 'proteinmuffins.com', name: 'ProteinMuffins', foodType: 'Muffins', brandColor: '#f59e0b' },
  { domain: 'proteinpancakes.co', name: 'ProteinPancakes', foodType: 'Pancakes', brandColor: '#f59e0b' },
  { domain: 'proteinbrownies.co', name: 'ProteinBrownies', foodType: 'Brownies', brandColor: '#f59e0b' },
  { domain: 'protein-bread.com', name: 'ProteinBread', foodType: 'Bread', brandColor: '#f59e0b' },
  { domain: 'proteinbars.co', name: 'ProteinBars', foodType: 'Bars', brandColor: '#f59e0b' },
  { domain: 'proteinbites.co', name: 'ProteinBites', foodType: 'Bites', brandColor: '#f59e0b' },
  { domain: 'proteindonuts.co', name: 'ProteinDonuts', foodType: 'Donuts', brandColor: '#f59e0b' },
  { domain: 'proteinoatmeal.co', name: 'ProteinOatmeal', foodType: 'Oatmeal', brandColor: '#f59e0b' },
  { domain: 'proteincheesecake.co', name: 'ProteinCheesecake', foodType: 'Cheesecake', brandColor: '#f59e0b' },
  { domain: 'proteinpizzas.co', name: 'ProteinPizzas', foodType: 'Pizza', brandColor: '#f59e0b' },
  { domain: 'proteinpudding.co', name: 'ProteinPudding', foodType: 'Pudding', brandColor: '#f59e0b' },
];

// Standard categories
const categories = [
  { name: 'All Recipes', slug: 'all', description: 'Browse all recipes' },
  { name: 'Classic', slug: 'classic', description: 'Traditional favorites with a protein boost' },
  { name: 'High Protein', slug: 'high-protein', description: 'Maximum protein per serving (25g+)' },
  { name: 'Dessert', slug: 'dessert', description: 'Sweet treats that fit your macros' },
  { name: 'Quick & Easy', slug: 'quick', description: 'Ready in 30 minutes or less' },
  { name: 'Gluten-Free', slug: 'gluten-free', description: 'Delicious without the gluten' },
  { name: 'Vegan', slug: 'vegan', description: 'Plant-based protein recipes' },
  { name: 'Kids', slug: 'kids', description: 'Kid-approved protein treats' },
  { name: 'Seasonal', slug: 'seasonal', description: 'Holiday and seasonal favorites' },
  { name: 'No-Bake', slug: 'no-bake', description: 'No oven required' },
];

async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`API Error (${endpoint}):`, JSON.stringify(data, null, 2));
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return data;
}

async function createSite(siteConfig) {
  console.log(`Creating site: ${siteConfig.domain}`);
  
  try {
    const result = await apiRequest('/sites', 'POST', {
      data: {
        domain: siteConfig.domain,
        name: siteConfig.name,
        foodType: siteConfig.foodType,
        brandColor: siteConfig.brandColor,
        tagline: `The definitive hub for macro-verified protein ${siteConfig.foodType.toLowerCase()} recipes`,
        metaDescription: `Discover delicious high-protein ${siteConfig.foodType.toLowerCase()} recipes with accurate macro counts. Perfect for fitness enthusiasts and health-conscious bakers.`,
        isActive: true,
      }
    });
    console.log(`  ✓ Created site: ${siteConfig.domain} (ID: ${result.data.id})`);
    return result.data;
  } catch (error) {
    // Site might already exist, try to find it
    const existing = await apiRequest(`/sites?filters[domain][$eq]=${siteConfig.domain}`);
    if (existing.data && existing.data.length > 0) {
      console.log(`  ⚠ Site already exists: ${siteConfig.domain} (ID: ${existing.data[0].id})`);
      return existing.data[0];
    }
    throw error;
  }
}

async function createCategory(category, siteId) {
  console.log(`  Creating category: ${category.name}`);
  
  try {
    const result = await apiRequest('/categories', 'POST', {
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        site: siteId,
      }
    });
    return result.data;
  } catch (error) {
    // Category might already exist
    const existing = await apiRequest(`/categories?filters[slug][$eq]=${category.slug}&filters[site][id][$eq]=${siteId}`);
    if (existing.data && existing.data.length > 0) {
      return existing.data[0];
    }
    throw error;
  }
}

async function createRecipe(recipe, siteId, categoryMap) {
  console.log(`  Creating recipe: ${recipe.title}`);
  
  // Map category slugs to IDs
  const categoryIds = (recipe.categories || [])
    .map(slug => categoryMap[slug])
    .filter(id => id);
  
  // Format ingredients
  const ingredients = (recipe.ingredients || []).map(ing => ({
    name: ing.name || ing,
    amount: ing.amount || '',
    unit: ing.unit || '',
    notes: ing.notes || '',
  }));
  
  // Format instructions
  const instructions = (recipe.instructions || []).map((inst, index) => ({
    stepNumber: index + 1,
    instruction: typeof inst === 'string' ? inst : inst.text || inst.instruction,
  }));
  
  try {
    const result = await apiRequest('/recipes', 'POST', {
      data: {
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        prepTime: recipe.prepTime || 10,
        cookTime: recipe.cookTime || 15,
        totalTime: recipe.totalTime || (recipe.prepTime || 10) + (recipe.cookTime || 15),
        servings: recipe.servings || recipe.yield || 12,
        difficulty: recipe.difficulty || 'Easy',
        calories: recipe.nutrition?.calories || recipe.calories || 150,
        protein: recipe.nutrition?.protein || recipe.protein || 15,
        carbs: recipe.nutrition?.carbs || recipe.carbs || 10,
        fat: recipe.nutrition?.fat || recipe.fat || 5,
        fiber: recipe.nutrition?.fiber || recipe.fiber || 2,
        sugar: recipe.nutrition?.sugar || recipe.sugar || 3,
        ingredients: ingredients,
        instructions: instructions,
        tips: recipe.tips || [],
        tags: recipe.tags || [],
        site: siteId,
        categories: categoryIds,
        isPublished: true,
      }
    });
    console.log(`    ✓ Created: ${recipe.title}`);
    return result.data;
  } catch (error) {
    console.error(`    ✗ Failed to create: ${recipe.title}`, error.message);
    return null;
  }
}

async function createRecipePack(pack, siteId, recipeMap) {
  console.log(`  Creating pack: ${pack.name}`);
  
  // Map recipe slugs to IDs
  const recipeIds = (pack.recipes || [])
    .map(slug => recipeMap[slug])
    .filter(id => id);
  
  try {
    const result = await apiRequest('/recipe-packs', 'POST', {
      data: {
        name: pack.name,
        slug: pack.slug,
        description: pack.description,
        isFree: pack.isFree !== false,
        site: siteId,
        recipes: recipeIds,
      }
    });
    console.log(`    ✓ Created pack: ${pack.name}`);
    return result.data;
  } catch (error) {
    console.error(`    ✗ Failed to create pack: ${pack.name}`, error.message);
    return null;
  }
}

async function seedSite(siteConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Seeding: ${siteConfig.domain}`);
  console.log('='.repeat(60));
  
  // Create site
  const site = await createSite(siteConfig);
  const siteId = site.id;
  
  // Create categories
  console.log('\nCreating categories...');
  const categoryMap = {};
  for (const category of categories) {
    const cat = await createCategory(category, siteId);
    categoryMap[category.slug] = cat.id;
  }
  
  // Load recipe data from JSON file
  const domainKey = siteConfig.domain.replace(/\./g, '-');
  const recipesPath = path.join(__dirname, '..', '..', 'protein-empire', 'data', 'recipes', domainKey, 'recipes.json');
  
  if (!fs.existsSync(recipesPath)) {
    console.log(`\n⚠ No recipe data found at: ${recipesPath}`);
    console.log('  Skipping recipe import for this site.');
    return;
  }
  
  const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
  const recipes = recipesData.recipes || recipesData;
  
  // Create recipes
  console.log(`\nCreating ${recipes.length} recipes...`);
  const recipeMap = {};
  for (const recipe of recipes) {
    const created = await createRecipe(recipe, siteId, categoryMap);
    if (created) {
      recipeMap[recipe.slug] = created.id;
    }
  }
  
  // Load and create recipe packs
  const packsPath = path.join(__dirname, '..', '..', 'protein-empire', 'data', 'recipes', domainKey, 'packs.json');
  
  if (fs.existsSync(packsPath)) {
    const packsData = JSON.parse(fs.readFileSync(packsPath, 'utf8'));
    const packs = packsData.packs || packsData;
    
    console.log(`\nCreating ${packs.length} recipe packs...`);
    for (const pack of packs) {
      await createRecipePack(pack, siteId, recipeMap);
    }
  }
  
  console.log(`\n✓ Completed seeding: ${siteConfig.domain}`);
}

async function main() {
  console.log('Protein Empire CMS - Data Seed Script');
  console.log('=====================================');
  console.log(`Strapi URL: ${STRAPI_URL}`);
  console.log('');
  
  // Test connection
  try {
    await apiRequest('/sites?pagination[limit]=1');
    console.log('✓ Connected to Strapi API');
  } catch (error) {
    console.error('✗ Failed to connect to Strapi API');
    console.error('  Make sure Strapi is running and the API token is valid');
    process.exit(1);
  }
  
  // Seed each site
  for (const siteConfig of sites) {
    try {
      await seedSite(siteConfig);
    } catch (error) {
      console.error(`\n✗ Error seeding ${siteConfig.domain}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Data seeding complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
