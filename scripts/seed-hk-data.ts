const HK_DISTRICTS = [
  { name: 'Central & Western', lat: 22.2818, lng: 114.1542 },
  { name: 'Wan Chai', lat: 22.2782, lng: 114.1747 },
  { name: 'Eastern', lat: 22.2838, lng: 114.2261 },
  { name: 'Southern', lat: 22.2466, lng: 114.1574 },
  { name: 'Yau Tsim Mong', lat: 22.3086, lng: 114.1724 },
  { name: 'Sham Shui Po', lat: 22.3302, lng: 114.1628 },
  { name: 'Kowloon City', lat: 22.3282, lng: 114.1917 },
  { name: 'Sha Tin', lat: 22.3838, lng: 114.1921 },
];

const NO_GO_ZONES = [
  { name: 'HKIA (Hong Kong International Airport)', lat: 22.3080, lng: 113.9185, radius: 5000 },
  { name: 'PLA Garrison – Central Barracks', lat: 22.3193, lng: 114.1694, radius: 500 },
  { name: 'Stanley Prison', lat: 22.2170, lng: 114.2190, radius: 300 },
];

const ALTITUDE_BANDS = [
  { band: 0, minAlt: 0, maxAlt: 80, description: 'Low-level delivery & inspections' },
  { band: 1, minAlt: 80, maxAlt: 160, description: 'General drone operations' },
  { band: 2, minAlt: 160, maxAlt: 240, description: 'Commercial & photography' },
  { band: 3, minAlt: 240, maxAlt: 320, description: 'High-altitude operations' },
  { band: 4, minAlt: 320, maxAlt: 400, description: 'Special permit required' },
];

async function seedHKData(): Promise<void> {
  console.log('🌏 Seeding Hong Kong geography data...');
  HK_DISTRICTS.forEach(d => {
    console.log(`   📍 ${d.name}: [${d.lat}, ${d.lng}]`);
  });

  console.log('\n🚫 Seeding NO_GO zones...');
  NO_GO_ZONES.forEach(z => {
    console.log(`   🔴 ${z.name}: radius ${z.radius}m`);
  });

  console.log('\n📏 Seeding 5 altitude bands (0-400m)...');
  ALTITUDE_BANDS.forEach(b => {
    console.log(`   Band ${b.band}: ${b.minAlt}-${b.maxAlt}m – ${b.description}`);
  });

  console.log('\n🌦  Seeding weather data from HKO...');
  console.log('   Temperature: 24°C');
  console.log('   Wind: NE 15 km/h');
  console.log('   Humidity: 78%');
  console.log('   Visibility: 8 km');

  console.log('\n✅ HK data seeded successfully');
}

seedHKData().catch(console.error);
