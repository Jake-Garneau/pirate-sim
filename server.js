const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "public")));

// ======================== WORLD CONFIG ========================
const TICK_RATE = 20;
const TICK_MS = 1000 / TICK_RATE;
const WW = 3200,
  WH = 2400;
const BOARD_RANGE = 45,
  BOARD_TIME = 3.0;
const INTERCEPT_RANGE = 50;
const DOCK_RANGE = 80,
  SLOW_RANGE = 90;
const BULLET_SPEED = 7;
const BULLET_LIFETIME = 1.8;
const STUN_DURATION = 5;
const MAX_PLAYERS = 30;

// ======================== LAND ========================
const LAND_YEMEN = [
  [0, 0],
  [WW, 0],
  [WW, 360],
  [2800, 330],
  [2200, 360],
  [1600, 340],
  [1000, 320],
  [600, 360],
  [0, 390],
];
const LAND_SOMALIA = [
  [0, 430],
  [0, WH],
  [450, WH],
  [480, 2000],
  [450, 1600],
  [430, 1200],
  [440, 900],
  [480, 720],
  [580, 590],
  [680, 560],
  [620, 510],
  [520, 480],
  [350, 460],
  [180, 445],
];
const ISLAND_POLYS = [
  [
    [1170, 790],
    [1215, 778],
    [1250, 795],
    [1245, 835],
    [1205, 848],
    [1168, 830],
  ],
  [
    [860, 1050],
    [905, 1038],
    [938, 1058],
    [932, 1092],
    [895, 1105],
    [858, 1082],
  ],
  [
    [1770, 630],
    [1820, 618],
    [1855, 638],
    [1845, 672],
    [1805, 682],
    [1768, 660],
  ],
];
const ALL_LAND = [LAND_YEMEN, LAND_SOMALIA, ...ISLAND_POLYS];

// ======================== PORTS ========================
const PORTS = {
  djibouti: { x: 350, y: 415, name: "Djibouti", f: "navy" },
  mukalla: { x: 1100, y: 355, name: "Mukalla", f: "navy" },
  aden: { x: 1600, y: 420, name: "Aden", f: "neutral" },
  salalah: { x: 2500, y: 385, name: "Salalah", f: "neutral" },
  berbera: { x: 520, y: 490, name: "Berbera", f: "neutral" },
  bosaso: { x: 650, y: 550, name: "Bosaso", f: "pirate" },
  eyl: { x: 560, y: 700, name: "Eyl", f: "pirate" },
  hobyo: { x: 500, y: 970, name: "Hobyo", f: "pirate" },
  kismayo: { x: 460, y: 1700, name: "Kismayo", f: "pirate" },
  mogadishu: { x: 470, y: 1250, name: "Mogadishu", f: "neutral" },
  mombasa: { x: 2200, y: 1750, name: "Mombasa", f: "neutral" },
  saadin: { x: 1205, y: 815, name: "Saad ad-Din Isle", f: "island" },
  ilig: { x: 895, y: 1075, name: "Ilig Isle", f: "island" },
  socotra: { x: 1805, y: 655, name: "Socotra Isle", f: "island" },
};

const BLACK_MARKETS = {
  bosaso: {
    rate: 0.82,
    label: "Bosaso Market",
    desc: "Standard rates. Close to the action.",
  },
  eyl: {
    rate: 1.0,
    label: "Eyl Market",
    desc: "Fair prices. Reliable buyers.",
  },
  hobyo: {
    rate: 1.35,
    label: "Hobyo Premium",
    desc: "Best prices. Less navy presence.",
  },
};

const LANES = [
  {
    wp: [
      [1600, 420],
      [1200, 520],
      [1000, 700],
      [1100, 950],
      [1400, 1300],
      [1800, 1550],
      [2200, 1750],
    ],
    risk: "high",
  },
  {
    wp: [
      [2700, 370],
      [2200, 370],
      [1600, 380],
    ],
    risk: "low",
  },
  {
    wp: [
      [380, 435],
      [750, 575],
      [950, 775],
      [1200, 1000],
      [1500, 1250],
      [1900, 1550],
    ],
    risk: "medium",
  },
];

const CARGO_TYPES = [
  { name: "Crude Oil", base: 3500 },
  { name: "Electronics", base: 9000 },
  { name: "Food Grains", base: 1800 },
  { name: "Vehicles", base: 6500 },
  { name: "Textiles", base: 2200 },
  { name: "Heavy Machinery", base: 5500 },
];
const CONTRACT_DEFS = [
  { from: "aden", to: "mombasa", cargo: "Electronics", reward: 6500 },
  { from: "aden", to: "djibouti", cargo: "Food Grains", reward: 2200 },
  { from: "aden", to: "mogadishu", cargo: "Vehicles", reward: 5800 },
  { from: "aden", to: "salalah", cargo: "Textiles", reward: 2800 },
  { from: "aden", to: "berbera", cargo: "Heavy Machinery", reward: 3200 },
  { from: "djibouti", to: "mombasa", cargo: "Crude Oil", reward: 5500 },
  { from: "djibouti", to: "aden", cargo: "Textiles", reward: 1800 },
  { from: "djibouti", to: "mogadishu", cargo: "Heavy Machinery", reward: 5000 },
  { from: "djibouti", to: "salalah", cargo: "Electronics", reward: 4200 },
  { from: "djibouti", to: "berbera", cargo: "Food Grains", reward: 1500 },
  { from: "mombasa", to: "aden", cargo: "Electronics", reward: 6000 },
  { from: "mombasa", to: "djibouti", cargo: "Food Grains", reward: 2800 },
  { from: "mombasa", to: "mogadishu", cargo: "Textiles", reward: 3200 },
  { from: "mombasa", to: "salalah", cargo: "Vehicles", reward: 7500 },
  { from: "mombasa", to: "berbera", cargo: "Crude Oil", reward: 4000 },
  { from: "mogadishu", to: "aden", cargo: "Crude Oil", reward: 4800 },
  { from: "mogadishu", to: "mombasa", cargo: "Vehicles", reward: 5200 },
  { from: "mogadishu", to: "salalah", cargo: "Heavy Machinery", reward: 6800 },
  { from: "mogadishu", to: "djibouti", cargo: "Textiles", reward: 3800 },
  { from: "salalah", to: "aden", cargo: "Crude Oil", reward: 3000 },
  { from: "salalah", to: "mombasa", cargo: "Electronics", reward: 7200 },
  { from: "salalah", to: "mogadishu", cargo: "Vehicles", reward: 5500 },
  { from: "salalah", to: "djibouti", cargo: "Heavy Machinery", reward: 4500 },
  { from: "berbera", to: "aden", cargo: "Food Grains", reward: 1800 },
  { from: "berbera", to: "mombasa", cargo: "Textiles", reward: 4200 },
  { from: "berbera", to: "mogadishu", cargo: "Crude Oil", reward: 3500 },
  { from: "berbera", to: "salalah", cargo: "Electronics", reward: 5000 },
];

const SHIP_DEFS = {
  patrol: { spd: 3.0, hp: 120, sz: 13, f: "navy", dmg: 20, cd: 0.4 },
  coastal: { spd: 2.0, hp: 90, sz: 16, f: "ship", dmg: 0, cd: 0.6 },
  skiff: { spd: 4.2, hp: 45, sz: 9, f: "pirate", dmg: 15, cd: 0.5 },
  ai_merchant: {
    spd: 1.7,
    hp: 100,
    sz: 17,
    f: "ship",
    dmg: 0,
    cd: 0,
    cargo: 5000,
  },
  ai_pirate: {
    spd: 3.8,
    hp: 40,
    sz: 8,
    f: "pirate",
    dmg: 6,
    cd: 1.4,
    brd: 0.8,
  },
  ai_navy: { spd: 3.0, hp: 150, sz: 14, f: "navy", dmg: 18, cd: 0.5 },
  fishing: { spd: 1.0, hp: 20, sz: 6, f: "neutral", dmg: 0, cd: 0 },
};

// ======================== WEAPON TYPES ========================
const WEAPON_TYPES = {
  cannon: { name: "Cannon", dmg: 15, spd: 7, cd: 0.5 },
  rapidfire: { name: "Rapid Fire", dmg: 8, spd: 10, cd: 0.25 },
  heavy: { name: "Heavy Cannon", dmg: 22, spd: 6, cd: 0.9 },
  railgun: { name: "Railgun", dmg: 28, spd: 16, cd: 1.5 },
  rocket: { name: "Rockets", dmg: 35, spd: 4, cd: 2.0 },
  deckgun: { name: "Deck Gun", dmg: 10, spd: 7, cd: 0.7 },
  autocannon: { name: "Auto Cannon", dmg: 6, spd: 10, cd: 0.3 },
  turret: { name: "Heavy Turret", dmg: 18, spd: 6, cd: 1.0 },
};

const UPGRADE_CAPS = { maxSpd: 6.0, maxHp: 300, maxLoot: 1500, maxDmg: 35 };

const NAMES_MERCHANT = [
  "MV Horizon",
  "SS Pacific Star",
  "MV Ocean Trader",
  "SS Blue Fortune",
  "MV Coral Sea",
  "SS Golden Wave",
  "MV Northern Light",
  "SS Steel Valley",
];
const NAMES_PIRATE = [
  "Red Tide Gang",
  "Shark Teeth Crew",
  "Night Raiders",
  "Storm Brothers",
  "Iron Hook Gang",
  "Black Flag Crew",
];
const NAMES_NAVY = [
  "EUNS Sentinel",
  "EUNS Guardian",
  "EUNS Valiant",
  "EUNS Protector",
  "EUNS Vigilant",
];
const NAMES_CAPTAIN = [
  "Ahmed",
  "Mohamed",
  "Hassan",
  "Ali",
  "Omar",
  "Yusuf",
  "Ibrahim",
  "Abdi",
  "Farah",
  "Hussein",
];

