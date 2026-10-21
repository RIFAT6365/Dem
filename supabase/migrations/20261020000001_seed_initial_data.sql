-- ==============================================================================
-- DEM RESTAURANT — SEED DATA MIGRATION
-- Inserts initial categories, default site settings, navigation, and coupons
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image, display_order, is_active)
VALUES
  ('cat-1', 'Biryani & Rice', 'biryani-and-rice', 'Aromatic basmati rice cooked with authentic spices, tender meats, and saffron essence.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 1, true),
  ('cat-2', 'Curries & Gravies', 'curries-and-gravies', 'Slow-simmered gravies packed with royal heritage, hand-ground spices, and rich flavors.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 2, true),
  ('cat-3', 'Grills & Kebabs', 'grills-and-kebabs', 'Charcoal-grilled skewers, smoky marinated tandoori delights, and sizzling platters.', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', 3, true),
  ('cat-4', 'Burgers & Fast Food', 'burgers-and-fast-food', 'Juicy handcrafted patties, crisp gourmet buns, loaded fries, and chef special sauces.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 4, true),
  ('cat-5', 'Appetizers & Breads', 'appetizers-and-breads', 'Fluffy clay-oven naans, parathas, crisp samosas, wings, and savory starters.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', 5, true),
  ('cat-6', 'Desserts & Sweets', 'desserts-and-sweets', 'Indulgent traditional desserts, velvety falooda, saffron firni, and sweet conclusions.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 6, true),
  ('cat-7', 'Beverages & Mocktails', 'beverages-and-mocktails', 'Chilled mango lassi, mint coolers, spiced masala teas, and refreshing mocktails.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', 7, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- 2. Insert Products
INSERT INTO public.products (
  id, name, slug, short_description, full_description, category_id,
  images, price, sale_price, is_available, is_featured, is_bestseller,
  ingredients, dietary_labels, spice_level, prep_time_minutes, addons, rating, review_count
)
VALUES
  (
    'prod-1', 'Chicken Biryani', 'chicken-biryani',
    'Traditional chicken biryani with aromatic spices and saffron-infused basmati.',
    'Our signature Royal Chicken Biryani is crafted with marinated tender farm chicken cooked dum-style with premium long-grain Basmati rice, slow-infused with saffron, cardamom, cloves, and caramelized onions. Served with spiced boiled egg and cooling mint raita.',
    'cat-1',
    '["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    180.00, 165.00, true, true, true,
    '["Basmati Rice", "Farm Fresh Chicken", "Saffron", "Ghee", "Fried Onions", "Cardamom", "Coriander"]'::jsonb,
    '["Halal", "Chef''s Special"]'::jsonb,
    'Medium', 20,
    '[{"id": "opt-egg", "name": "Extra Boiled Egg", "price": 20}, {"id": "opt-raita", "name": "Cooling Mint Cucumber Raita", "price": 30}, {"id": "opt-leg", "name": "Extra Chicken Roast Piece", "price": 90}]'::jsonb,
    4.9, 142
  ),
  (
    'prod-2', 'Mutton Kacchi Biryani', 'mutton-kacchi-biryani',
    'Old Dhaka royal style tender mutton slow dum cooked with potato and aromatic spices.',
    'Legendary Old Dhaka recipe featuring marinated fresh mutton ribs and shanks layered raw with fragrant chinigura / basmati rice, potatoes, dried alubukhara, and pure ghee.',
    'cat-1',
    '["https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    320.00, 295.00, true, true, true,
    '["Mutton Ribs", "Aromatic Rice", "Potatoes", "Prunes", "Pure Ghee", "Mawa"]'::jsonb,
    '["Halal", "Traditional Classic"]'::jsonb,
    'Medium', 25,
    '[{"id": "opt-pot", "name": "Extra Spiced Kacchi Potato", "price": 30}, {"id": "opt-borhani", "name": "Chilled Borhani", "price": 45}]'::jsonb,
    5.0, 218
  ),
  (
    'prod-3', 'Butter Chicken Makhani', 'butter-chicken-makhani',
    'Charcoal-roasted tandoori chicken tikka simmered in creamy satin tomato velvet gravy.',
    'Tender boneless chicken fillets char-grilled in our tandoor clay oven, then finished in a silky, mildly spiced butter and cream tomato gravy laced with dried fenugreek (kasuri methi).',
    'cat-2',
    '["https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    280.00, 250.00, true, true, false,
    '["Boneless Chicken", "Butter", "Dairy Cream", "Tomatoes", "Cashew Paste", "Fenugreek Leaves"]'::jsonb,
    '["Halal", "Mild & Creamy"]'::jsonb,
    'Mild', 18,
    '[{"id": "opt-garlic-naan", "name": "Add Hot Garlic Naan", "price": 45}, {"id": "opt-cheese", "name": "Extra Melted Cheese Layer", "price": 40}]'::jsonb,
    4.8, 97
  ),
  (
    'prod-4', 'Beef Reshmi Kebab Skewer', 'beef-reshmi-kebab',
    'Melt-in-mouth spiced minced beef skewers infused with green herbs and smoked butter.',
    'Finely minced lean beef infused with ginger, coriander, green chilies, and cream. Grilled to juicy perfection over charcoal and served with onion rings and mint coriander dip.',
    'cat-3',
    '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    220.00, NULL, true, false, true,
    '["Minced Beef", "Papaya Marinade", "Mint", "Green Chili", "Smoked Butter"]'::jsonb,
    '["Halal", "Charcoal Grilled"]'::jsonb,
    'Medium', 15,
    '[{"id": "opt-rumali", "name": "Add 2 Soft Rumali Rotis", "price": 35}]'::jsonb,
    4.7, 85
  ),
  (
    'prod-5', 'Royal Cheese Burger', 'royal-cheese-burger',
    'Handcrafted premium beef smash patty with cheddar, caramelized onions, and secret sauce.',
    '150g grilled prime beef patty, melted aged English cheddar cheese, sweet caramelized balsamic onions, crisp butterhead lettuce, and house royal sauce in a toasted brioche bun.',
    'cat-4',
    '["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    210.00, 190.00, true, true, true,
    '["Beef Patty", "Brioche Bun", "Cheddar Cheese", "Balsamic Onions", "Secret Sauce"]'::jsonb,
    '["Halal", "Gourmet Fast Food"]'::jsonb,
    'Mild', 12,
    '[{"id": "opt-patty", "name": "Make it Double Patty", "price": 95}, {"id": "opt-fries", "name": "Large Seasoned Fries", "price": 50}]'::jsonb,
    4.9, 160
  ),
  (
    'prod-6', 'Garlic Butter Naan', 'garlic-butter-naan',
    'Leavened flatbread baked on tandoor walls, brushed with crushed roasted garlic and pure butter.',
    'Soft and pillowy leavened flatbread charred in the clay oven, then generously slathered with roasted garlic, melted butter, and fresh coriander.',
    'cat-5',
    '["https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    50.00, NULL, true, false, false,
    '["Flour", "Milk", "Yeast", "Garlic", "Butter", "Coriander"]'::jsonb,
    '["Vegetarian", "Clay Oven Baked"]'::jsonb,
    'None', 8,
    '[]'::jsonb,
    4.7, 95
  ),
  (
    'prod-7', 'Saffron Firni in Clay Cup', 'saffron-firni-clay-cup',
    'Velvety ground rice pudding scented with royal saffron, green cardamom, pistachios, and silver leaf.',
    'Chilled festive dessert cooked with milk, ground aromatic rice, crushed almonds, pistachios, and Kashmiri saffron, set in traditional earthen clay cups (matka).',
    'cat-6',
    '["https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    90.00, 80.00, true, true, false,
    '["Milk", "Rice", "Saffron", "Pistachio", "Cardamom", "Rosewater"]'::jsonb,
    '["Vegetarian", "Traditional Sweet"]'::jsonb,
    'None', 5,
    '[]'::jsonb,
    4.9, 82
  ),
  (
    'prod-8', 'Royal Mango Lassi', 'royal-mango-lassi',
    'Thick chilled yogurt smoothie blended with ripe Alphonso mango puree and a touch of cardamom.',
    'A refreshing blend of cultured whole yogurt, sweet mango pulp, milk, and crushed ice, crowned with chopped pistachios.',
    'cat-7',
    '["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"]'::jsonb,
    110.00, 95.00, true, true, true,
    '["Yogurt", "Ripe Mango", "Cardamom", "Sugar", "Pistachio"]'::jsonb,
    '["Vegetarian", "Refreshing Drink"]'::jsonb,
    'None', 5,
    '[]'::jsonb,
    4.9, 110
  )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    images = EXCLUDED.images,
    category_id = EXCLUDED.category_id,
    addons = EXCLUDED.addons,
    updated_at = NOW();

-- 3. Insert Coupons
INSERT INTO public.coupons (id, code, name, discount_type, discount_value, min_order_value, max_discount, usage_limit, is_active)
VALUES
  ('c-1', 'ROYAL50', 'Royal 50 BDT Off', 'fixed', 50.00, 300.00, NULL, 500, true),
  ('c-2', 'FREEDELIVERY', 'Free Delivery Deal', 'fixed', 60.00, 500.00, NULL, 1000, true),
  ('c-3', 'DEMO15', '15% Off Feast Coupon', 'percentage', 15.00, 400.00, 150.00, 200, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Default Site Settings
INSERT INTO public.site_settings (id, settings, updated_at)
VALUES (
  'current',
  '{
    "restaurantName": "DEM Restaurant",
    "tagline": "Royal Dining & Exquisite Culinary Flavors",
    "phone": "+880 1711 223344",
    "email": "contact@dem-restaurant.com",
    "address": "House 42, Road 7/A, Dhanmondi R/A, Dhaka-1209, Bangladesh",
    "openingHours": "Daily: 11:30 AM – 11:00 PM",
    "currency": "BDT",
    "currencySymbol": "৳",
    "deliveryFee": 60,
    "freeDeliveryThreshold": 800,
    "taxRatePercent": 5,
    "minOrderAmount": 150,
    "allowPickup": true,
    "allowCashOnDelivery": true,
    "allowOnlinePayment": true,
    "reservationNotice": "Please arrive 15 minutes prior to your booking. Reserved tables are held for 20 minutes.",
    "facebookUrl": "https://facebook.com/demrestaurant",
    "instagramUrl": "https://instagram.com/demrestaurant",
    "twitterUrl": "https://twitter.com/demrestaurant"
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET settings = EXCLUDED.settings,
    updated_at = NOW();

-- 5. Insert Navigation Links
INSERT INTO public.navigation_items (id, label, path, is_visible, order_num)
VALUES
  ('nav-1', 'Home', '/', true, 1),
  ('nav-2', 'Food Menu', '/menu', true, 2),
  ('nav-3', 'Order Online', '/order', true, 3),
  ('nav-4', 'Reservations', '/reservations', true, 4),
  ('nav-5', 'Offers & Deals', '/offers', true, 5),
  ('nav-6', 'Gallery', '/gallery', true, 6),
  ('nav-7', 'Reviews', '/reviews', true, 7),
  ('nav-8', 'About Us', '/about', true, 8),
  ('nav-9', 'Contact', '/contact', true, 9)
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    path = EXCLUDED.path,
    is_visible = EXCLUDED.is_visible,
    order_num = EXCLUDED.order_num;
