import type { StaticImageData } from "next/image";
import type { IconName } from "@/components/icons";
import { photos } from "./media";

export const company = {
  name: "Energy Blocks Construction Ltd",
  short: "Energy Blocks",
  rc: "RC 4240111",
  phone: "+234 (0) 803 411 3355",
  phoneHref: "tel:+2348034113355",
  whatsapp: "https://wa.me/2348034113355",
  email: "info@energyblocks.com",
  website: "www.energyblocks.com",
  facebook: "https://www.facebook.com/Energy-Blocks-Limited-724650027679489",
  headOffice: "KM 48, Lekki Epe Expressway, Lagos, Nigeria.",
  branchOffice:
    "Plot 150 Oginigba Road, Trans-Amadi Industrial Layout, Port Harcourt, Rivers State.",
};

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#services", label: "What we handle" },
  { href: "#how", label: "How we work" },
  { href: "#teams", label: "Specialist teams" },
  { href: "#security", label: "Security" },
  { href: "#payment", label: "Payment" },
  { href: "#faq", label: "FAQ" },
  { href: "/shop", label: "Shop" },
];

export const standards = [
  { code: "ASTM", label: "Fabrication standards" },
  { code: "API", label: "API 1104 welding" },
  { code: "ISO", label: "ISO 9712 Level II NDT" },
  { code: "IMO", label: "SOLAS · MARPOL · ISM" },
  { code: "IPPC", label: "ISPM-15 fumigation" },
];

export const worries: { q: string; a: string }[] = [
  { q: "Can we break ground before the project funds land?", a: "Yes. Today." },
  { q: "Who can get a certified crew on site by Monday?", a: "Deployed." },
  { q: "Will these welds pass the inspector?", a: "Inspected." },
  { q: "Are we about to run out of PPE and spares?", a: "Restocked." },
  { q: "Who is fuelling the vessel at 3 a.m.?", a: "Bunkered." },
  { q: "Will the PSVs pass their recertification?", a: "Certified." },
  { q: "Is that support vessel compliant for the charter?", a: "Chartered." },
  { q: "Are we paying for work that isn't finished?", a: "Milestoned." },
];

export const oldWays: { icon: IconName; tag: string; title: string; body: string }[] = [
  {
    icon: "users",
    tag: "Another vendor",
    title: "Split it across five contractors",
    body: "One for civil works, one for fabrication, one for supplies, one for crew, one for the vessel. Five invoices, five excuses — and nobody owns the interface.",
  },
  {
    icon: "wallet",
    tag: "Another deposit",
    title: "Pay up front and hope",
    body: "Large mobilisation fees before a single stake is in the ground. Your working capital sits in someone else's account while the schedule slips.",
  },
  {
    icon: "clock",
    tag: "Another delay",
    title: "Wait weeks to mobilise",
    body: "Equipment imported, crews sourced from scratch, materials stuck at the port. By the time the site is set up, the window has closed.",
  },
];

export const stats = [
  { value: "72h", label: "from contract signing to site setup, anywhere in Nigeria", note: "" },
  { value: "48h", label: "to deploy certified engineers, technicians and skilled trades", note: "" },
  { value: "₦0", label: "deposit to mobilise equipment, crews and materials", note: "Deposit-free." },
  { value: "24/7", label: "bunkering and port coverage across major Nigerian ports", note: "" },
];

export const services: {
  icon: IconName;
  title: string;
  sub: string;
  image: StaticImageData;
  highlight?: boolean;
}[] = [
  { icon: "hardhat", title: "Construction", sub: "Civil, structural & building works", image: photos.rebarPiling },
  { icon: "flame", title: "Welding & Fabrication", sub: "Pipe spools & structural steel", image: photos.fabrication },
  { icon: "boxes", title: "Supply Chain", sub: "Procurement, OCTGs & JIT delivery", image: photos.warehouseStores },
  { icon: "anchor", title: "Marine Support", sub: "Bunkering, hygiene & repairs", image: photos.offshoreDeck },
  { icon: "ship", title: "Vessel Hire & Leasing", sub: "Supply, standby & accommodation", image: photos.offshorePlatform },
  { icon: "clipboard", title: "Project Support", sub: "Field engineers & QA/QC sign-off", image: photos.engineersBlueprint },
  { icon: "users", title: "Manpower", sub: "Skilled, semi-skilled & professional", image: photos.manpower },
  { icon: "wrench", title: "Facility Maintenance", sub: "Valves, vessels, boilers & gauges", image: photos.facilityMaintenance },
  { icon: "scan", title: "NDT & Inspection", sub: "UT, MPI, RT, DPI & PMI", image: photos.wellheadCrew },
  { icon: "zap", title: "Turnkey EPC", sub: "Design to installation, one contract", image: photos.drillingRig, highlight: true },
];