// ======================== UTILITIES ========================
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
function ang(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function clamp(v, mn, mx) {
  return Math.max(mn, Math.min(mx, v));
}
function rand(a, b) {
  return a + Math.random() * (b - a);
}
function randInt(a, b) {
  return Math.floor(rand(a, b + 1));
}
function lerpAng(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function pip(x, y, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0],
      yi = poly[i][1],
      xj = poly[j][0],
      yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      ins = !ins;
  }
  return ins;
}
function onLand(x, y) {
  return ALL_LAND.some((poly) => pip(x, y, poly));
}
function findWater(nx, ny, maxR) {
  if (!onLand(nx, ny)) return { x: nx, y: ny };
  for (let r = 10; r < maxR; r += 10) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const tx = nx + Math.cos(a) * r,
        ty = ny + Math.sin(a) * r;
      if (tx > 20 && tx < WW - 20 && ty > 20 && ty < WH - 20 && !onLand(tx, ty))
        return { x: tx, y: ty };
    }
  }
  return { x: 800, y: 800 };
}

// ======================== SAFE ZONES ========================
function isInSafePort(ship) {
  for (const port of Object.values(PORTS)) {
    if (dist(ship, port) > DOCK_RANGE) continue;
    if (port.f === "island") return true;
    if (ship.faction === "pirate" && port.f === "pirate") return true;
    if (ship.faction === "ship" && (port.f === "neutral" || port.f === "navy"))
      return true;
    if (ship.faction === "navy" && (port.f === "navy" || port.f === "neutral"))
      return true;
  }
  return false;
}

// ======================== MARKET THREAT ========================
const MarketThreat = {
  bosaso: { heat: 0, naval: 0, dumped: 0, state: "OPEN" },
  eyl: { heat: 0, naval: 0, dumped: 0, state: "OPEN" },
  hobyo: { heat: 0, naval: 0, dumped: 0, state: "OPEN" },
};

function getMarketPrice(mk, base) {
  const m = MarketThreat[mk];
  if (!m) return { price: base, state: "OPEN", mult: "1.00", risk: 0 };
  const risk = Math.min(1, m.naval * 0.85 + m.heat * 0.15);
  const supply = Math.max(0.5, 1 - (m.dumped / 2000) * 0.4);
  let price = base * Math.max(0, 1 - risk * 1.3) * supply;
  let state = "OPEN",
    mult;
  if (risk > 0.75) {
    state = "LOCKDOWN";
    price = 0;
    mult = "0.00";
  } else if (risk > 0.5) {
    state = "HIGH_RISK";
    price *= 0.65;
    mult = (price / base).toFixed(2);
  } else {
    mult = (price / base).toFixed(2);
  }
  return { price: Math.floor(price), state, mult, risk };
}

function updateMarkets(dt) {
  const allShips = [
    ...npcs,
    ...Array.from(players.values())
      .filter((p) => p.ship)
      .map((p) => p.ship),
  ];
  for (const [k, m] of Object.entries(MarketThreat)) {
    const port = PORTS[k];
    if (!port) continue;
    let pirates = 0;
    for (const s of allShips)
      if (s.faction === "pirate" && s.alive && dist(s, port) < 400) pirates++;
    m.heat = clamp(
      m.heat + (Math.min(pirates / 3, 1) * 0.025 - 0.008) * dt,
      0,
      1,
    );
    const target =
      m.heat > 0.35
        ? Math.min(m.heat * 1.1, 0.9)
        : Math.max(0, m.naval - 0.012 * dt);
    m.naval = lerp(m.naval, target, 0.04 * dt);
    m.dumped = Math.max(0, m.dumped - 0.5 * dt);
    const risk = Math.min(1, m.naval * 0.85 + m.heat * 0.15);
    m.state = risk > 0.75 ? "LOCKDOWN" : risk > 0.5 ? "HIGH_RISK" : "OPEN";
  }
}

// ======================== GAME STATE ========================
let nextId = 1;
const players = new Map();
const npcs = [];
const projectiles = [];
let gameTime = 0;
const spawnTimers = { merchant: 6, pirate: 6, navy: 6, fishing: 8 };
const messages = []; // global messages [{text,type,time,targetId?}]

