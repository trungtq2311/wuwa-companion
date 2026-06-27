/**
 * Build script: fetch real Wuthering Waves data from the wuwabuild dataset
 * (powers wuwa.build), normalize it into compact JSON the app consumes.
 * Images are official CDN URLs (files.wuthery.com) already embedded in the source.
 *
 * Run: node scripts/build-data.mjs
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const BASE = "https://cdn.jsdelivr.net/gh/DommyMM/wuwabuild@master/public/Data";
const H = { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } };
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "wuwa");

const FETCHED_AT = "2026-06-26";

async function fetchJson(file, attempt = 1) {
  try {
    const r = await fetch(`${BASE}/${file}`, H);
    if (!r.ok) throw new Error(`${file} -> ${r.status}`);
    return await r.json();
  } catch (e) {
    if (attempt >= 4) throw e;
    await new Promise((res) => setTimeout(res, 800 * attempt));
    return fetchJson(file, attempt + 1);
  }
}

const DB = "https://cdn.jsdelivr.net/gh/Dimbreath/WutheringData@master";
async function dbJson(path, attempt = 1) {
  try {
    const r = await fetch(`${DB}/${path}`, H);
    if (!r.ok) throw new Error(`${path} -> ${r.status}`);
    return await r.json();
  } catch (e) {
    if (attempt >= 4) throw e;
    await new Promise((res) => setTimeout(res, 1000 * attempt));
    return dbJson(path, attempt + 1);
  }
}

/** Convert an in-game UE icon asset path to a wuthery CDN png URL. */
function iconUrl(icon) {
  if (!icon) return null;
  return (
    "https://files.wuthery.com/d/GameData/" +
    icon.split(".")[0].replace(/^\/Game\/Aki\/UI\//, "") +
    ".png"
  );
}

const en = (obj) => (obj && (obj.en || obj["zh-Hans"])) || "";
const local = (obj) => (obj && (obj.vi || obj.en)) || "";

/** Strip in-game rich-text tags and placeholder tokens to plain text. */
function strip(s) {
  if (!s) return "";
  return String(s)
    .replace(/<[^>]+>/g, "")
    .replace(/\{\d+\}/g, "?")
    .replace(/\r/g, "")
    .trim();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const chars = await fetchJson("Characters.json");
  const weaponsRaw = await fetchJson("Weapons.json");
  const echoesRaw = await fetchJson("Echoes.json");
  const fettersRaw = await fetchJson("Fetters.json").catch(() => null);

  // ---- Resonators ----
  const resonators = chars
    .map((c) => {
      const nameEn = en(c.name);
      const elementIcon =
        c.element?.icon && typeof c.element.icon === "object"
          ? c.element.icon["1"] || Object.values(c.element.icon)[0]
          : c.element?.icon;
      return {
        id: c.id,
        slug: slugify(nameEn),
        name: nameEn,
        nameLocal: local(c.name),
        rarity: c.rarity?.id ?? 4,
        // legacyId is the in-game resonator sequence ≈ release order (string upstream).
        releaseOrder: Number(c.legacyId) || 9999,
        element: {
          id: c.element?.id ?? 0,
          name: en(c.element?.name),
          color: (c.element?.color || "#9aa3b8").slice(0, 7),
        },
        weapon: { id: c.weapon?.id ?? 0, name: en(c.weapon?.name) },
        images: {
          avatar: c.icon?.iconRound || null,
          banner: c.icon?.banner || null,
          elementIcon: elementIcon || null,
          weaponIcon: c.weapon?.icon || null,
        },
        baseStats: {
          hp: c.stats?.Life ?? null,
          atk: c.stats?.Atk ?? null,
          def: c.stats?.Def ?? null,
          crit: c.stats?.Crit ?? 5,
          critDmg: c.stats?.CritDamage ?? 150,
        },
        preferredStats: Array.isArray(c.preferredStats) ? c.preferredStats : [],
        roleTags: (c.tags || [])
          .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9))
          .map((t) => ({ name: en(t.name), icon: t.icon || null }))
          .filter((t) => t.name),
        chains: (c.chains || []).map((ch, i) => ({
          seq: i + 1,
          name: en(ch.name),
          description: strip(en(ch.description)),
        })),
        skills: (c.moves || [])
          .filter((m) => en(m.name))
          .map((m) => ({
            name: en(m.name),
            description: strip(en(m.description)).slice(0, 600),
          }))
          .slice(0, 8),
      };
    })
    .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));

  // Ensure unique slugs (e.g. Rover variants share a name).
  const seenSlug = new Map();
  for (const r of resonators) {
    let s = r.slug;
    if (seenSlug.has(s)) {
      s = `${r.slug}-${slugify(r.element.name)}`;
      let n = 2;
      while (seenSlug.has(s)) s = `${r.slug}-${slugify(r.element.name)}-${n++}`;
    }
    seenSlug.set(s, true);
    r.slug = s;
  }

  // ---- Real ascension materials (Dimbreath datamine) ----
  try {
    const itemInfo = await dbJson("ConfigDB/ItemInfo.json");
    const roleInfo = await dbJson("ConfigDB/RoleInfo.json");
    const roleBreach = await dbJson("ConfigDB/RoleBreach.json");
    // MultiText is ~24MB — jsDelivr blocks files that large, use raw.
    let multiText = {};
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const r = await fetch(
          "https://raw.githubusercontent.com/Dimbreath/WutheringData/master/TextMap/en/MultiText.json",
          H,
        );
        if (!r.ok) throw new Error(`MultiText -> ${r.status}`);
        multiText = await r.json();
        break;
      } catch (e) {
        if (attempt === 5) throw e;
        await new Promise((res) => setTimeout(res, 1200 * attempt));
      }
    }
    const itemById = new Map(itemInfo.map((i) => [i.Id, i]));
    const roleById = new Map(roleInfo.map((r) => [r.Id, r]));
    const breachByGroup = new Map();
    for (const b of roleBreach) {
      const arr = breachByGroup.get(b.BreachGroupId) ?? [];
      arr.push(b);
      breachByGroup.set(b.BreachGroupId, arr);
    }
    const ascensionFor = (charId) => {
      const role = roleById.get(charId);
      if (!role) return [];
      const totals = new Map();
      for (const b of breachByGroup.get(role.BreachId) ?? []) {
        for (const c of b.BreachConsume ?? [])
          totals.set(c.Key, (totals.get(c.Key) ?? 0) + c.Value);
      }
      return [...totals.entries()]
        .map(([id, qty]) => {
          const it = itemById.get(id);
          return {
            id,
            qty,
            name: multiText[it?.Name] || `Item ${id}`,
            icon: iconUrl(it?.Icon),
            rarity: it?.QualityId ?? 3,
          };
        })
        .sort((a, b) => b.rarity - a.rarity || b.qty - a.qty);
    };
    let matched = 0;
    for (const r of resonators) {
      r.ascension = ascensionFor(r.id);
      if (r.ascension.length) matched++;
    }
    console.log(`Ascension materials matched for ${matched}/${resonators.length} resonators`);

    // Emit a slim item index (name -> icon/rarity) for skill-material lookup.
    const itemsOut = itemInfo
      .map((i) => ({
        id: i.Id,
        name: multiText[i.Name] || "",
        icon: iconUrl(i.Icon),
        rarity: i.QualityId ?? 3,
      }))
      .filter((i) => i.name && i.icon);
    await writeFile(`${OUT}/items.json`, JSON.stringify(itemsOut));
    console.log(`Items index: ${itemsOut.length} items`);
  } catch (e) {
    console.log("Ascension augmentation skipped:", e.message);
    for (const r of resonators) r.ascension = [];
  }

  // ---- Weapons ----
  const weapons = weaponsRaw
    .map((w) => ({
      id: w.id,
      name: en(w.name),
      type: en(w.type?.name),
      typeId: w.type?.id ?? 0,
      rarity: w.rarity?.id ?? w.rarity ?? 3,
      icon:
        (w.icon && typeof w.icon === "object" ? w.icon.icon : w.icon) || null,
      mainStat: w.stats?.first
        ? { attribute: w.stats.first.attribute, value: w.stats.first.value }
        : null,
      subStat: w.stats?.second
        ? {
            attribute: w.stats.second.attribute,
            value: w.stats.second.value,
            isRatio: !!w.stats.second.isRatio,
          }
        : null,
      effectName: en(w.effectName),
      effect: strip(en(w.effect) || (typeof w.effect === "string" ? w.effect : "")),
    }))
    .filter((w) => w.name)
    .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));

  // ---- Sonata sets (Fetters) ----
  let sonatas = [];
  if (Array.isArray(fettersRaw)) {
    sonatas = fettersRaw.map((f) => ({
      id: f.id ?? f.groupId ?? 0,
      name: en(f.name),
      icon: f.icon || null,
      effects: (f.effect || f.effects || []).map?.((e) =>
        strip(en(e?.description ?? e)),
      ) ?? [],
    }));
  } else if (fettersRaw && typeof fettersRaw === "object") {
    sonatas = Object.entries(fettersRaw).map(([id, f]) => ({
      id: Number(id) || id,
      name: en(f.name) || String(id),
      icon: f.icon || null,
      effects: [],
    }));
  }

  // ---- Echo set ids -> names already via sonatas; keep a light echo list ----
  const echoes = echoesRaw
    .map((e) => ({
      id: e.id,
      name: en(e.name),
      cost: e.cost ?? 1,
      sonataIds: Array.isArray(e.fetter) ? e.fetter : [],
      icon: e.icon
        ? e.icon.startsWith("http")
          ? e.icon
          : `https://files.wuthery.com${e.icon}`
        : null,
    }))
    .filter((e) => e.name);

  // ---- First-seen tracking (auto pre-farm for newly datamined characters) ----
  // seen.json maps resonator id -> the date it first appeared in the dataset.
  // Existing ids keep their date; brand-new ids get today's date. The app flags
  // recently-added characters as "new" for the pre-farm section, and CI cuts a
  // release when this file grows — all without hand-editing anything.
  let seen = {};
  try {
    seen = JSON.parse(await readFile(`${OUT}/seen.json`, "utf8"));
  } catch {
    seen = {};
  }
  const today = new Date().toISOString().slice(0, 10);
  const newcomers = [];
  for (const r of resonators) {
    if (!seen[r.id]) {
      seen[r.id] = today;
      newcomers.push(r.name);
    }
    r.addedAt = seen[r.id];
  }
  if (newcomers.length) {
    console.log(`NEW characters this build: ${newcomers.join(", ")}`);
  }

  const manifest = {
    source: "DommyMM/wuwabuild (powers wuwa.build)",
    sourceUrl: "https://github.com/DommyMM/wuwabuild",
    imagesCdn: "files.wuthery.com",
    fetchedAt: FETCHED_AT,
    counts: {
      resonators: resonators.length,
      weapons: weapons.length,
      echoes: echoes.length,
      sonatas: sonatas.length,
    },
  };

  await Promise.all([
    writeFile(`${OUT}/resonators.json`, JSON.stringify(resonators)),
    writeFile(`${OUT}/weapons.json`, JSON.stringify(weapons)),
    writeFile(`${OUT}/sonatas.json`, JSON.stringify(sonatas)),
    writeFile(`${OUT}/echoes.json`, JSON.stringify(echoes)),
    writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2)),
    writeFile(`${OUT}/seen.json`, JSON.stringify(seen, null, 0)),
  ]);

  console.log("Wrote to", OUT);
  console.log(JSON.stringify(manifest.counts, null, 2));
  console.log("sample resonator:", JSON.stringify(resonators[0]).slice(0, 400));
  console.log("sonata sample:", JSON.stringify(sonatas[0] ?? null).slice(0, 200));
}

main().catch((e) => {
  console.error("BUILD FAILED:", e);
  process.exit(1);
});
