import { FoodService } from './services';
import { executeQuery } from './sqlite';

const COMMON_FOODS = [
  // === PROTEINS ===
  { name: 'Chicken Breast', protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  { name: 'Chicken Thigh', protein: 24, carbs: 0, fat: 8.5, calories: 177 },
  { name: 'Turkey Breast', protein: 29, carbs: 0, fat: 1.5, calories: 135 },
  { name: 'Beef (lean 90/10)', protein: 26, carbs: 0, fat: 8, calories: 180 },
  { name: 'Beef (ribeye)', protein: 22, carbs: 0, fat: 22, calories: 290 },
  { name: 'Beef Liver', protein: 26, carbs: 6, fat: 4.8, calories: 170 },
  { name: 'Ground Beef 80/20', protein: 20, carbs: 0, fat: 20, calories: 260 },
  { name: 'Pork Loin', protein: 27, carbs: 0, fat: 6, calories: 170 },
  { name: 'Pork Chop', protein: 25, carbs: 0, fat: 12, calories: 214 },
  { name: 'Bacon (pan fried)', protein: 37, carbs: 1, fat: 42, calories: 541, portion: 20 },
  { name: 'Lamb Chop', protein: 25, carbs: 0, fat: 20, calories: 280 },
  { name: 'Salmon (Atlantic)', protein: 25, carbs: 0, fat: 13, calories: 208 },
  { name: 'Salmon (canned)', protein: 24, carbs: 0, fat: 11, calories: 195 },
  { name: 'Tuna (canned in water)', protein: 29, carbs: 0, fat: 1.3, calories: 132 },
  { name: 'Cod', protein: 23, carbs: 0, fat: 0.7, calories: 105 },
  { name: 'Shrimp', protein: 24, carbs: 0.2, fat: 1.7, calories: 99 },
  { name: 'Sardines (canned in oil)', protein: 25, carbs: 0, fat: 11, calories: 208 },
  { name: 'Egg (whole)', protein: 13, carbs: 1.1, fat: 11, calories: 155, portion: 50 },
  { name: 'Egg White', protein: 11, carbs: 0.7, fat: 0, calories: 52, portion: 50 },
  { name: 'Greek Yogurt (nonfat)', protein: 10, carbs: 3.6, fat: 0.4, calories: 59 },
  { name: 'Greek Yogurt (whole)', protein: 9, carbs: 4, fat: 5, calories: 97 },
  { name: 'Cottage Cheese', protein: 11, carbs: 3.4, fat: 4.3, calories: 98 },
  { name: 'Tofu (firm)', protein: 8, carbs: 2, fat: 4.8, calories: 76 },
  { name: 'Tempeh', protein: 19, carbs: 9, fat: 11, calories: 193 },
  { name: 'Seitan', protein: 25, carbs: 14, fat: 2, calories: 150 },
  { name: 'Edamame', protein: 12, carbs: 9, fat: 5, calories: 122 },
  { name: 'Protein Bar (generic)', protein: 30, carbs: 20, fat: 8, calories: 270, portion: 60 },
  { name: 'Whey Protein Powder', protein: 80, carbs: 6, fat: 2, calories: 360, portion: 30 },
  { name: 'Casein Protein', protein: 75, carbs: 5, fat: 1.5, calories: 340, portion: 30 },
  { name: 'Jerky (beef)', protein: 33, carbs: 11, fat: 5, calories: 230, portion: 28 },

  // === GRAINS & CARBS ===
  { name: 'White Rice (cooked)', protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
  { name: 'Brown Rice (cooked)', protein: 2.6, carbs: 23, fat: 1, calories: 112 },
  { name: 'Quinoa (cooked)', protein: 4.4, carbs: 21, fat: 1.9, calories: 120 },
  { name: 'Couscous (cooked)', protein: 3.8, carbs: 23, fat: 0.4, calories: 112 },
  { name: 'Barley (cooked)', protein: 2.3, carbs: 28, fat: 0.4, calories: 123 },
  { name: 'Oatmeal', protein: 10.7, carbs: 54.3, fat: 5.7, calories: 389 },
  { name: 'Pasta (cooked)', protein: 5.8, carbs: 30, fat: 1.1, calories: 158 },
  { name: 'Whole Wheat Pasta', protein: 7.5, carbs: 26, fat: 1.2, calories: 150 },
  { name: 'White Bread', protein: 8.7, carbs: 49, fat: 3.3, calories: 265 },
  { name: 'Whole Wheat Bread', protein: 13, carbs: 43, fat: 3.4, calories: 258 },
  { name: 'Rice Cakes', protein: 2.5, carbs: 20, fat: 0.5, calories: 95, portion: 35 },
  { name: 'Potato (baked)', protein: 2, carbs: 17, fat: 0.1, calories: 77 },
  { name: 'Sweet Potato', protein: 1.6, carbs: 20.1, fat: 0.1, calories: 86 },
  { name: 'Corn (sweet)', protein: 3.3, carbs: 21, fat: 1.4, calories: 96 },
  { name: 'Popcorn (air-popped)', protein: 12, carbs: 18, fat: 4.3, calories: 387, portion: 30 },
  { name: 'Tortilla (corn)', protein: 5.7, carbs: 44, fat: 2.5, calories: 218, portion: 50 },
  { name: 'Tortilla (flour)', protein: 8.2, carbs: 46, fat: 5.5, calories: 268, portion: 60 },
  { name: 'Granola', protein: 10, carbs: 65, fat: 15, calories: 400, portion: 50 },
  { name: 'Honey', protein: 0.3, carbs: 82, fat: 0, calories: 304, portion: 21 },
  { name: 'Maple Syrup', protein: 0, carbs: 67, fat: 0, calories: 260, portion: 20 },

  // === FRUITS ===
  { name: 'Banana', protein: 1.1, carbs: 23, fat: 0.3, calories: 89, portion: 120 },
  { name: 'Apple', protein: 0.3, carbs: 25, fat: 0.2, calories: 95, portion: 182 },
  { name: 'Orange', protein: 0.9, carbs: 12, fat: 0.1, calories: 47, portion: 130 },
  { name: 'Grapes', protein: 0.7, carbs: 18, fat: 0.2, calories: 69, portion: 100 },
  { name: 'Strawberries', protein: 0.7, carbs: 8, fat: 0.3, calories: 32, portion: 100 },
  { name: 'Blueberries', protein: 0.7, carbs: 14, fat: 0.3, calories: 57, portion: 100 },
  { name: 'Mango', protein: 0.8, carbs: 15, fat: 0.4, calories: 60, portion: 100 },
  { name: 'Pineapple', protein: 0.5, carbs: 13, fat: 0.1, calories: 50, portion: 100 },
  { name: 'Watermelon', protein: 0.6, carbs: 8, fat: 0.2, calories: 30, portion: 150 },
  { name: 'Dates (medjool)', protein: 2, carbs: 75, fat: 0.1, calories: 277, portion: 24 },
  { name: 'Raisins', protein: 3, carbs: 79, fat: 0.5, calories: 299, portion: 28 },
  { name: 'Avocado', protein: 2, carbs: 9, fat: 15, calories: 160, portion: 100 },
  { name: 'Coconut (meat)', protein: 3.3, carbs: 15, fat: 34, calories: 354 },
  { name: 'Peach', protein: 0.9, carbs: 10, fat: 0.3, calories: 39, portion: 150 },
  { name: 'Kiwi', protein: 1.1, carbs: 15, fat: 0.5, calories: 61, portion: 75 },
  { name: 'Papaya', protein: 0.5, carbs: 11, fat: 0.3, calories: 43, portion: 140 },

  // === VEGETABLES ===
  { name: 'Broccoli', protein: 2.8, carbs: 7, fat: 0.4, calories: 34 },
  { name: 'Spinach', protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23 },
  { name: 'Kale', protein: 4.3, carbs: 9, fat: 1.5, calories: 50 },
  { name: 'Carrot', protein: 0.9, carbs: 10, fat: 0.2, calories: 41 },
  { name: 'Tomato', protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18 },
  { name: 'Bell Pepper (red)', protein: 1, carbs: 6, fat: 0.3, calories: 31 },
  { name: 'Bell Pepper (green)', protein: 0.9, carbs: 4.6, fat: 0.2, calories: 20 },
  { name: 'Cucumber', protein: 0.7, carbs: 3.6, fat: 0.1, calories: 15 },
  { name: 'Zucchini', protein: 1.2, carbs: 3.1, fat: 0.3, calories: 17 },
  { name: 'Onion (white)', protein: 1.1, carbs: 9, fat: 0.1, calories: 40 },
  { name: 'Garlic', protein: 6.4, carbs: 33, fat: 0.5, calories: 149, portion: 10 },
  { name: 'Cauliflower', protein: 1.9, carbs: 5, fat: 0.3, calories: 25 },
  { name: 'Asparagus', protein: 2.2, carbs: 4, fat: 0.2, calories: 20 },
  { name: 'Green Beans', protein: 1.8, carbs: 7, fat: 0.2, calories: 31 },
  { name: 'Mushrooms (white)', protein: 3.1, carbs: 3.3, fat: 0.3, calories: 22 },
  { name: 'Lettuce (iceberg)', protein: 0.9, carbs: 2.9, fat: 0.1, calories: 14 },
  { name: 'Celery', protein: 0.7, carbs: 3, fat: 0.2, calories: 16 },
  { name: 'Cabbage (green)', protein: 1.3, carbs: 6, fat: 0.1, calories: 25 },
  { name: 'Brussels Sprouts', protein: 3.4, carbs: 9, fat: 0.3, calories: 43 },
  { name: 'Eggplant', protein: 1, carbs: 6, fat: 0.2, calories: 25 },
  { name: 'Peas (green)', protein: 5.4, carbs: 14, fat: 0.4, calories: 81 },
  { name: 'Beetroot', protein: 1.6, carbs: 10, fat: 0.2, calories: 43 },

  // === LEGUMES ===
  { name: 'Black Beans (cooked)', protein: 8.9, carbs: 24, fat: 0.5, calories: 132 },
  { name: 'Chickpeas (cooked)', protein: 8.9, carbs: 27, fat: 2.6, calories: 139 },
  { name: 'Lentils (cooked)', protein: 9, carbs: 20, fat: 0.4, calories: 116 },
  { name: 'Kidney Beans (cooked)', protein: 8.7, carbs: 23, fat: 0.5, calories: 127 },
  { name: 'Pinto Beans (cooked)', protein: 9, carbs: 26, fat: 0.7, calories: 143 },
  { name: 'Soybeans (cooked)', protein: 16.6, carbs: 10, fat: 9, calories: 173 },
  { name: 'Hummus', protein: 8, carbs: 15, fat: 10, calories: 166, portion: 100 },

  // === NUTS & SEEDS ===
  { name: 'Almonds', protein: 21, carbs: 22, fat: 50, calories: 579, portion: 28 },
  { name: 'Walnuts', protein: 15, carbs: 14, fat: 65, calories: 654, portion: 28 },
  { name: 'Cashews', protein: 18, carbs: 30, fat: 44, calories: 553, portion: 28 },
  { name: 'Pistachios', protein: 20, carbs: 28, fat: 45, calories: 560, portion: 28 },
  { name: 'Macadamia Nuts', protein: 8, carbs: 14, fat: 76, calories: 718, portion: 28 },
  { name: 'Pecans', protein: 9, carbs: 14, fat: 72, calories: 691, portion: 28 },
  { name: 'Hazelnuts', protein: 15, carbs: 17, fat: 61, calories: 628, portion: 28 },
  { name: 'Brazil Nuts', protein: 14, carbs: 12, fat: 66, calories: 656, portion: 28 },
  { name: 'Chia Seeds', protein: 17, carbs: 42, fat: 31, calories: 486, portion: 28 },
  { name: 'Flax Seeds', protein: 18, carbs: 29, fat: 42, calories: 534, portion: 28 },
  { name: 'Sunflower Seeds', protein: 21, carbs: 20, fat: 51, calories: 584, portion: 28 },
  { name: 'Pumpkin Seeds', protein: 30, carbs: 10, fat: 49, calories: 559, portion: 28 },
  { name: 'Peanut Butter', protein: 25, carbs: 20, fat: 50, calories: 588, portion: 32 },
  { name: 'Almond Butter', protein: 21, carbs: 19, fat: 56, calories: 614, portion: 32 },
  { name: 'Tahini', protein: 17, carbs: 14, fat: 53, calories: 595, portion: 15 },

  // === DAIRY & ALTERNATIVES ===
  { name: 'Milk (whole)', protein: 3.2, carbs: 4.8, fat: 3.3, calories: 61, portion: 240 },
  { name: 'Milk (2%)', protein: 3.3, carbs: 4.8, fat: 2, calories: 49, portion: 240 },
  { name: 'Milk (skim)', protein: 3.4, carbs: 5, fat: 0.2, calories: 34, portion: 240 },
  { name: 'Almond Milk (unsweetened)', protein: 0.4, carbs: 0.5, fat: 1.1, calories: 13, portion: 240 },
  { name: 'Oat Milk', protein: 1, carbs: 16, fat: 1.5, calories: 80, portion: 240 },
  { name: 'Coconut Milk (canned)', protein: 2.3, carbs: 3.3, fat: 20, calories: 197 },
  { name: 'Heavy Cream', protein: 2.8, carbs: 2.8, fat: 36, calories: 340, portion: 30 },
  { name: 'Butter (salted)', protein: 0.9, carbs: 0.1, fat: 81, calories: 717, portion: 14 },
  { name: 'Cheese (cheddar)', protein: 25, carbs: 1.3, fat: 33, calories: 403 },
  { name: 'Cheese (mozzarella)', protein: 22, carbs: 2.2, fat: 22, calories: 280 },
  { name: 'Cheese (parmesan)', protein: 35, carbs: 3, fat: 26, calories: 392 },
  { name: 'Cheese (ricotta)', protein: 11, carbs: 3, fat: 13, calories: 174 },
  { name: 'Cheese (cream cheese)', protein: 6, carbs: 4, fat: 34, calories: 342, portion: 28 },
  { name: 'Sour Cream', protein: 2.4, carbs: 4.2, fat: 20, calories: 198, portion: 30 },
  { name: 'Ice Cream (vanilla)', protein: 3.5, carbs: 21, fat: 11, calories: 207, portion: 100 },

  // === OILS & FATS ===
  { name: 'Olive Oil (extra virgin)', protein: 0, carbs: 0, fat: 100, calories: 884, portion: 15 },
  { name: 'Coconut Oil', protein: 0, carbs: 0, fat: 100, calories: 862, portion: 15 },
  { name: 'Canola Oil', protein: 0, carbs: 0, fat: 100, calories: 884, portion: 15 },
  { name: 'Sesame Oil', protein: 0, carbs: 0, fat: 100, calories: 884, portion: 15 },
  { name: 'Ghee', protein: 0.3, carbs: 0, fat: 99, calories: 876, portion: 15 },
  { name: 'Mayonnaise', protein: 1, carbs: 0.6, fat: 75, calories: 680, portion: 15 },

  // === CONDIMENTS & SAUCES ===
  { name: 'Ketchup', protein: 1, carbs: 22, fat: 0.1, calories: 101, portion: 15 },
  { name: 'Mustard (yellow)', protein: 3.7, carbs: 5, fat: 3.2, calories: 66, portion: 10 },
  { name: 'Soy Sauce', protein: 5.6, carbs: 4.7, fat: 0.1, calories: 53, portion: 15 },
  { name: 'Salsa (tomato)', protein: 1.5, carbs: 7, fat: 0.2, calories: 29, portion: 30 },
  { name: 'Hot Sauce', protein: 0.5, carbs: 1, fat: 0.3, calories: 10, portion: 10 },
  { name: 'BBQ Sauce', protein: 0.5, carbs: 40, fat: 0.5, calories: 165, portion: 30 },
  { name: 'Ranch Dressing', protein: 1.5, carbs: 4, fat: 46, calories: 435, portion: 30 },
  { name: 'Italian Dressing', protein: 0.3, carbs: 5, fat: 32, calories: 300, portion: 30 },
  { name: 'Balsamic Vinegar', protein: 0.5, carbs: 17, fat: 0, calories: 88, portion: 15 },

  // === BEVERAGES ===
  { name: 'Orange Juice', protein: 0.7, carbs: 11, fat: 0.2, calories: 45, portion: 240 },
  { name: 'Apple Juice', protein: 0.1, carbs: 12, fat: 0.1, calories: 46, portion: 240 },
  { name: 'Coconut Water', protein: 0.7, carbs: 3.7, fat: 0, calories: 19, portion: 240 },
  { name: 'Coffee (black)', protein: 0.3, carbs: 0, fat: 0, calories: 1, portion: 240 },
  { name: 'Green Tea', protein: 0, carbs: 0, fat: 0, calories: 1, portion: 240 },
  { name: 'Gatorade', protein: 0, carbs: 6, fat: 0, calories: 24, portion: 240 },
  { name: 'Chocolate Milk', protein: 3.5, carbs: 14, fat: 3, calories: 90, portion: 240 },

  // === SNACKS & SWEETS ===
  { name: 'Dark Chocolate (70%)', protein: 8, carbs: 46, fat: 43, calories: 598, portion: 28 },
  { name: 'Milk Chocolate', protein: 7, carbs: 52, fat: 33, calories: 546, portion: 28 },
  { name: 'Granola Bar', protein: 7, carbs: 22, fat: 6, calories: 170, portion: 40 },
  { name: 'Rice Crisp Treat', protein: 2, carbs: 22, fat: 4, calories: 130, portion: 30 },
  { name: 'Potato Chips', protein: 7, carbs: 52, fat: 34, calories: 542, portion: 28 },
  { name: 'Tortilla Chips', protein: 7, carbs: 68, fat: 22, calories: 490, portion: 28 },
  { name: 'Pretzels', protein: 10, carbs: 80, fat: 2.6, calories: 380, portion: 28 },
  { name: 'Crackers (saltine)', protein: 2.3, carbs: 21, fat: 2.7, calories: 120, portion: 30 },
  { name: 'Cookie (chocolate chip)', protein: 4, carbs: 55, fat: 24, calories: 460, portion: 30 },
  { name: 'Brownie', protein: 4, carbs: 50, fat: 20, calories: 400, portion: 60 },
  { name: 'Muffin (blueberry)', protein: 5, carbs: 50, fat: 15, calories: 370, portion: 100 },
  { name: 'Pancake', protein: 6, carbs: 28, fat: 8, calories: 200, portion: 80 },
  { name: 'French Toast', protein: 8, carbs: 28, fat: 12, calories: 250, portion: 100 },
  { name: 'Jelly/Jam', protein: 0.1, carbs: 50, fat: 0, calories: 200, portion: 20 },
];

export async function seedFoods(): Promise<void> {
  try {
    const existingFoods = await executeQuery<any>(
      `SELECT COUNT(*) as count FROM foods`
    );

    if (existingFoods[0].count > 0) {
      console.log('Foods already seeded, skipping...');
      return;
    }

    console.log(`Seeding ${COMMON_FOODS.length} foods into database...`);

    for (const food of COMMON_FOODS) {
      await FoodService.create(
        food.name,
        food.protein,
        food.carbs,
        food.fat,
        food.calories,
        food.portion || 100
      );
    }

    console.log('Foods seeded successfully!');
  } catch (error) {
    console.error('Error seeding foods:', error);
  }
}