// ======================== SHIP ========================
class Ship {
  constructor(x, y, typeKey, ownerId = null) {
    const d = SHIP_DEFS[typeKey];
    this.id = nextId++;
    this.x = x;
    this.y = y;
    this.typeKey = typeKey;
    this.vx = 0;
    this.vy = 0;
    this.angle = rand(0, Math.PI * 2);
    this.tAngle = this.angle;
    this.baseSpd = d.spd;
    this.maxSpd = d.spd;
    this.hp = d.hp;
    this.maxHp = d.hp;
    this.sz = d.sz;
    this.faction = d.f;
    this.alive = true;
    this.ownerId = ownerId;
    this.state = "idle";
    this.waypoints = [];
    this.wpIdx = 0;
    this.boardProgress = 0;
    this.slowed = false;
    this.cargoValue = d.cargo || 0;
    this._target = null;
    this._targetId = null;
    this._fleeBase = null;
    this._escortTarget = null;
    this.shootCooldown = 0;
    this.weaponDamage = d.dmg;
    this.weaponCooldownTime = d.cd;
    this.bulletSpeed = BULLET_SPEED;
    this.weaponType = d.dmg > 0 ? "cannon" : "none";
    this.stunTimer = 0;
    this.npc = null;
    this.shipTier = 0;
    if (!ownerId && typeKey !== "fishing") this.assignNPC(typeKey);
  }
  assignNPC(tk) {
    if (tk === "ai_merchant")
      this.npc = {
        type: "merchant",
        name: pick(NAMES_MERCHANT),
        captain: "Capt. " + pick(NAMES_CAPTAIN),
        cargo: pick(CARGO_TYPES),
        status: "Underway",
      };
    else if (tk === "ai_pirate")
      this.npc = {
        type: "pirate",
        name: pick(NAMES_PIRATE),
        leader: pick(NAMES_CAPTAIN),
        status: "Hunting",
      };
    else if (tk === "ai_navy")
      this.npc = {
        type: "navy",
        name: pick(NAMES_NAVY),
        commander: "Cmdr. " + pick(NAMES_CAPTAIN),
        status: "Patrol",
      };
  }
  resolveLandCollision() {
    let nearPort = false;
    for (const p of Object.values(PORTS))
      if (dist(this, p) < DOCK_RANGE + 25) {
        nearPort = true;
        break;
      }
    if (nearPort || !onLand(this.x, this.y)) return;
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 0.1;
    const dx = this.vx / spd,
      dy = this.vy / spd;
    let escaped = false;
    for (let i = 1; i <= 40 && !escaped; i++) {
      const tx = this.x - dx * i * 4,
        ty = this.y - dy * i * 4;
      if (
        tx > 20 &&
        tx < WW - 20 &&
        ty > 20 &&
        ty < WH - 20 &&
        !onLand(tx, ty)
      ) {
        this.x = tx;
        this.y = ty;
        escaped = true;
      }
    }
    if (!escaped) {
      const px = -dy,
        py = dx;
      for (let i = 1; i <= 25 && !escaped; i++) {
        if (!onLand(this.x + px * i * 4, this.y + py * i * 4)) {
          this.x += px * i * 4;
          this.y += py * i * 4;
          escaped = true;
          break;
        }
        if (!onLand(this.x - px * i * 4, this.y - py * i * 4)) {
          this.x -= px * i * 4;
          this.y -= py * i * 4;
          escaped = true;
          break;
        }
      }
    }
    if (!escaped) {
      const wp = findWater(this.x, this.y, 300);
      this.x = wp.x;
      this.y = wp.y;
    }
    this.vx *= -0.2;
    this.vy *= -0.2;
  }
  findBase() {
    let best = null,
      bd = Infinity;
    for (const p of Object.values(PORTS)) {
      if (p.f === this.faction || p.f === "neutral") {
        const d = dist(this, p);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
    }
    return best || { x: WW / 2, y: WH / 2 };
  }
  damage(amt, attackerId) {
    this.hp = Math.max(0, this.hp - amt);
    if (
      this.faction === "ship" &&
      this.hp > 0 &&
      this.hp / this.maxHp <= 0.2 &&
      this.stunTimer <= 0
    ) {
      this.stunTimer = STUN_DURATION;
      sendMsg(null, "Ship stunned! Hull critical!", "alert");
    }
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }
}

// ======================== PROJECTILE ========================
class Projectile {
  constructor(x, y, angle, ownerId, faction, damage, bulletSpeed, weaponType) {
    this.id = nextId++;
    this.x = x;
    this.y = y;
    const spd = bulletSpeed || BULLET_SPEED;
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;
    this.ownerId = ownerId;
    this.faction = faction;
    this.damage = damage;
    this.life = BULLET_LIFETIME;
    this.alive = true;
    this.weaponType = weaponType || "cannon";
  }
  update(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.life -= dt;
    if (
      this.life <= 0 ||
      this.x < 0 ||
      this.x > WW ||
      this.y < 0 ||
      this.y > WH ||
      onLand(this.x, this.y)
    )
      this.alive = false;
  }
}

// ======================== MESSAGES ========================
function sendMsg(targetId, text, type = "info") {
  messages.push({ text, type, time: gameTime, targetId });
  if (messages.length > 50) messages.shift();
}

// ======================== PORT HELPERS ========================
const PIRATE_PORTS = Object.values(PORTS).filter((p) => p.f === "pirate");
const NAVY_PORTS = Object.values(PORTS).filter((p) => p.f === "navy");
const NEUTRAL_PORTS = Object.values(PORTS).filter((p) => p.f === "neutral");

// ======================== NPC SPAWNING ========================
function spawnInitialNPCs() {
  LANES.forEach((lane) => {
    const s = lane.wp[0];
    const safe = findWater(s[0] + rand(-30, 30), s[1] + rand(-30, 30), 120);
    const ship = new Ship(safe.x, safe.y, "ai_merchant");
    ship.waypoints = lane.wp.map((p) => ({ x: p[0], y: p[1] }));
    ship.state = "moving";
    npcs.push(ship);
  });
  for (const p of PIRATE_PORTS) {
    for (let i = 0; i < 2; i++) {
      const safe = findWater(p.x + rand(-120, 120), p.y + rand(-120, 120), 150);
      const ship = new Ship(safe.x, safe.y, "ai_pirate");
      ship.state = "idle";
      npcs.push(ship);
    }
  }
  for (const p of NAVY_PORTS) {
    for (let i = 0; i < 3; i++) {
      const safe = findWater(p.x + rand(-100, 100), p.y + rand(20, 120), 150);
      const ship = new Ship(safe.x, safe.y, "ai_navy");
      ship.state = "patrol";
      npcs.push(ship);
    }
  }
  for (let i = 0; i < 4; i++) {
    const lane = pick(LANES);
    const wp0 = lane.wp[0];
    const safe = findWater(wp0[0] + rand(-50, 50), wp0[1] + rand(-50, 50), 120);
    const ship = new Ship(safe.x, safe.y, "ai_merchant");
    ship.waypoints = lane.wp.map((p) => ({ x: p[0], y: p[1] }));
    ship.state = "moving";
    npcs.push(ship);
  }
  for (let i = 0; i < 5; i++) {
    const safe = findWater(rand(300, 2800), rand(500, 2100), 200);
    const ship = new Ship(safe.x, safe.y, "fishing");
    ship.state = "idle";
    npcs.push(ship);
  }
}

function spawnNPC(type) {
  let port;
  if (type === "ai_pirate") port = pick(PIRATE_PORTS);
  else if (type === "ai_navy") port = pick(NAVY_PORTS);
  else if (type === "ai_merchant") port = pick(NEUTRAL_PORTS);
  const x = port ? port.x + rand(-150, 150) : rand(300, WW - 300);
  const y = port ? port.y + rand(-150, 150) : rand(500, WH - 300);
  const safe = findWater(x, y, 200);
  const ship = new Ship(safe.x, safe.y, type);
  if (type === "ai_merchant") {
    const lane = pick(LANES);
    ship.waypoints = lane.wp.map((p) => ({ x: p[0], y: p[1] }));
    ship.state = "moving";
  } else if (type === "ai_navy") {
    ship.state = "patrol";
  }
  npcs.push(ship);
}

// ======================== AI ========================
function getAllShips() {
  const all = [...npcs];
  for (const p of players.values())
    if (p.ship && p.ship.alive) all.push(p.ship);
  return all;
}

let aiDecisionTimer = 0;
function updateAIDecisions(dt) {
  aiDecisionTimer += dt;
  if (aiDecisionTimer < 1.5) return;
  aiDecisionTimer = 0;
  const allShips = getAllShips();
  for (const s of npcs) {
    if (!s.alive || s.typeKey === "fishing") continue;
    if (s.typeKey === "ai_pirate" && s.state === "idle") {
      let best = null,
        bd = Infinity;
      for (const t of allShips) {
        if (
          t.faction === "ship" &&
          t.alive &&
          t.state !== "looted" &&
          !isInSafePort(t)
        ) {
          const d = dist(s, t);
          if (d < bd) {
            bd = d;
            best = t;
          }
        }
      }
      if (best) {
        s._target = best;
        s._targetId = best.id;
        s.state = "hunting";
        if (s.npc) s.npc.status = "Targeting " + (best.npc?.name || "vessel");
      }
    } else if (s.typeKey === "ai_navy") {
      if (s.state === "idle" || s.state === "patrol") {
        let bestPirate = null,
          bpd = Infinity;
        for (const t of allShips) {
          if (t.faction === "pirate" && t.alive && !isInSafePort(t)) {
            const d = dist(s, t);
            if (d < 500 && d < bpd) {
              bpd = d;
              bestPirate = t;
            }
          }
        }
        if (!bestPirate) {
          for (const t of allShips) {
            if (
              t.faction === "pirate" &&
              t.alive &&
              !isInSafePort(t) &&
              (t.state === "hunting" || t.state === "boarding") &&
              t._target &&
              t._target.faction === "ship"
            ) {
              const d = dist(s, t);
              if (d < 1200 && d < bpd) {
                bpd = d;
                bestPirate = t;
              }
            }
          }
        }
        if (bestPirate) {
          s._target = bestPirate;
          s._targetId = bestPirate.id;
          s.state = "hunting";
          s._escortTarget = null;
          if (s.npc) s.npc.status = "Engaging pirate";
        } else if (s.state === "idle") {
          let bestMerchant = null,
            bmd = Infinity;
          for (const t of allShips) {
            if (t.faction === "ship" && t.alive && t.state === "moving") {
              const d = dist(s, t);
              if (d < bmd) {
                bmd = d;
                bestMerchant = t;
              }
            }
          }
          if (bestMerchant) {
            s._escortTarget = bestMerchant;
            s.state = "escort";
            if (s.npc)
              s.npc.status =
                "Escorting " + (bestMerchant.npc?.name || "merchant");
          } else {
            s.state = "patrol";
            s.waypoints = [];
          }
        }
      }
    }
  }
}

function updateNPCShip(s, dt) {
  if (!s.alive) return;
  if (s.stunTimer > 0) {
    s.stunTimer -= dt;
    s.vx *= 0.9;
    s.vy *= 0.9;
    s.x += s.vx;
    s.y += s.vy;
    s.resolveLandCollision();
    return;
  }
  if (s.shootCooldown > 0) s.shootCooldown -= dt;
  switch (s.state) {
    case "moving":
      npcFollowWP(s, dt);
      break;
    case "hunting":
      npcHunt(s, dt);
      break;
    case "fleeing":
      npcFlee(s, dt);
      break;
    case "boarding":
      npcBoard(s, dt);
      break;
    case "patrol":
      npcPatrol(s, dt);
      break;
    case "escort":
      npcEscort(s, dt);
      break;
  }
  // AI shooting: pirates and navy shoot at nearby hostile targets
  if (s.weaponDamage > 0 && s.shootCooldown <= 0) {
    const allShips = getAllShips();
    for (const t of allShips) {
      if (t === s || !t.alive) continue;
      if (isInSafePort(t)) continue;
      const hostile =
        (s.faction === "pirate" &&
          (t.faction === "navy" || t.faction === "ship")) ||
        (s.faction === "navy" && t.faction === "pirate");
      if (!hostile) continue;
      // Pirates board stunned merchants instead of shooting them
      if (s.faction === "pirate" && t.faction === "ship" && t.stunTimer > 0) {
        if (dist(s, t) < 250 && s.state !== "boarding") {
          s._target = t;
          s._targetId = t.id;
          s.state = "hunting";
          if (s.npc) s.npc.status = "Moving to board stunned vessel";
        }
        continue;
      }
      if (dist(s, t) < 250) {
        const a = ang(s, t);
        projectiles.push(
          new Projectile(
            s.x + Math.cos(a) * s.sz,
            s.y + Math.sin(a) * s.sz,
            a,
            s.id,
            s.faction,
            s.weaponDamage,
            s.bulletSpeed,
            s.weaponType,
          ),
        );
        s.shootCooldown = s.weaponCooldownTime + rand(0.3, 1.0);
        break;
      }
    }
  }
  s.vx *= 0.96;
  s.vy *= 0.96;
  let spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
  if (spd > s.maxSpd) {
    s.vx = (s.vx / spd) * s.maxSpd;
    s.vy = (s.vy / spd) * s.maxSpd;
  }
  if (spd > 0.15) s.angle = lerpAng(s.angle, Math.atan2(s.vy, s.vx), 0.08);
  s.x += s.vx;
  s.y += s.vy;
  s.x = clamp(s.x, 15, WW - 15);
  s.y = clamp(s.y, 15, WH - 15);
  s.resolveLandCollision();
}

function npcFollowWP(s, dt) {
  if (!s.waypoints.length || s.wpIdx >= s.waypoints.length) {
    s.alive = false;
    return;
  }
  const wp = s.waypoints[s.wpIdx];
  if (dist(s, wp) < 35) {
    s.wpIdx++;
    return;
  }
  const a = ang(s, wp);

  // Check ahead for land and steer around it
  const lookAhead = 40;
  const nx = s.x + Math.cos(a) * lookAhead;
  const ny = s.y + Math.sin(a) * lookAhead;

  if (onLand(nx, ny)) {
    // Try steering left or right
    const leftA = a - Math.PI / 3;
    const rightA = a + Math.PI / 3;
    const lx = s.x + Math.cos(leftA) * lookAhead;
    const ly = s.y + Math.sin(leftA) * lookAhead;
    const steerA = !onLand(lx, ly) ? leftA : rightA;
    s.vx += Math.cos(steerA) * s.maxSpd * 0.07;
    s.vy += Math.sin(steerA) * s.maxSpd * 0.07;
  } else {
    s.vx += Math.cos(a) * s.maxSpd * 0.05;
    s.vy += Math.sin(a) * s.maxSpd * 0.05;
  }
}

function npcHunt(s, dt) {
  if (!s._target || !s._target.alive || s._target.state === "looted") {
    s.state = "idle";
    s._target = null;
    s._targetId = null;
    if (s.npc) s.npc.status = "Searching";
    return;
  }
  if (isInSafePort(s._target)) {
    s.state = "idle";
    s._target = null;
    s._targetId = null;
    if (s.npc) s.npc.status = "Target in safe zone";
    return;
  }
  const d = dist(s, s._target);
  if (s.faction === "navy" && d > 800) {
    s.state = "idle";
    s._target = null;
    s._targetId = null;
    if (s.npc) s.npc.status = "Lost target";
    return;
  }
  if (s.faction === "pirate") {
    const allShips = getAllShips();
    for (const n of allShips) {
      if (n.faction === "navy" && n.alive && dist(s, n) < 200) {
        s.state = "fleeing";
        s._fleeBase = s.findBase();
        if (s.npc) s.npc.status = "Fleeing!";
        return;
      }
    }
  }
  if (d < BOARD_RANGE) {
    s.state = "boarding";
    s.boardProgress = 0;
    if (s.npc) s.npc.status = "Boarding!";
    return;
  }
  const a = ang(s, s._target);
  const lookAhead = 35;
  const nx = s.x + Math.cos(a) * lookAhead;
  const ny = s.y + Math.sin(a) * lookAhead;
  if (onLand(nx, ny)) {
    const steerA = !onLand(
      s.x + Math.cos(a - Math.PI / 3) * lookAhead,
      s.y + Math.sin(a - Math.PI / 3) * lookAhead,
    )
      ? a - Math.PI / 3
      : a + Math.PI / 3;
    s.vx += Math.cos(steerA) * s.maxSpd * 0.055;
    s.vy += Math.sin(steerA) * s.maxSpd * 0.055;
  } else {
    s.vx += Math.cos(a) * s.maxSpd * 0.045;
    s.vy += Math.sin(a) * s.maxSpd * 0.045;
  }
  if (s.npc) s.npc.status = d < 150 ? "Engaging" : "Pursuing";
}

function npcFlee(s, dt) {
  if (!s._fleeBase) {
    s._fleeBase = s.findBase();
    return;
  }
  if (dist(s, s._fleeBase) < 50) {
    s.state = "idle";
    s._fleeBase = null;
    if (s.npc) s.npc.status = "Laying low";
    return;
  }
  const a = ang(s, s._fleeBase);
  s.vx += Math.cos(a) * s.maxSpd * 0.06;
  s.vy += Math.sin(a) * s.maxSpd * 0.06;
}

function npcBoard(s, dt) {
  if (!s._target || !s._target.alive) {
    s.state = "idle";
    s._target = null;
    s._targetId = null;
    return;
  }
  if (isInSafePort(s._target)) {
    s.state = "idle";
    s._target = null;
    s._targetId = null;
    s.boardProgress = 0;
    if (s.npc) s.npc.status = "Target in safe zone";
    return;
  }
  if (dist(s, s._target) > BOARD_RANGE * 2.5) {
    s.state = "hunting";
    s.boardProgress = 0;
    if (s.npc) s.npc.status = "Target escaped";
    return;
  }
  s.boardProgress += dt / BOARD_TIME;
  if (s.boardProgress >= 1.0) {
    if (s.faction === "pirate" && s._target.faction === "ship") {
      const targetOwner = s._target.ownerId;
      if (targetOwner) {
        const pl = players.get(targetOwner);
        if (pl) {
          sendMsg(targetOwner, "Your ship was boarded! You lost cargo!", "alert");
          s._target.damage(s._target.maxHp * 0.3, s.id);
          if (pl.contract) pl.contract = null;
        }
      } else {
        s._target.state = "looted";
        s._target.cargoValue = 0;
        s._target.alive = false;
        sendMsg(
          null,
          (s._target.npc?.name || "Merchant") +
            " looted by " +
            (s.npc?.name || "pirates"),
          "alert",
        );
      }
    } else if (s.faction === "navy" && s._target.faction === "pirate") {
      s._target.alive = false;
      sendMsg(
        null,
        (s._target.npc?.name || "Pirate") +
          " intercepted by " +
          (s.npc?.name || "navy"),
        "info",
      );
    }
    s.state = "idle";
    s._target = null;
    s._targetId = null;
    s.boardProgress = 0;
  }
}

function npcPatrol(s, dt) {
  if (!s.waypoints.length) {
    const cx = rand(800, 2400),
      cy = rand(600, 1800),
      r = rand(200, 400);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      s.waypoints.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    s.wpIdx = 0;
  }
  npcFollowWP(s, dt);
}

function npcEscort(s, dt) {
  const t = s._escortTarget;
  if (!t || !t.alive) {
    s.state = "idle";
    s._escortTarget = null;
    if (s.npc) s.npc.status = "Patrol";
    return;
  }
  const allShips = getAllShips();
  for (const p of allShips) {
    if (
      p.faction === "pirate" &&
      p.alive &&
      !isInSafePort(p) &&
      dist(s, p) < 500
    ) {
      s._target = p;
      s._targetId = p.id;
      s.state = "hunting";
      s._escortTarget = null;
      if (s.npc) s.npc.status = "Engaging pirate";
      return;
    }
  }
  const d = dist(s, t);
  if (d > 120) {
    const a = ang(s, t);
    const lookAhead = 35;
    const nx = s.x + Math.cos(a) * lookAhead;
    const ny = s.y + Math.sin(a) * lookAhead;
    if (onLand(nx, ny)) {
      const steerA = !onLand(
        s.x + Math.cos(a - Math.PI / 3) * lookAhead,
        s.y + Math.sin(a - Math.PI / 3) * lookAhead,
      )
        ? a - Math.PI / 3
        : a + Math.PI / 3;
      s.vx += Math.cos(steerA) * s.maxSpd * 0.06;
      s.vy += Math.sin(steerA) * s.maxSpd * 0.06;
    } else {
      s.vx += Math.cos(a) * s.maxSpd * 0.04;
      s.vy += Math.sin(a) * s.maxSpd * 0.04;
    }
  }
}

// ======================== SLOWDOWNS ========================
function applySlowdowns() {
  const allShips = getAllShips();
  for (const s of allShips) {
    if (!s.alive) continue;
    s.slowed = false;
    s.maxSpd = s.baseSpd;
    if (s.faction === "ship") {
      for (const p of allShips) {
        if (p.faction === "pirate" && p.alive && dist(s, p) < SLOW_RANGE) {
          s.maxSpd = s.baseSpd * 0.3;
          s.slowed = true;
          break;
        }
      }
    }
    if (s.faction === "pirate") {
      for (const n of allShips) {
        if (n.faction === "navy" && n.alive && dist(s, n) < SLOW_RANGE) {
          s.maxSpd = s.baseSpd * 0.3;
          s.slowed = true;
          break;
        }
      }
    }
  }
}

// ======================== PLAYER UPDATE ========================
function updatePlayerShip(player, dt) {
  const s = player.ship;
  if (!s || !s.alive) return;
  if (s.stunTimer > 0) {
    s.stunTimer -= dt;
    s.vx *= 0.9;
    s.vy *= 0.9;
    s.x += s.vx;
    s.y += s.vy;
    s.resolveLandCollision();
    return;
  }
  if (s.shootCooldown > 0) s.shootCooldown -= dt;

  // Player boarding state allows movement (can break free)
  if (s.state === "boarding" && s._target && s._target.alive) {
    const d = dist(s, s._target);
    if (d > BOARD_RANGE * 2.2) {
      s.state = "idle";
      s._target = null;
      s._targetId = null;
      s.boardProgress = 0;
      sendMsg(player.id, "Target escaped range!", "alert");
    } else {
      const boardTime = player.drunk > 0 ? BOARD_TIME * 1.8 : BOARD_TIME;
      s.boardProgress += dt / boardTime;
      if (s.boardProgress >= 1.0) completePlayerBoarding(player);
    }
    // Still allow movement while boarding (slower)
  }

  const inp = player.input;
  let ax = 0,
    ay = 0;
  if (inp.w) ay = -1;
  if (inp.s) ay = 1;
  if (inp.a) ax = -1;
  if (inp.d) ax = 1;
  if (ax || ay) {
    const l = Math.sqrt(ax * ax + ay * ay);
    ax /= l;
    ay /= l;
    const moveRate = s.state === "boarding" ? 0.03 : 0.08;
    s.vx += ax * s.maxSpd * moveRate;
    s.vy += ay * s.maxSpd * moveRate;
    s.tAngle = Math.atan2(ay, ax);
  }

  if (player.faction === "pirate" && player.drunk > 0) {
    player.drunk -= dt;
    s.vx += (Math.random() - 0.5) * s.maxSpd * 0.18;
    s.vy += (Math.random() - 0.5) * s.maxSpd * 0.18;
    s.maxSpd = s.baseSpd * 0.65;
    if (player.drunk <= 0) {
      player.drunk = 0;
      sendMsg(player.id, "Sober now. Steady steering.", "info");
    }
  }

  if (player.faction === "navy" && (ax || ay))
    player.fuel = Math.max(0, player.fuel - dt * 0.8);
  if (player.faction === "navy" && player.fuel <= 0)
    s.maxSpd = Math.min(s.maxSpd, 0.5);
  if (
    player.faction === "pirate" &&
    inp.space &&
    !s.slowed &&
    player.drunk <= 0
  )
    s.maxSpd = s.baseSpd * 1.4;
  else if (player.faction === "pirate" && !s.slowed && player.drunk <= 0)
    s.maxSpd = s.baseSpd;

  s.vx *= 0.95;
  s.vy *= 0.95;
  let spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
  if (spd > s.maxSpd) {
    s.vx = (s.vx / spd) * s.maxSpd;
    s.vy = (s.vy / spd) * s.maxSpd;
  }
  s.angle = lerpAng(s.angle, s.tAngle, 0.1);
  s.x += s.vx;
  s.y += s.vy;
  s.x = clamp(s.x, 15, WW - 15);
  s.y = clamp(s.y, 15, WH - 15);
  s.resolveLandCollision();

  // Shooting
  if (inp.shoot && s.weaponDamage > 0 && s.shootCooldown <= 0) {
    const a = inp.mouseAngle;
    projectiles.push(
      new Projectile(
        s.x + Math.cos(a) * s.sz,
        s.y + Math.sin(a) * s.sz,
        a,
        s.id,
        s.faction,
        s.weaponDamage,
        s.bulletSpeed,
        s.weaponType,
      ),
    );
    s.shootCooldown = s.weaponCooldownTime;
  }
}

function completePlayerBoarding(player) {
  const s = player.ship;
  const t = s._target;
  if (!t || !t.alive) {
    s.state = "idle";
    s._target = null;
    s._targetId = null;
    s.boardProgress = 0;
    return;
  }
  if (player.faction === "pirate" && t.faction === "ship") {
    const loot = Math.floor(t.cargoValue * 0.7);
    player.loot = Math.min(player.maxLoot, player.loot + loot);
    player.shipsSeized++;
    sendMsg(
      player.id,
      "Boarded " + (t.npc?.name || "vessel") + "! +$" + loot + " loot",
      "success",
    );
    t.state = "looted";
    t.cargoValue = 0;
    t.alive = false;
  } else if (player.faction === "navy" && t.faction === "pirate") {
    player.score += 200;
    player.totalIncome += 200;
    player.intercepts++;
    sendMsg(
      player.id,
      "Pirate " + (t.npc?.name || "vessel") + " intercepted! +200",
      "success",
    );
    t.alive = false;
  }
  s.state = "idle";
  s._target = null;
  s._targetId = null;
  s.boardProgress = 0;
}

// ======================== PROJECTILE COLLISIONS ========================
function updateProjectiles(dt) {
  const allShips = getAllShips();
  for (const p of projectiles) {
    if (!p.alive) continue;
    p.update(dt);
    if (!p.alive) continue;
    for (const s of allShips) {
      if (!s.alive || s.id === p.ownerId) continue;
      if (s.faction === p.faction) continue;
      if (isInSafePort(s)) continue;
      if (dist(p, s) < s.sz + 4) {
        const killed = s.damage(p.damage, p.ownerId);
        p.alive = false;
        if (killed) {
          // Credit the kill to the player who shot
          for (const [pid, pl] of players.entries()) {
            if (pl.ship && pl.ship.id === p.ownerId) {
              if (pl.faction === "navy") {
                pl.score += 200;
                pl.totalIncome += 200;
                pl.intercepts++;
              } else if (pl.faction === "pirate") {
                pl.shipsSeized++;
                pl.money += 100;
                pl.totalIncome += 100;
              }
              sendMsg(
                pid,
                "Destroyed " + (s.npc?.name || "vessel") + "!",
                "success",
              );
              break;
            }
          }
          // Check if killed ship belonged to a player
          if (s.ownerId) {
            const victim = players.get(s.ownerId);
            if (victim) sendMsg(victim.id, "Your ship was destroyed!", "alert");
          }
        }
        break;
      }
    }
  }
  // Remove dead projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].alive) projectiles.splice(i, 1);
  }
}

