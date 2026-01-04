import type { Schema, Struct } from '@strapi/strapi';

export interface RecipeIngredient extends Struct.ComponentSchema {
  collectionName: 'components_recipe_ingredients';
  info: {
    description: 'A recipe ingredient with amount in grams';
    displayName: 'Ingredient';
    icon: 'shopping-cart';
  };
  attributes: {
    amount: Schema.Attribute.Integer & Schema.Attribute.Required;
    category: Schema.Attribute.Enumeration<['dry', 'wet', 'topping', 'other']> &
      Schema.Attribute.DefaultTo<'dry'>;
    ingredientId: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    unit: Schema.Attribute.String & Schema.Attribute.DefaultTo<'g'>;
    usUnit: Schema.Attribute.String;
  };
}

export interface RecipeInstruction extends Struct.ComponentSchema {
  collectionName: 'components_recipe_instructions';
  info: {
    description: 'A recipe instruction step';
    displayName: 'Instruction';
    icon: 'list-ol';
  };
  attributes: {
    step: Schema.Attribute.Integer & Schema.Attribute.Required;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'recipe.ingredient': RecipeIngredient;
      'recipe.instruction': RecipeInstruction;
    }
  }
}
