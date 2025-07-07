export interface FoodIngredientInventory {
    id?: number; // Make 'id' optional by adding '?'
    food_ingredient_id: number;
    quantity: number;
    total_amount: number;
    supplier_id: number;
    // You can add other properties here if needed
}