// ======================== COLLISION DAMAGE ========================
function checkCollisionDamage(dt) {
  for (const [pid, pl] of players.entries()) {
    if (!pl.ship || !pl.ship.alive || pl.ship.state === "boarding") continue;
    const s = pl.ship;
    if (isInSafePort(s)) continue;
    const allShips = getAllShips();
    for (const t of allShips) {
      if (t === s || !t.alive) continue;
      const hostile =
        (pl.faction === "navy" && t.faction === "pirate") ||
        (pl.faction === "pirate" && t.faction === "navy") ||
        (pl.faction === "shipping" && t.faction === "pirate") ||
        (pl.faction === "pirate" && t.faction === "ship");
      if (hostile && dist(s, t) < s.sz + t.sz + 8) {
        s.damage(8 * dt, t.id);
        if (!s.alive) {
          sendMsg(pid, "Your ship was destroyed!", "alert");
        }
      }
    }
  }
}

// ======================== SHOP SYSTEM ========================
function getShopData(player, portKey) {
  const port = PORTS[portKey];
  if (!port || !player.ship) return null;
  if (dist(player.ship, port) > DOCK_RANGE + 20) return null;

  const sections = [];
  const s = player.ship;

  // ===== PIRATE AT ISLAND =====
  if (player.faction === "pirate" && port.f === "island") {
    const rumItems = [];
    if (player.drunk > 0) {
      rumItems.push({
        name: "Already drinking!",
        desc: Math.ceil(player.drunk) + "s remaining",
        action: null,
        cost: 0,
      });
    } else {
      rumItems.push({
        name: "Buy Rum",
        desc: "Wobbly steering for 60s. Boarding takes longer.",
        action: "buyrum",
        cost: 150,
        canBuy: player.money >= 150,
      });
    }
    sections.push({ title: "Rum", items: rumItems });
    const dmg = s.maxHp - s.hp;
    const repItems = [];
    if (dmg > 0) {
      const cost = Math.floor(dmg * 4);
      repItems.push({
        name: "Patch Hull (" + Math.floor(dmg) + " HP)",
        desc: "Basic repairs",
        action: "piraterepair",
        cost,
        canBuy: player.money >= cost,
      });
    } else
      repItems.push({ name: "Hull intact", desc: "", action: null, cost: 0 });
    sections.push({ title: "Patch Hull", items: repItems });
  }
  // ===== PIRATE AT BLACK MARKET =====
  else if (player.faction === "pirate" && port.f === "pirate") {
    const mt = MarketThreat[portKey];
    const bm = BLACK_MARKETS[portKey];
    sections.push({
      title: "Market Status",
      items: [
        {
          name: bm.label,
          desc:
            "State: " +
            mt.state +
            " | Naval: " +
            Math.round(mt.naval * 100) +
            "% | Heat: " +
            Math.round(mt.heat * 100) +
            "%",
          action: null,
          cost: 0,
          marketState: mt.state,
        },
      ],
    });
    const dmg = s.maxHp - s.hp;
    const repItems = [];
    if (dmg > 0) {
      const cost = Math.floor(dmg * 3);
      repItems.push({
        name: "Fix Hull (" + Math.floor(dmg) + " HP)",
        action: "piraterepair",
        cost,
        canBuy: player.money >= cost,
      });
    } else
      repItems.push({ name: "Hull at full integrity", action: null, cost: 0 });
    sections.push({ title: "Repair", items: repItems });

    const lootItems = [];
    if (player.loot <= 0) {
      lootItems.push({
        name: "No loot to sell",
        desc: "Board merchant ships first",
        action: null,
        cost: 0,
      });
    } else {
      const pr = getMarketPrice(portKey, player.loot * 8);
      lootItems.push({
        name: "Sell All Loot (" + Math.floor(player.loot) + " units)",
        desc: "Est: $" + pr.price + " (x" + pr.mult + ")",
        action: "sellall",
        cost: 0,
        canBuy: pr.state !== "LOCKDOWN",
        reward: pr.price,
        port: portKey,
      });
    }
    sections.push({ title: "Sell Loot", items: lootItems });

    const upgItems = [
      {
        name: "Faster Engine",
        cost: 1000,
        desc: "+0.4 speed (max " + UPGRADE_CAPS.maxSpd.toFixed(1) + ")",
        action: "upgrade",
        id: "spd",
        canBuy: player.money >= 1000 && s.baseSpd < UPGRADE_CAPS.maxSpd,
      },
      {
        name: "Reinforced Hull",
        cost: 1200,
        desc: "+30 max HP (max " + UPGRADE_CAPS.maxHp + ")",
        action: "upgrade",
        id: "hp",
        canBuy: player.money >= 1200 && s.maxHp < UPGRADE_CAPS.maxHp,
      },
      {
        name: "Larger Hold",
        cost: 1500,
        desc: "+200 loot capacity (max " + UPGRADE_CAPS.maxLoot + ")",
        action: "upgrade",
        id: "cap",
        canBuy: player.money >= 1500 && player.maxLoot < UPGRADE_CAPS.maxLoot,
      },
      {
        name: "Bigger Ship",
        cost: 3000,
        desc: "+50 HP, +200 hold, larger hull, -0.3 speed",
        action: "upgrade",
        id: "tier",
        canBuy: player.money >= 3000 && s.shipTier < 2,
      },
    ];
    sections.push({ title: "Upgrades", items: upgItems });
    const weaponItems = [];
    for (const [wk, wt] of Object.entries(WEAPON_TYPES)) {
      if (["deckgun", "autocannon", "turret"].includes(wk)) continue;
      const equipped = s.weaponType === wk;
      const cost =
        wk === "cannon"
          ? 0
          : wk === "rapidfire"
            ? 2000
            : wk === "heavy"
              ? 3500
              : wk === "railgun"
                ? 5000
                : 7000;
      weaponItems.push({
        name: wt.name + (equipped ? " [EQUIPPED]" : ""),
        cost,
        desc: "DMG:" + wt.dmg + " SPD:" + wt.spd + " CD:" + wt.cd + "s",
        action: equipped ? null : "buyweapon",
        id: wk,
        canBuy: !equipped && player.money >= cost,
      });
    }
    sections.push({ title: "Weapons", items: weaponItems });
  }
  // ===== SHIPPING =====
  else if (player.faction === "shipping") {
    const dmg = s.maxHp - s.hp;
    const repItems = [];
    if (dmg > 0) {
      const cost = Math.floor(dmg * 2);
      repItems.push({
        name: "Fix Hull (" + Math.floor(dmg) + " HP)",
        action: "repair",
        cost,
        canBuy: player.money >= cost,
      });
    } else
      repItems.push({ name: "Hull at full integrity", action: null, cost: 0 });
    sections.push({ title: "Repair", items: repItems });

    // Contract section
    const contractItems = [];
    if (player.contract && portKey === player.contract.to) {
      contractItems.push({
        name: "Deliver " + player.contract.cargo,
        desc: "Destination reached! Collect payment.",
        action: "deliver",
        cost: 0,
        canBuy: true,
        reward: player.contract.reward,
      });
    } else if (player.contract) {
      contractItems.push({
        name: player.contract.cargo,
        desc:
          "Deliver to " +
          PORTS[player.contract.to].name +
          " for $" +
          player.contract.reward,
        action: null,
        cost: 0,
        inTransit: true,
      });
    } else {
      const avail = CONTRACT_DEFS.filter((c) => c.from === portKey);
      if (!avail.length)
        contractItems.push({
          name: "No contracts here",
          desc: "Try Aden, Djibouti, or Mombasa",
          action: null,
          cost: 0,
        });
      for (const c of avail) {
        const dest = PORTS[c.to];
        const d = Math.floor(dist(port, dest));
        contractItems.push({
          name: c.cargo,
          desc: dest.name + " | " + d + "km | $" + c.reward,
          action: "pickup",
          cost: 0,
          canBuy: true,
          cargo: c.cargo,
          to: c.to,
          reward: c.reward,
        });
      }
    }
    sections.push({ title: "Contracts", items: contractItems });

    const upgItems = [
      {
        name: "Engine Tune",
        cost: 2000,
        desc: "+0.3 speed (max " + UPGRADE_CAPS.maxSpd.toFixed(1) + ")",
        action: "upgrade",
        id: "spd",
        canBuy: player.money >= 2000 && s.baseSpd < UPGRADE_CAPS.maxSpd,
      },
      {
        name: "Reinforced Hull",
        cost: 2500,
        desc: "+30 max HP (max " + UPGRADE_CAPS.maxHp + ")",
        action: "upgrade",
        id: "hp",
        canBuy: player.money >= 2500 && s.maxHp < UPGRADE_CAPS.maxHp,
      },
      {
        name: "Bigger Ship",
        cost: 5000,
        desc: "+60 HP, larger hull, -0.2 speed",
        action: "upgrade",
        id: "tier",
        canBuy: player.money >= 5000 && s.shipTier < 2,
      },
    ];
    sections.push({ title: "Upgrades", items: upgItems });
    const weaponItems = [];
    for (const [wk, wt] of Object.entries(WEAPON_TYPES)) {
      if (["cannon", "rapidfire", "heavy", "railgun", "rocket"].includes(wk))
        continue;
      const equipped = s.weaponType === wk;
      const cost = wk === "deckgun" ? 3000 : wk === "autocannon" ? 5000 : 7000;
      weaponItems.push({
        name: wt.name + (equipped ? " [EQUIPPED]" : ""),
        cost,
        desc: "DMG:" + wt.dmg + " SPD:" + wt.spd + " CD:" + wt.cd + "s",
        action: equipped ? null : "buyweapon",
        id: wk,
        canBuy: !equipped && player.money >= cost,
      });
    }
    sections.push({ title: "Weapons", items: weaponItems });
  }
  // ===== NAVY =====
  else if (player.faction === "navy") {
    const refuelItems = [];
    if (player.fuel < 100)
      refuelItems.push({
        name: "Refuel (" + Math.floor(100 - player.fuel) + "%)",
        action: "refuel",
        cost: 0,
        canBuy: true,
      });
    else refuelItems.push({ name: "Fuel at 100%", action: null, cost: 0 });
    sections.push({ title: "Refuel", items: refuelItems });

    const repItems = [];
    if (s.hp < s.maxHp)
      repItems.push({
        name: "Repair Hull",
        action: "navyrepair",
        cost: 0,
        canBuy: true,
      });
    else repItems.push({ name: "Hull at 100%", action: null, cost: 0 });
    sections.push({ title: "Repair", items: repItems });

    const upgItems = [
      {
        name: "Engine Upgrade",
        cost: 0,
        desc: "+0.4 speed (max " + UPGRADE_CAPS.maxSpd.toFixed(1) + ")",
        action: "upgrade",
        id: "spd",
        canBuy: player.score >= 500 && s.baseSpd < UPGRADE_CAPS.maxSpd,
        scoreCost: 500,
      },
      {
        name: "Hull Reinforcement",
        cost: 0,
        desc: "+30 max HP (max " + UPGRADE_CAPS.maxHp + ")",
        action: "upgrade",
        id: "hp",
        canBuy: player.score >= 400 && s.maxHp < UPGRADE_CAPS.maxHp,
        scoreCost: 400,
      },
      {
        name: "Extended Radar",
        cost: 0,
        desc: "+50% detection range on minimap",
        action: "upgrade",
        id: "radar",
        canBuy: player.score >= 300,
        scoreCost: 300,
      },
      {
        name: "Bigger Ship",
        cost: 0,
        desc: "+80 HP, larger hull, -0.3 speed",
        action: "upgrade",
        id: "tier",
        canBuy: player.score >= 800 && s.shipTier < 2,
        scoreCost: 800,
      },
    ];
    sections.push({ title: "Upgrades (Score Cost)", items: upgItems });
    const weaponItems = [];
    for (const [wk, wt] of Object.entries(WEAPON_TYPES)) {
      if (["deckgun", "autocannon", "turret"].includes(wk)) continue;
      const equipped = s.weaponType === wk;
      const scoreCost =
        wk === "cannon"
          ? 0
          : wk === "rapidfire"
            ? 400
            : wk === "heavy"
              ? 600
              : wk === "railgun"
                ? 800
                : 1000;
      weaponItems.push({
        name: wt.name + (equipped ? " [EQUIPPED]" : ""),
        cost: 0,
        desc: "DMG:" + wt.dmg + " SPD:" + wt.spd + " CD:" + wt.cd + "s",
        action: equipped ? null : "buyweapon",
        id: wk,
        scoreCost,
        canBuy: !equipped && player.score >= scoreCost,
      });
    }
    sections.push({ title: "Weapons (Score Cost)", items: weaponItems });

    sections.push({
      title: "Service Record",
      items: [
        {
          name: "Pirates Intercepted",
          desc: "" + player.intercepts,
          action: null,
          cost: 0,
        },
        {
          name: "Total Score",
          desc: "$" + player.score,
          action: null,
          cost: 0,
        },
      ],
    });
  } else {
    sections.push({
      title: "Info",
      items: [
        { name: "No services for your faction here", action: null, cost: 0 },
      ],
    });
  }

  return { portKey, portName: port.name, portFaction: port.f, sections };
}