export const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "file",
    title: "We scope it with you.",
    body: "Drawings, specs, site conditions and budget. We break the job into transparent, verifiable milestones — foundation, frame, roofing, finishing — before anything moves.",
  },
  {
    icon: "truck",
    title: "We mobilise. Deposit-free.",
    body: "Equipment, crews and materials move to your site from our Lagos, Port Harcourt, Warri and Abuja bases. Site set up within 72 hours of signing.",
  },
  {
    icon: "shield",
    title: "You pay as milestones are met.",
    body: "Payment releases only when each milestone is delivered to your satisfaction — aligned with your revenue inflows, not ours.",
  },
];

export const capabilities: { icon: IconName; title: string; body: string }[] = [
  { icon: "check", title: "QA/QC sign-off", body: "Weld inspectors and field engineers own quality from technical drawings to final hand-over." },
  { icon: "gauge", title: "Real-time inventory", body: "Live stock monitoring and Just-In-Time deliveries so a missing spare never stops the job." },
  { icon: "globe", title: "Global sourcing", body: "Competitive pricing on equipment, OCTGs, flowlines, chemicals and consumables via our network." },
  { icon: "activity", title: "Condition monitoring", body: "Vibration analysis, oil sampling and diagnostics keep generators and engines running." },
  { icon: "shield", title: "HSE inductions", body: "Every person on site is insured, inducted and compliant with Nigerian safety standards." },
  { icon: "layers", title: "Single-point accountability", body: "Design, procurement, fabrication and installation under one seamless contract." },
];

export const mobilisation = [
  { when: "Hour 0", title: "Contract signed.", body: "Milestones agreed, scope locked. No deposit invoice follows." },
  { when: "Hour 48", title: "Your crew is ready.", body: "Certified engineers, foremen and trades selected, inducted and insured for your site." },
  { when: "Hour 72", title: "Site set up.", body: "Equipment, materials and people on the ground — in Lagos, Port Harcourt, Warri, Abuja or anywhere in between." },
  { when: "Then", title: "Payment schedule formalised.", body: "Only once you're fully mobilised do we agree payment dates. No surprises, just swift execution." },
];

export const teams: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "anchor",
    title: "Marine support",
    body: "Bunkering with ISO-graded marine diesel and lubricants, generator maintenance with genuine OEM parts, and ISPM-15 cargo & vessel hygiene with port-clearance certificates.",
  },
  {
    icon: "ship",
    title: "Vessel hire & leasing",
    body: "Accommodation, supply, standby and seismic support vessels — daily, weekly or project-based, fully crewed, maintained and insured. SOLAS, MARPOL & ISM compliant.",
  },
  {
    icon: "scan",
    title: "Non-destructive testing",
    body: "Ultrasonic, magnetic particle, radiographic, dye penetrant and PMI, carried out by API 1104 and ISO 9712 Level II qualified personnel.",
  },
  {
    icon: "boxes",
    title: "Procurement & supply chain",
    body: "Materials, spare parts, OCTGs & accessories, flowlines, drilling & production chemicals, PPE and consumables — managed end to end.",
  },
  {
    icon: "users",
    title: "Manpower, local & expert",
    body: "Recruitment, placement and welfare management for engineers, technicians, HSE supervisors and admin across upstream, midstream and downstream.",
  },
  {
    icon: "wrench",
    title: "Facilities maintenance",
    body: "Structural upgrades, pipeline inspection and upkeep of RV, PSV, ESD & HIPPS valves, detectors, transmitters, boilers and pressure vessels.",
  },
];

export const locations = [
  { code: "LOS", city: "Lagos", body: "Head office on the Lekki–Epe Expressway. Construction, procurement and corporate projects across the South-West." },
  { code: "PHC", city: "Port Harcourt", body: "Trans-Amadi branch serving Rivers and the Niger Delta: fabrication, marine support and facility maintenance." },
  { code: "WRI", city: "Warri", body: "Close to the western Delta's terminals, flow stations and ports for fast marine and manpower turnaround." },
  { code: "ABV", city: "Abuja", body: "Federal Capital presence for construction, infrastructure and project support in the North." },
];

export const milestones = [
  { stage: "Mobilisation", detail: "Equipment, crew & materials on site", pay: "₦0 deposit" },
  { stage: "Foundation", detail: "Foundation completion", pay: "Milestone 1" },
  { stage: "Structural frame", detail: "Frame erected & inspected", pay: "Milestone 2" },
  { stage: "Roofing", detail: "Envelope closed", pay: "Milestone 3" },
  { stage: "Finishing", detail: "Hand-over on your sign-off", pay: "Milestone 4" },
];

