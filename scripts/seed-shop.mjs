// Seeds the marketplace with sample products and creates the MongoDB indexes.
// Prices and stock are PLACEHOLDERS — review every product in /admin before going live.
// Usage:
//   npm run db:setup   create indexes only
//   npm run db:seed    create indexes + sample products (skips slugs that already exist)
// Reads MONGODB_URI / MONGODB_DB from the environment or .env.local.
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (add it to .env.local).");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.MONGODB_DB || "energyblocks");

await Promise.all([
  db.collection("products").createIndexes([{ key: { slug: 1 }, unique: true }, { key: { category: 1, active: 1 } }]),
  db.collection("product_images").createIndex({ productId: 1, position: 1 }),
  db.collection("orders").createIndexes([
    { key: { number: 1 }, unique: true },
    { key: { accessToken: 1 }, unique: true },
    { key: { email: 1 } },
    { key: { status: 1, createdAt: -1 } },
  ]),
  db.collection("payments").createIndexes([{ key: { reference: 1 }, unique: true }, { key: { orderId: 1 } }]),
  db.collection("admins").createIndex({ email: 1 }, { unique: true }),
]);
console.log(`Indexes ready on database "${db.databaseName}".`);
if (process.argv.includes("--indexes-only")) {
  await client.close();
  process.exit(0);
}

const ngn = (n) => n * 100;

const items = [
  ["fire-safety", "9kg Dry Powder Fire Extinguisher", "ABC dry chemical powder extinguisher for offices, sites, generators and vehicles. Supplied with wall bracket.", "Capacity: 9 kg\nAgent: ABC dry powder\nFire classes: A, B, C & electrical\nDischarge time: approx. 15 s\nStandard: BS EN3", 38000, 40, true],
  ["fire-safety", "5kg CO₂ Fire Extinguisher", "Carbon dioxide extinguisher for server rooms, control panels and electrical switchgear — leaves no residue.", "Capacity: 5 kg\nAgent: CO₂\nFire classes: B & electrical\nStandard: BS EN3", 52000, 25, false],
  ["fire-safety", "Photoelectric Smoke Detector", "Battery-powered optical smoke alarm with test button and 85 dB siren.", "Sensor: Photoelectric\nPower: 9 V battery\nAlarm: 85 dB\nCoverage: up to 40 m²", 9500, 120, false],
  ["fire-safety", "Fire Blanket 1.2 m × 1.8 m", "Woven glass-fibre blanket in quick-release wall pouch for kitchens and workshops.", "Size: 1.2 × 1.8 m\nMaterial: Woven glass fibre\nStandard: BS EN1869", 14500, 60, false],
  ["fire-safety", "4-Zone Conventional Fire Alarm Panel", "Control panel for small to medium buildings, with battery backup and zone indicators.", "Zones: 4\nBattery backup: 2 × 12 V 7 Ah\nOutputs: 2 sounder circuits", 185000, 8, false],
  ["cctv-security", "4MP Bullet IP Camera", "Outdoor IP67 bullet camera with 30 m night vision and PoE — ideal for perimeters and yards.", "Resolution: 4 MP\nNight vision: 30 m IR\nRating: IP67\nPower: PoE / 12 V DC", 68000, 35, true],
  ["cctv-security", "4MP Dome IP Camera", "Vandal-resistant dome for receptions, corridors and warehouses.", "Resolution: 4 MP\nNight vision: 30 m IR\nRating: IK10, IP67\nPower: PoE", 62000, 30, false],
  ["cctv-security", "8-Channel NVR with 2 TB Drive", "Network video recorder with 8 PoE ports, remote mobile viewing and 2 TB storage pre-installed.", "Channels: 8\nPoE ports: 8\nStorage: 2 TB HDD\nOutput: HDMI 4K / VGA", 245000, 12, true],
  ["cctv-security", "Biometric Time & Attendance Terminal", "Fingerprint, card and PIN terminal for clock-in records and door access.", "Users: 3,000 fingerprints\nRecords: 100,000\nComms: TCP/IP, USB\nAccess: relay output", 115000, 15, false],
  ["cctv-security", "Handheld Metal Detector", "Security-screening wand with adjustable sensitivity, audio and vibration alerts.", "Detection: ferrous & non-ferrous\nAlerts: audio, LED, vibration\nPower: 9 V battery", 28000, 20, false],
  ["ppe", "Safety Helmet (Hard Hat)", "HDPE hard hat with 6-point ratchet suspension. Available in white, yellow and blue.", "Material: HDPE\nSuspension: 6-point ratchet\nStandard: EN397", 6500, 300, false],
  ["ppe", "Steel-Toe Safety Boots", "Water-resistant leather boots with steel toecap and anti-slip, oil-resistant sole.", "Toecap: Steel, 200 J\nSole: PU/rubber, oil-resistant\nStandard: EN ISO 20345 S3", 32000, 80, true],
  ["ppe", "Hi-Vis Reflective Vest", "Class 2 high-visibility vest with zip front and ID pocket.", "Class: EN ISO 20471 Class 2\nColours: yellow, orange", 3500, 500, false],
  ["ppe", "Full-Body Safety Harness", "Fall-arrest harness with dorsal and chest D-rings and adjustable legs.", "Anchor points: dorsal & chest\nStandard: EN361", 45000, 40, false],
  ["tools", "Laser Distance Measure 50 m", "Pocket laser measure for area, volume and Pythagoras calculations.", "Range: 0.05–50 m\nAccuracy: ±2 mm", 24000, 45, false],
  ["tools", "Digital Multimeter (CAT III)", "True-RMS multimeter for electrical installation and maintenance work.", "Safety: CAT III 600 V\nTrue-RMS: yes\nFunctions: V, A, Ω, continuity, capacitance", 19500, 50, false],
  ["electrical", "Heavy-Duty Extension Reel 25 m", "Site-grade cable reel with thermal cut-out and four sockets.", "Length: 25 m\nCable: 1.5 mm² 3-core\nSockets: 4 × 13 A", 27500, 40, false],
  ["electrical", "100 W LED Floodlight", "IP65 floodlight for site lighting and security perimeters.", "Power: 100 W\nOutput: 10,000 lm\nRating: IP65", 21000, 70, false],
  ["materials", "Silicone Sealant (Box of 24)", "General-purpose neutral-cure silicone for glazing, sanitary and construction joints.", "Volume: 280 ml × 24\nCure: neutral\nColour: clear", 54000, 25, false],
];

const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

let added = 0;
for (const [i, [category, name, description, specs, price, stock, featured]] of items.entries()) {
  const now = Date.now();
  const res = await db.collection("products").updateOne(
    { slug: slugify(name) },
    {
      $setOnInsert: {
        _id: randomUUID(),
        slug: slugify(name),
        name,
        description,
        category,
        brand: "",
        sku: `SAMPLE-${i + 1}`,
        specs,
        priceKobo: ngn(price),
        compareAtKobo: null,
        stock,
        active: true,
        featured,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
  added += res.upsertedCount;
}
console.log(`Seeded ${added} sample products (placeholder prices — review in /admin).`);
await client.close();