function handleShopAction(player, data) {
  const s = player.ship;
  if (!s || !s.alive) return;
  const action = data.action;
  const portKey = data.portKey;

  if (action === "sellall") {
    const pr = getMarketPrice(portKey, player.loot * 8);
    if (pr.state === "LOCKDOWN" || player.loot <= 0) return;
    player.money += pr.price;
    player.totalIncome += pr.price;
    MarketThreat[portKey].dumped += pr.price * 0.3;
    sendMsg(player.id, "Sold loot for $" + pr.price, "success");
    player.loot = 0;
  } else if (action === "buyrum") {
    if (player.money < 150 || player.drunk > 0) return;
    player.money -= 150;
    player.drunk = 60;
    sendMsg(player.id, "You bought rum! Wobbly steering for 60s.", "warn");
  } else if (action === "piraterepair") {
    const dmg = s.maxHp - s.hp;
    const isIsland = PORTS[portKey] && PORTS[portKey].f === "island";
    const cost = Math.floor(dmg * (isIsland ? 4 : 3));
    if (player.money < cost) return;
    player.money -= cost;
    s.hp = s.maxHp;
    sendMsg(player.id, "Hull repaired!", "success");
  } else if (action === "upgrade") {
    const id = data.id;
    if (player.faction === "pirate") {
      if (
        id === "spd" &&
        player.money >= 1000 &&
        s.baseSpd < UPGRADE_CAPS.maxSpd
      ) {
        player.money -= 1000;
        s.baseSpd = Math.min(UPGRADE_CAPS.maxSpd, s.baseSpd + 0.4);
        s.maxSpd = s.baseSpd;
        sendMsg(
          player.id,
          "Engine upgraded! Speed: " + s.baseSpd.toFixed(1),
          "success",
        );
      } else if (
        id === "hp" &&
        player.money >= 1200 &&
        s.maxHp < UPGRADE_CAPS.maxHp
      ) {
        player.money -= 1200;
        const add = Math.min(30, UPGRADE_CAPS.maxHp - s.maxHp);
        s.maxHp += add;
        s.hp += add;
        sendMsg(player.id, "Hull reinforced! HP: " + s.maxHp, "success");
      } else if (
        id === "cap" &&
        player.money >= 1500 &&
        player.maxLoot < UPGRADE_CAPS.maxLoot
      ) {
        player.money -= 1500;
        player.maxLoot = Math.min(UPGRADE_CAPS.maxLoot, player.maxLoot + 200);
        sendMsg(
          player.id,
          "Hold expanded! Capacity: " + player.maxLoot,
          "success",
        );
      } else if (id === "tier" && player.money >= 3000 && s.shipTier < 2) {
        player.money -= 3000;
        s.shipTier++;
        s.maxHp += 50;
        s.hp += 50;
        player.maxLoot += 200;
        s.sz += 3;
        s.baseSpd = Math.max(1.0, s.baseSpd - 0.3);
        s.maxSpd = s.baseSpd;
        sendMsg(
          player.id,
          "Ship upgraded to " + (s.shipTier === 1 ? "Medium" : "Large") + "!",
          "success",
        );
      }
    } else if (player.faction === "shipping") {
      if (
        id === "spd" &&
        player.money >= 2000 &&
        s.baseSpd < UPGRADE_CAPS.maxSpd
      ) {
        player.money -= 2000;
        s.baseSpd = Math.min(UPGRADE_CAPS.maxSpd, s.baseSpd + 0.3);
        s.maxSpd = s.baseSpd;
        sendMsg(
          player.id,
          "Engine tuned! Speed: " + s.baseSpd.toFixed(1),
          "success",
        );
      } else if (
        id === "hp" &&
        player.money >= 2500 &&
        s.maxHp < UPGRADE_CAPS.maxHp
      ) {
        player.money -= 2500;
        const add = Math.min(30, UPGRADE_CAPS.maxHp - s.maxHp);
        s.maxHp += add;
        s.hp += add;
        sendMsg(player.id, "Hull reinforced! HP: " + s.maxHp, "success");
      } else if (id === "tier" && player.money >= 5000 && s.shipTier < 2) {
        player.money -= 5000;
        s.shipTier++;
        s.maxHp += 60;
        s.hp += 60;
        s.sz += 4;
        s.baseSpd = Math.max(1.0, s.baseSpd - 0.2);
        s.maxSpd = s.baseSpd;
        sendMsg(
          player.id,
          "Ship upgraded to " + (s.shipTier === 1 ? "Medium" : "Large") + "!",
          "success",
        );
      }
    } else if (player.faction === "navy") {
      const costs = { spd: 500, hp: 400, radar: 300, tier: 800 };
      const cost = costs[id] || 0;
      if (player.score < cost) return;
      if (id === "spd" && s.baseSpd < UPGRADE_CAPS.maxSpd) {
        player.score -= cost;
        s.baseSpd = Math.min(UPGRADE_CAPS.maxSpd, s.baseSpd + 0.4);
        s.maxSpd = s.baseSpd;
        sendMsg(
          player.id,
          "Engine upgraded! Speed: " + s.baseSpd.toFixed(1),
          "success",
        );
      } else if (id === "hp" && s.maxHp < UPGRADE_CAPS.maxHp) {
        player.score -= cost;
        const add = Math.min(30, UPGRADE_CAPS.maxHp - s.maxHp);
        s.maxHp += add;
        s.hp += add;
        sendMsg(player.id, "Hull reinforced! HP: " + s.maxHp, "success");
      } else if (id === "radar") {
        player.score -= cost;
        player.radarRange = 1.5;
        sendMsg(player.id, "Radar extended!", "success");
      } else if (id === "tier" && s.shipTier < 2) {
        player.score -= cost;
        s.shipTier++;
        s.maxHp += 80;
        s.hp += 80;
        s.sz += 3;
        s.baseSpd = Math.max(1.0, s.baseSpd - 0.3);
        s.maxSpd = s.baseSpd;
        sendMsg(player.id, "Ship upgraded!", "success");
      }
    }
  } else if (action === "buyweapon") {
    const wk = data.id;
    const wt = WEAPON_TYPES[wk];
    if (!wt) return;
    if (player.faction === "navy") {
      const scoreCosts = {
        cannon: 0,
        rapidfire: 400,
        heavy: 600,
        railgun: 800,
        rocket: 1000,
      };
      const cost = scoreCosts[wk] || 0;
      if (player.score < cost) return;
      player.score -= cost;
    } else if (player.faction === "pirate") {
      const moneyCosts = {
        cannon: 0,
        rapidfire: 2000,
        heavy: 3500,
        railgun: 5000,
        rocket: 7000,
      };
      const cost = moneyCosts[wk] || 0;
      if (player.money < cost) return;
      player.money -= cost;
    } else if (player.faction === "shipping") {
      const moneyCosts = { deckgun: 3000, autocannon: 5000, turret: 7000 };
      const cost = moneyCosts[wk] || 0;
      if (player.money < cost) return;
      player.money -= cost;
    }
    s.weaponType = wk;
    s.weaponDamage = wt.dmg;
    s.bulletSpeed = wt.spd;
    s.weaponCooldownTime = wt.cd;
    sendMsg(player.id, wt.name + " equipped!", "success");
  } else if (action === "pickup") {
    if (player.contract) return;
    player.contract = {
      cargo: data.cargo,
      from: portKey,
      to: data.to,
      reward: data.reward,
    };
    sendMsg(
      player.id,
      "Contract: Deliver " + data.cargo + " to " + PORTS[data.to].name,
      "success",
    );
  } else if (action === "deliver") {
    if (!player.contract || portKey !== player.contract.to) return;
    player.money += player.contract.reward;
    player.totalIncome += player.contract.reward;
    player.deliveries++;
    sendMsg(
      player.id,
      "Delivered " + player.contract.cargo + "! +$" + player.contract.reward,
      "success",
    );
    player.contract = null;
  } else if (action === "repair") {
    const dmg = s.maxHp - s.hp;
    const cost = Math.floor(dmg * 2);
    if (player.money < cost) return;
    player.money -= cost;
    s.hp = s.maxHp;
    sendMsg(player.id, "Hull repaired!", "success");
  } else if (action === "refuel") {
    player.fuel = 100;
    s.maxSpd = s.baseSpd;
    sendMsg(player.id, "Refueled to 100%", "success");
  } else if (action === "navyrepair") {
    s.hp = s.maxHp;
    sendMsg(player.id, "Hull repaired!", "success");
  }
}

