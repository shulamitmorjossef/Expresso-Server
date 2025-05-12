


-- Create tables
CREATE TABLE IF NOT EXISTS terms (
  id SERIAL PRIMARY KEY,
  title TEXT,
  section1 TEXT,
  section2 TEXT,
  section3 TEXT,
  section4 TEXT,
  section5 TEXT
);

CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  title TEXT,
  section1 TEXT,
  section2 TEXT,
  section3 TEXT,
  section4 TEXT,
  section5 TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone VARCHAR (20),
  birthday DATE,
  password TEXT NOT NULL,
  user_type TEXT,
  manager_code TEXT
);

CREATE TABLE IF NOT EXISTS coffee_machines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  capacity INTEGER,
  price NUMERIC(10, 2),
  sum_of INTEGER DEFAULT 0,
  image BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS milk_frothers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  frothing_type TEXT,
  capacity INTEGER,
  price NUMERIC(10, 2),
  image_path TEXT,
  sum_of INTEGER DEFAULT 0,
  image BYTEA NOT NULL

);

CREATE TABLE IF NOT EXISTS capsules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  flavor TEXT NOT NULL,
  quantity_per_package INTEGER NOT NULL,
  net_weight_grams NUMERIC(10, 2),
  price NUMERIC(10, 2),
  ingredients TEXT,
  sum_of INTEGER DEFAULT 0,
  image BYTEA NOT NULL


);


CREATE TABLE IF NOT EXISTS coupons (
  codename TEXT PRIMARY KEY,
  discount_percent NUMERIC(5, 2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100)
);

CREATE TABLE IF NOT EXISTS delivery_dates (
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  PRIMARY KEY (day, month, year)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  order_date DATE NOT NULL
  
);

CREATE TABLE IF NOT EXISTS ordered_products (
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('coffee_machines', 'milk_frothers', 'capsules')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, product_id, product_type),

  );

CREATE TABLE IF NOT EXISTS shopping_cart (
  user_id INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  product_type TEXT NOT NULL CHECK (product_type IN ('coffee_machines', 'milk_frothers', 'capsules')),
  PRIMARY KEY (user_id, product_id, product_type),

);


-- Insert values
INSERT INTO about (title, section1, section2, section3, section4, section5)
VALUES (
  'About EXpresso',
  'EXpresso is a unique digital coffee platform born from a blend of technology, a love for espresso, and a desire to bring a premium coffee experience into everyday homes. The site was developed by a team of third-year Software Engineering students as part of a final project in a Project Management course. Our goal wasn’t just to build a functional system—it was to create a meaningful, high-quality product that people would truly enjoy using.',
  'Whether you''re a casual coffee drinker or a true enthusiast, EXpresso offers a rich selection of coffee machines, flavorful capsules, milk frothers, and complementary accessories—all carefully selected to deliver a perfect cup, every single time. The site is designed to provide a seamless shopping experience, with intuitive navigation, smart product filtering, a user-friendly cart, and a smooth checkout process.',
  'Every product featured on EXpresso is chosen with attention to quality, comfort, and design. From premium coffee blends and precisely engineered machines to elegant frothers that complete the experience—our aim was to make every cup feel like a café moment at home, with just one click.',
  'EXpresso places technology at the core—both for the end user and site administrators. We developed a dedicated admin panel that enables easy product management, inventory updates, and real-time editing—all in a clean, responsive interface that’s accessible and simple to use.',    
  'EXpresso is more than a project—it’s a hands-on journey in system development, product thinking, teamwork, and user experience design. From concept to code, we worked with passion, precision, and a touch of caffeine to create something we’re proud to share.'
);

INSERT INTO terms (title, section1, section2, section3, section4, section5)
VALUES (
  'Terms and Conditions',
  'Welcome to Expresso! These terms and conditions govern your use of our coffee capsule and machine sales platform.',
  'Products are for personal use only. Prices and availability may change without notice.',
  'By placing an order, you agree to provide accurate information and comply with our policies.',
  'We are not responsible for delays or issues caused by external factors such as shipping services.',
  'Thank you for choosing Expresso! We are committed to providing an excellent experience.'
);

INSERT INTO users (
  id, full_name, username, email, phone, birthday,
  password, user_type, manager_code
) VALUES
(1, 'Shulamit Mor', 'shuli123', 'shuli@example.com', '0501234567', '1998-06-14', '123456', 'regular', ''),
(2, 'Shulamit Mor Yossef', 'shulamit', 'shulamitmorjossef@gmail.com', '0537705378', '1999-12-14', '123', 'customer', ''),
(3, 'avish', 'avishag', 'Avishta@ac.sce.ac.il', '0556604424', '2004-04-28', 'fdkjfd3', 'customer', ''),
(4, '123', '11', '123@cv.com', '11', '1111-11-10', 'A@111111', 'customer', ''),
(5, 'avishq', 'avishae', 'Avisht@ac.sce.ac.il', '0556605424', '2004-04-28', 'Avishag2004@', 'customer', ''),
(6, 'shira asaraf', 'shira', 'shiraasaraf120@icloud.com', '0503371162', '2000-01-10', 'Ss110100!!', 'customer', ''),
(7, 'Yael Pinto', 'yaelp', 'yaelpinto741@gmail.com', '0545663639', '2004-07-18', 'Yp963741@', 'customer', ''),
(8, 'yty', 'yael9', 'yaelpinto@gmail.com', '0545663637', '8999-07-18', 'Yp963741@', 'customer', ''),
(9, 'Yael P', 'yael8', 'yaeli@gmail.com', '054566363', '2004-07-18', 'Yp963741@', 'customer', ''),
(10, 'shulamit', 'general', 'shulamit@gmail.com', '0537705379', '1999-12-14', 'A!123456', 'manager', 'ASSSSAY8');
