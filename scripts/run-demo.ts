const args = process.argv.slice(2);
const scenarioArg = args.find(a => a.startsWith('--scenario='));
const dronesArg = args.find(a => a.startsWith('--drones='));

const scenario = scenarioArg ? scenarioArg.split('=')[1] : 'default';
const droneCount = dronesArg ? parseInt(dronesArg.split('=')[1]) : 50;

function randomHKPosition() {
  return {
    lat: (22.28 + Math.random() * 0.07).toFixed(5),
    lng: (114.15 + Math.random() * 0.07).toFixed(5),
    alt: Math.floor(Math.random() * 320) + 40,
  };
}

async function runDemo(): Promise<void> {
  console.log('🚀 Starting ORBITRON UTM Demo...');
  console.log(`   Scenario: ${scenario}`);
  console.log(`   Drones: ${droneCount}`);
  console.log('');

  console.log(`📍 Launching ${droneCount} drones over Hong Kong airspace...\n`);

  for (let i = 0; i < Math.min(droneCount, 10); i++) {
    const pos = randomHKPosition();
    const id = `DRN-${String(i + 1).padStart(3, '0')}`;
    console.log(`   🚁 ${id} → lat: ${pos.lat}, lng: ${pos.lng}, alt: ${pos.alt}m`);
  }

  if (droneCount > 10) {
    console.log(`   ... and ${droneCount - 10} more drones`);
  }

  console.log('\n✅ Demo running. Open your browsers:\n');
  console.log('  Operator:  http://localhost:3000');
  console.log('  Admin:     http://localhost:3001');
  console.log('  Simulator: http://localhost:3003');
  console.log('  API:       http://localhost:4000/api/v1/health');
  console.log('');
  console.log('Press Ctrl+C to stop the demo.\n');
}

runDemo().catch(console.error);