// ======================== INTERACTION ========================
function handleInteraction(player) {
  if (!player.ship || !player.ship.alive) return;
  const s = player.ship;
  for (const [key, port] of Object.entries(PORTS)) {
    if (dist(s, port) < DOCK_RANGE) {
      const shopData = getShopData(player, key);
      if (shopData) player.socket.emit("shopOpen", shopData);
      return;
    }
  }
  const allShips = getAllShips();
  if (player.faction === "pirate") {
    for (const t of allShips) {
      if (
        t !== s &&
        t.faction === "ship" &&
        t.alive &&
        t.state !== "looted" &&
        dist(s, t) < BOARD_RANGE
      ) {
        s._target = t;
        s._targetId = t.id;
        s.state = "boarding";
        s.boardProgress = 0;
        sendMsg(
          player.id,
          "Boarding " + (t.npc?.name || "vessel") + "...",
          "info",
        );
        return;
      }
    }
  }
  if (player.faction === "navy") {
    for (const t of allShips) {
      if (
        t !== s &&
        t.faction === "pirate" &&
        t.alive &&
        dist(s, t) < INTERCEPT_RANGE
      ) {
        s._target = t;
        s._targetId = t.id;
        s.state = "boarding";
        s.boardProgress = 0;
        sendMsg(player.id, "Intercepting pirate vessel...", "alert");
        return;
      }
    }
  }
}

