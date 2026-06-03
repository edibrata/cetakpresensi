export const formatKlsRange = (klsArr: string[]) => {
  if (!klsArr || klsArr.length === 0) return "";
  if (klsArr.length === 1) return klsArr[0];
  const romanMap: Record<string, number> = { "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6 };
  const sortedKls = [...klsArr].sort((a, b) => romanMap[a] - romanMap[b]);
  const nums = sortedKls.map(k => romanMap[k]);
  let isSequential = true;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i + 1] !== nums[i] + 1) { isSequential = false; break; }
  }
  if (isSequential && nums.length > 2) return `${sortedKls[0]} s.d. ${sortedKls[sortedKls.length - 1]}`;
  return sortedKls.join(', ');
};

export const buildTugasString = (jab: any) => {
  const build = (d: any) => {
    if (!d.cat) return "";
    if (d.cat === "Kepsek" || d.cat === "Plt. Kepsek") return d.cat;
    const klsStr = formatKlsRange(d.kls);
    if (d.cat === "Guru Mapel") {
      let s = `Guru Mapel ${d.sub}`;
      if (klsStr) s += ` Kelas ${klsStr}`;
      return s;
    }
    if (d.cat === "Guru Kelas") return klsStr ? `Guru Kelas ${klsStr}` : "Guru Kelas";
    return d.sub || "Lainnya";
  };
  let final = build(jab.primary);
  if (jab.secondary.active) final += " | " + build(jab.secondary);
  return final;
};

export const parseJabatan = (jabatanStr: string) => {
  const initial = { primary: { cat: "Lainnya", sub: "", kls: [] }, secondary: { active: false, cat: "Lainnya", sub: "", kls: [] } };
  if (!jabatanStr) return initial;
  const separator = jabatanStr.includes('|') ? '|' : '&';
  const parts = jabatanStr.split(separator).map(p => p.trim());
  const parseSingle = (pStr: string) => {
    let cat = "Lainnya", sub = "", kls: string[] = [];
    if (pStr.includes("Plt. Kepsek")) cat = "Plt. Kepsek";
    else if (pStr.includes("Kepsek")) cat = "Kepsek";
    else if (pStr.includes("Guru Mapel")) cat = "Guru Mapel";
    else if (pStr.includes("Guru Kelas")) cat = "Guru Kelas";
    
    // Check classes from options
    ["I", "II", "III", "IV", "V", "VI"].forEach(k => {
      const reg = new RegExp(`\\b${k}\\b`);
      if (reg.test(pStr)) kls.push(k);
    });

    if (cat === "Guru Mapel") {
      let match = pStr.match(/Guru Mapel\s+([^(\s|]+)/);
      if (match) sub = match[1].trim();
      sub = sub.replace(/Kelas.*$/, "").trim();
    } else if (cat === "Lainnya") {
      sub = pStr;
    }
    return { cat, sub, kls };
  };
  return { primary: parseSingle(parts[0]), secondary: { active: parts.length > 1, ...parseSingle(parts[1] || "") } };
};
