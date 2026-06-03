import * as XLSX from 'xlsx';
import { Staff, Student, Holiday, bNames, Jabatan } from '../types';

export const getTimestamp = (format: "standard" | "backup" = "standard") => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  if (format === "backup") return `${y}${m}${d} ${hh}.${ss}`;
  return `${y}${m}${d}_${hh}${mm}`;
};

export const exportHolidaysToExcel = (holidayData: Holiday[], sekolah: string) => {
  const ts = getTimestamp("backup");
  const wsData = [["Bulan", "Tanggal", "Keterangan"]];
  holidayData.forEach(h => {
    wsData.push([bNames[Number(h.month)], h.date, h.desc]);
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Libur");
  XLSX.writeFile(wb, `Ekspor Libur ${sekolah} ${ts}.xlsx`);
};

export const parseHolidaysExcel = async (file: File): Promise<Holiday[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const rows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        const imported = rows.slice(1).map(r => {
          const mIdx = bNames.indexOf(r[0]);
          return { month: mIdx !== -1 ? mIdx : 0, date: String(r[1] || ""), desc: r[2] || "" };
        }).filter(x => x.date !== "");
        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const exportPeopleToExcel = (isMurid: boolean, data: any[], sekolah: string) => {
  const ts = getTimestamp("backup");
  const label = isMurid ? "Murid" : "Pegawai";
  const wsData: any[][] = [];

  if (isMurid) {
    wsData.push(["Nama Murid", "LP", "Kelas", "Rombel"]);
    data.forEach((item: Student) => wsData.push([item.nama, item.lp, item.kelas, item.rombel]));
  } else {
    wsData.push(["Nama Pegawai", "NIP", "Status Kepeg.", "Peran Utama", "Detail/Mapel Utama", "Kelas Utama", "Tugas Tambahan", "Detail/Mapel Tambahan", "Kelas Tambahan"]);
    data.forEach((item: Staff) => {
      const jab = item.jabatan;
      wsData.push([
        item.nama,
        item.nip || "-",
        item.status || "-",
        jab.primary.cat,
        jab.primary.sub || "-",
        jab.primary.kls.join(', ') || "-",
        jab.secondary.active ? jab.secondary.cat : "Tidak Ada",
        jab.secondary.active ? (jab.secondary.sub || "-") : "-",
        jab.secondary.active ? (jab.secondary.kls.join(', ') || "-") : "-"
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `Ekspor ${label} ${sekolah} ${ts}.xlsx`);
};

export const parsePeopleExcel = async (file: File, isMurid: boolean): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const rows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        
        const imported = rows.slice(1).map(r => {
          if (isMurid) {
            return { nama: String(r[0] || ""), lp: String(r[1] || ""), kelas: String(r[2] || ""), rombel: String(r[3] || "") };
          }
          
          const obj: any = {
            nama: String(r[0] || ""),
            nip: String(r[1] || ""),
            status: String(r[2] || ""),
            jabatan: {
              primary: {
                cat: r[3] || "Lainnya",
                sub: r[4] || "",
                kls: r[5] ? String(r[5]).split(',').map(k => k.trim()).filter(k => k !== "-" && k !== "") : []
              },
              secondary: {
                active: r[6] !== "Tidak Ada" && r[6] !== undefined && r[6] !== "",
                cat: r[6] || "Lainnya",
                sub: r[7] || "",
                kls: r[8] ? String(r[8]).split(',').map(k => k.trim()).filter(k => k !== "-" && k !== "") : []
              }
            }
          };
          return obj;
        }).filter(x => x.nama !== "");
        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