// ======================== GAME LOOP ========================
function tick() {
  const dt = 1 / TICK_RATE;
  gameTime += dt;

  updateMarkets(dt);

  // NPC spawning
  for (const t of Object.keys(spawnTimers)) {
    spawnTimers[t] -= dt;
    if (spawnTimers[t] <= 0) {
      const npcCount = npcs.filter((n) => n.alive).length;
      if (npcCount < 80) {
        if (t === "merchant" && Math.random() < 0.8) spawnNPC("ai_merchant");
        if (t === "pirate" && Math.random() < 0.9) spawnNPC("ai_pirate");
        if (t === "navy" && Math.random() < 0.7) spawnNPC("ai_navy");
        if (t === "fishing" && Math.random() < 0.5) spawnNPC("fishing");
      }
      spawnTimers[t] =
        t === "merchant" ? 3 : t === "pirate" ? 4 : t === "navy" ? 5 : 10;
    }
  }

  // Clean dead NPCs
  for (let i = npcs.length - 1; i >= 0; i--)
    if (!npcs[i].alive) npcs.splice(i, 1);

  applySlowdowns();
  updateAIDecisions(dt);

  for (const s of npcs) updateNPCShip(s, dt);
  for (const p of players.values()) updatePlayerShip(p, dt);

  updateProjectiles(dt);
  checkCollisionDamage(dt);

  // Check player deaths
  for (const [pid, pl] of players.entries()) {
    if (pl.ship && !pl.ship.alive && !pl.dead) {
      pl.dead = true;
      const stats = {};
      if (pl.faction === "navy") {
        stats.title = "PATROL ENDED";
        stats.sub = "Your vessel was lost.";
        stats.intercepts = pl.intercepts;
        stats.score = pl.score;
      } else if (pl.faction === "shipping") {
        stats.title = "CARGO LOST";
        stats.sub = "Your ship went down with all cargo.";
        stats.money = pl.money;
        stats.deliveries = pl.deliveries;
      } else {
        stats.title = "CREW LOST";
        stats.sub = "Your skiff was destroyed.";
        stats.shipsSeized = pl.shipsSeized;
        stats.money = pl.money;
      }
      pl.socket.emit("gameOver", stats);
    }
  }

  broadcastState();
}

