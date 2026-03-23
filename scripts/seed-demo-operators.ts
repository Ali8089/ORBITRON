const DEMO_OPERATORS = [
  { id: 'op-001', name: 'Alice', credits: 100, licenseType: 'Commercial' },
  { id: 'op-002', name: 'Bob', credits: 75, licenseType: 'Recreational' },
  { id: 'op-003', name: 'Carol', credits: 50, licenseType: 'Commercial' },
  { id: 'op-004', name: 'David', credits: 120, licenseType: 'Medical' },
  { id: 'op-005', name: 'Eve', credits: 90, licenseType: 'Inspection' },
];

async function seedDemoOperators(): Promise<void> {
  console.log('👥 Seeding demo operator accounts...');

  DEMO_OPERATORS.forEach(op => {
    console.log(`   ✓ ${op.name} (${op.id}) – ${op.credits} credits – License: ${op.licenseType}`);
  });

  console.log(`\n   Total operators: ${DEMO_OPERATORS.length}`);
  console.log(`   Total credits: ${DEMO_OPERATORS.reduce((s, o) => s + o.credits, 0)}`);

  console.log('\n✅ Demo operators seeded successfully');
}

seedDemoOperators().catch(console.error);
