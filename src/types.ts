export type Mode = 'pegawai' | 'murid';
export type SubModeMurid = 'kelas' | 'mapel';

export interface JabatanPart {
  cat: string;
  sub: string;
  kls: string[];
}

export interface Jabatan {
  primary: JabatanPart;
  secondary: JabatanPart & { active: boolean };
}

export interface Staff {
  nama: string;
  nip?: string;
  status?: string;
  tugas?: string;
  jabatan: Jabatan;
}

export interface Student {
  nama: string;
  lp: string;
  kelas: string;
  rombel: string;
}

export interface Holiday {
  month: number | string;
  date: string;
  desc: string;
}

export interface AppState {
  npsn: string;
  mode: Mode;
  subModeMurid: SubModeMurid;
  sekolah: string;
  bulan: number;
  tahun: number;
  kelas: string;
  rombel: string;
  kepsek: string;
  nip: string;
  wali: string;
  nipWali: string;
  kota: string;
  tglManual: string;
  namaMapel: string;
  semesterMapel: string;
  tahunAjaranMapel: string;
  meetingCount: number;
  staffData: Staff[];
  studentData: Student[];
  holidayData: Holiday[];
}

export const bNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const kelasOptions = ["I", "II", "III", "IV", "V", "VI"];
export const rombelOptions = ["Hanya Satu", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
