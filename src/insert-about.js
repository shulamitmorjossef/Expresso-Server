import pool from './data-access/db.js';

const insertAboutData = async () => {
  try {
    await pool.query(`
      INSERT INTO about (title, section1, section2, section3, section4, section5)
      VALUES (
        'About EXpresso',
        'EXpresso is a unique digital coffee platform born from a blend of technology, a love for espresso, and a desire to bring a premium coffee experience into everyday homes. The site was developed by a team of third-year Software Engineering students as part of a final project in a Project Management course. Our goal wasn’t just to build a functional system—it was to create a meaningful, high-quality product that people would truly enjoy using.',
        'Whether you''re a casual coffee drinker or a true enthusiast, EXpresso offers a rich selection of coffee machines, flavorful capsules, milk frothers, and complementary accessories—all carefully selected to deliver a perfect cup, every single time. The site is designed to provide a seamless shopping experience, with intuitive navigation, smart product filtering, a user-friendly cart, and a smooth checkout process.',
        'Every product featured on EXpresso is chosen with attention to quality, comfort, and design. From premium coffee blends and precisely engineered machines to elegant frothers that complete the experience—our aim was to make every cup feel like a café moment at home, with just one click.',
        'EXpresso places technology at the core—both for the end user and site administrators. We developed a dedicated admin panel that enables easy product management, inventory updates, and real-time editing—all in a clean, responsive interface that’s accessible and simple to use.',
        'EXpresso is more than a project—it’s a hands-on journey in system development, product thinking, teamwork, and user experience design. From concept to code, we worked with passion, precision, and a touch of caffeine to create something we’re proud to share.'
      );
    `);
    

    console.log('✅ About content inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting about content:', error);
    process.exit(1);
  }
};

insertAboutData();