export const included = [
  "Deposit-free mobilisation anywhere in Nigeria",
  "Transparent, verifiable milestones",
  "Payment only on client satisfaction",
  "Schedule aligned to your revenue inflows",
  "QA/QC documentation at every stage",
  "Fully insured, HSE-inducted personnel",
  "Genuine OEM parts & certified materials",
  "One contract, one point of accountability",
];

export const securitySystems: { icon: IconName; title: string; body: string }[] = [
  { icon: "fingerprint", title: "Access control & biometrics", body: "Card, PIN and fingerprint or face access so only authorised people reach sites, offices and plant rooms." },
  { icon: "clock", title: "Time & attendance", body: "Accurate clock-in records for every crew and shift, ready for payroll and manpower reporting." },
  { icon: "cctv", title: "CCTV surveillance", body: "Camera coverage for sites, yards, warehouses and facilities, with recording and remote viewing." },
  { icon: "door", title: "Entrance control & turnstiles", body: "Turnstiles, barriers and gates that manage how people and vehicles enter and leave." },
  { icon: "bell", title: "Intruder alarms", body: "Perimeter and building alarms that detect unauthorised entry and alert your team at once." },
  { icon: "flame", title: "Fire alarm systems", body: "Detection and alarm systems that give early warning and protect people, assets and operations." },
  { icon: "scan", title: "Metal detectors & screening", body: "Walk-through and hand-held detectors and screening devices for gates, terminals and receptions." },
  { icon: "eye", title: "Video analytics & intelligent monitoring", body: "Smart detection that flags unusual activity, so incidents are spotted as they happen." },
  { icon: "layers", title: "Integrated security management", body: "Access, video, alarms and attendance brought together into one system you can manage from one place." },
];

export const policies: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "leaf",
    title: "Environmental policy",
    body: "We recognise our responsibility to protect the environment. Management and staff factor pollution prevention and environmental hazards into every operational activity.",
  },
  {
    icon: "scale",
    title: "Beyond compliance",
    body: "We mandatorily comply with — and where possible go beyond — every environmental protection law that affects our operations.",
  },
  {
    icon: "ban",
    title: "Alcohol, drugs & smoking",
    body: "Possession of, or being under the influence of, intoxicating beverages or illegal drugs at the workplace or company offices is a termination offence.",
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "What does Energy Blocks Construction Ltd do?",
    a: "We are a Nigerian engineering and construction company (RC 4240111) providing construction, welding & fabrication, project support, marine support, vessel hire & leasing, procurement & supply chain management, manpower and facility maintenance — mainly for the energy sector, but also for telecoms, infrastructure and commercial clients.",
  },
  {
    q: "Do you really build now and let me pay later?",
    a: "Yes. We mobilise equipment, crews and materials to your site deposit-free. Payment schedules are formalised only once your project is fully mobilised, and each payment is tied to a milestone delivered to your satisfaction.",
  },
  {
    q: "How does milestone-based payment work?",
    a: "Before work starts we agree transparent, verifiable milestones — for example foundation completion, structural frame, roofing and finishing. Payment for each is released only when you are satisfied it has been met, so your cash flow tracks real progress.",
  },
  {
    q: "How fast can you get to site?",
    a: "Our offices across Lagos, Port Harcourt, Warri and Abuja allow a 72-hour turnaround from contract signing to site setup. Skilled personnel can be deployed to any location within 48 hours.",
  },
  {
    q: "What standards do you fabricate and inspect to?",
    a: "We fabricate to ASTM, API and client-specified standards. Our NDT and inspection personnel are API 1104 and ISO 9712 Level II qualified, and our vessels operate in full compliance with SOLAS, MARPOL and the ISM Code.",
  },
  {
    q: "What vessels are available for hire?",
    a: "Multi-purpose vessels for accommodation, supply, standby and seismic support, on short- or long-term charters. Lease packages can be daily, weekly or project-based, and include complete crewing, maintenance and insurance.",
  },
  {
    q: "What can you procure for us?",
    a: "Equipment, materials, spare parts, OCTGs & accessories, flowlines, oil drilling & production supplies including chemicals, PPE, and general spares & consumables — with end-to-end management, real-time inventory monitoring and Just-In-Time deliveries.",
  },
  {
    q: "Do you install security and access control systems?",
    a: "Yes. Under our safety practice we deliver access control and biometric systems, time and attendance, CCTV surveillance, entrance control and turnstiles, intruder and fire alarms, metal detectors and security screening, video analytics, and fully integrated security management solutions.",
  },
  {
    q: "Are your personnel insured and HSE compliant?",
    a: "Yes. All personnel are fully insured, compliant with Nigerian safety standards, and undergo rigorous HSE and project-specific inductions before deployment.",
  },
];