// ======================== BROADCAST ========================
function broadcastState() {
  const shipList = [];
  for (const s of npcs) {
    if (!s.alive) continue;
    shipList.push({
      id: s.id,
      x: Math.round(s.x * 10) / 10,
      y: Math.round(s.y * 10) / 10,
      angle: Math.round(s.angle * 100) / 100,
      hp: Math.round(s.hp),
      maxHp: s.maxHp,
      faction: s.faction,
      sz: s.sz,
      typeKey: s.typeKey,
      state: s.state,
      slowed: s.slowed,
      boardProgress: s.boardProgress,
      name: s.npc?.name || null,
      status: s.npc?.status || null,
      stunTimer: s.stunTimer,
    });
  }
  for (const [pid, pl] of players.entries()) {
    if (!pl.ship) continue;
    const s = pl.ship;
    shipList.push({
      id: s.id,
      x: Math.round(s.x * 10) / 10,
      y: Math.round(s.y * 10) / 10,
      angle: Math.round(s.angle * 100) / 100,
      hp: Math.round(s.hp),
      maxHp: s.maxHp,
      faction: s.faction,
      sz: s.sz,
      typeKey: s.typeKey,
      state: s.state,
      slowed: s.slowed,
      boardProgress: s.boardProgress,
      name: pl.name,
      status: null,
      isPlayer: true,
      ownerId: pid,
      alive: s.alive,
      stunTimer: s.stunTimer,
      cosmetic: pl.cosmetic,
      weaponType: s.weaponType,
    });
  }
  const projList = projectiles.map((p) => ({
    x: Math.round(p.x),
    y: Math.round(p.y),
    vx: Math.round(p.vx * 10) / 10,
    vy: Math.round(p.vy * 10) / 10,
    faction: p.faction,
    wt: p.weaponType,
  }));
  const marketData = {};
  for (const [k, m] of Object.entries(MarketThreat))
    marketData[k] = {
      state: m.state,
      heat: Math.round(m.heat * 100),
      naval: Math.round(m.naval * 100),
    };

  for (const [pid, pl] of players.entries()) {
    const self = {
      id: pl.ship?.id,
      hp: Math.round(pl.ship?.hp || 0),
      maxHp: pl.ship?.maxHp || 0,
      faction: pl.faction,
      alive: pl.ship?.alive || false,
      money:
        pl.faction === "pirate"
          ? pl.money
          : pl.faction === "shipping"
            ? pl.money
            : 0,
      loot: pl.loot,
      maxLoot: pl.maxLoot,
      fuel: Math.round(pl.fuel),
      score: pl.score,
      intercepts: pl.intercepts,
      deliveries: pl.deliveries,
      shipsSeized: pl.shipsSeized,
      contract: pl.contract,
      drunk: pl.drunk,
      slowed: pl.ship?.slowed || false,
      inSafePort: pl.ship ? isInSafePort(pl.ship) : false,
      boardState: pl.ship?.state === "boarding" ? pl.ship.boardProgress : null,
      weaponDamage: pl.ship?.weaponDamage || 0,
      weaponType: pl.ship?.weaponType || "none",
      shipTier: pl.ship?.shipTier || 0,
      totalIncome: pl.totalIncome,
      x: pl.ship?.x,
      y: pl.ship?.y,
    };
    const myMsgs = messages
      .filter((m) => !m.targetId || m.targetId === pid)
      .slice(-6)
      .map((m) => ({ text: m.text, type: m.type }));
    pl.socket.emit("state", {
      ships: shipList,
      projectiles: projList,
      self,
      markets: marketData,
      messages: myMsgs,
      time: gameTime,
      leaderboard: getLeaderboard(),
    });
  }
}

function getLeaderboard() {
  const entries = [];
  for (const [pid, pl] of players.entries()) {
    entries.push({ name: pl.name, faction: pl.faction, score: pl.totalIncome });
  }
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, 10);
}

// ======================== SOCKET HANDLERS ========================
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  if (players.size >= MAX_PLAYERS) {
    socket.emit("full");
    socket.disconnect();
    return;
  }

  socket.on("join", (data) => {
    const faction = data.faction;
    const name = (data.name || "Anon").slice(0, 16);
    if (!["navy", "shipping", "pirate"].includes(faction)) {
      socket.emit("error", "Invalid faction");
      return;
    }

    const startTypes = { navy: "patrol", shipping: "coastal", pirate: "skiff" };
    const factionPorts = faction === "navy" ? NAVY_PORTS : faction === "pirate" ? PIRATE_PORTS : NEUTRAL_PORTS;
    const sp = pick(factionPorts);
    const ship = new Ship(
      sp.x + rand(-40, 40),
      sp.y + rand(-40, 40),
      startTypes[faction],
      socket.id,
    );

    const player = {
      id: socket.id,
      socket,
      name,
      faction,
      ship,
      input: {
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
        mouseAngle: 0,
        shoot: false,
      },
      money: faction === "shipping" ? 5000 : 0,
      loot: 0,
      maxLoot: 500,
      fuel: 100,
      score: 0,
      intercepts: 0,
      deliveries: 0,
      shipsSeized: 0,
      contract: null,
      drunk: 0,
      dead: false,
      radarRange: 1.0,
      totalIncome: 0,
      cosmetic: data.cosmetic || null,
    };
    players.set(socket.id, player);
    socket.emit("joined", { faction, name, shipId: ship.id });
    sendMsg(
      null,
      name +
        " joined as " +
        (faction === "navy"
          ? "EU NavForce"
          : faction === "shipping"
            ? "Maritime Cargo"
            : "Pirate Crew"),
      "info",
    );
    console.log(name, "joined as", faction, "(" + players.size + " players)");
  });

  socket.on("input", (data) => {
    const pl = players.get(socket.id);
    if (!pl) return;
    pl.input.w = !!data.w;
    pl.input.a = !!data.a;
    pl.input.s = !!data.s;
    pl.input.d = !!data.d;
    pl.input.space = !!data.space;
    pl.input.mouseAngle =
      typeof data.mouseAngle === "number" ? data.mouseAngle : 0;
    pl.input.shoot = !!data.shoot;
  });

  socket.on("interact", () => {
    const pl = players.get(socket.id);
    if (pl && !pl.dead) handleInteraction(pl);
  });

  socket.on("shopAction", (data) => {
    const pl = players.get(socket.id);
    if (pl && !pl.dead) handleShopAction(pl, data);
    // Send updated shop data
    if (data.portKey) {
      const shopData = getShopData(pl, data.portKey);
      if (shopData) pl.socket.emit("shopOpen", shopData);
    }
  });

  socket.on("respawn", (data) => {
    const pl = players.get(socket.id);
    if (!pl) return;
    const faction = data?.faction || pl.faction;
    const startTypes = { navy: "patrol", shipping: "coastal", pirate: "skiff" };
    const factionPorts = faction === "navy" ? NAVY_PORTS : faction === "pirate" ? PIRATE_PORTS : NEUTRAL_PORTS;
    const sp = pick(factionPorts);
    const ship = new Ship(
      sp.x + rand(-40, 40),
      sp.y + rand(-40, 40),
      startTypes[faction],
      socket.id,
    );
    pl.faction = faction;
    pl.ship = ship;
    pl.dead = false;
    pl.money = faction === "shipping" ? 5000 : 0;
    pl.loot = 0;
    pl.maxLoot = 500;
    pl.fuel = 100;
    pl.score = 0;
    pl.intercepts = 0;
    pl.deliveries = 0;
    pl.shipsSeized = 0;
    pl.contract = null;
    pl.drunk = 0;
    pl.totalIncome = 0;
    if (data?.cosmetic) pl.cosmetic = data.cosmetic;
    socket.emit("joined", { faction, name: pl.name, shipId: ship.id });
  });

  socket.on("disconnect", () => {
    const pl = players.get(socket.id);
    if (pl) {
      if (pl.ship) pl.ship.alive = false;
      sendMsg(null, (pl.name || "Player") + " disconnected", "info");
      players.delete(socket.id);
      console.log(
        "Player disconnected:",
        socket.id,
        "(" + players.size + " players)",
      );
    }
  });
});

// ======================== START ========================
spawnInitialNPCs();
setInterval(tick, TICK_MS);
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log("Somali Waters running on port " + PORT));
