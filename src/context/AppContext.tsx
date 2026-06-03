import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { AppState, Holiday, Staff, Student, Mode, SubModeMurid } from '../types';
import { parseJabatan } from '../utils/helpers';
import { saveNpsnData } from '../lib/firebase';

const STORAGE_KEY = 'absensi_f4_vSUPREME_FINAL_V12_LOCKED_FIXED_V4_MASTER_V_SUBMODE_V3';

export const defaultState: AppState = {
  npsn: '',
  mode: 'pegawai',
  subModeMurid: 'kelas',
  sekolah: 'SDN PERDANA 1',
  bulan: new Date().getMonth(),
  tahun: new Date().getFullYear(),
  kelas: '',
  rombel: '',
  kepsek: '',
  nip: '',
  wali: '',
  nipWali: '',
  kota: 'Perdana',
  tglManual: '',
  namaMapel: '',
  semesterMapel: 'I (Ganjil)',
  tahunAjaranMapel: '2024/2025',
  meetingCount: 12,
  staffData: [],
  studentData: [],
  holidayData: []
};

interface AppContextType extends AppState {
  setMode: (val: Mode) => void;
  setSubModeMurid: (val: SubModeMurid) => void;
  setField: (field: keyof AppState, value: any) => void;
  updateStaffData: (data: Staff[]) => void;
  updateStudentData: (data: Student[]) => void;
  updateHolidayData: (data: Holiday[]) => void;
  restoreState: (state: AppState) => void;
  syncPejabatData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.staffData = parsed.staffData?.map((item: any) => {
          if (!item.jabatan && item.tugas) {
            item.jabatan = parseJabatan(item.tugas);
          }
          return item;
        }) || [];
        setState({ ...defaultState, ...parsed });
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoaded) {
      // Save globally
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      
      // Save specifically for this NPSN (offline support)
      if (state.npsn && state.npsn.trim() !== '') {
        localStorage.setItem(`${STORAGE_KEY}_${state.npsn.trim()}`, JSON.stringify(state));
      }
      
      // Auto save to Firestore if NPSN is provided
      if (state.npsn && state.npsn.trim() !== '') {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const { npsn, ...stateToSave } = state;
          saveNpsnData(state.npsn.trim(), stateToSave).catch(err => console.error("Cloud sync failed:", err));
        }, 1500); // 1.5s debounce
      }
    }
  }, [state, isLoaded]);

  const syncPejabatData = () => {
    let foundKepsek: { nama: string; nip: string } | null = null;
    let foundWali: { nama: string; nip: string } | null = null;
    
    const listKepsek = state.staffData.filter((s: Staff) => {
      const p = s.jabatan.primary;
      const sec = s.jabatan.secondary;
      return (p.cat === 'Kepsek' || (sec.active && sec.cat === 'Kepsek'));
    });
    
    const listPlt = state.staffData.filter((s: Staff) => {
      const p = s.jabatan.primary;
      const sec = s.jabatan.secondary;
      return (p.cat === 'Plt. Kepsek' || (sec.active && sec.cat === 'Plt. Kepsek'));
    });
    
    const topKepsek = listKepsek[0] || listPlt[0];
    if (topKepsek) foundKepsek = { nama: topKepsek.nama, nip: topKepsek.nip || "" };

    if (state.mode === 'murid') {
      const selectedMapel = (state.namaMapel || "").toLowerCase();
      
      if (state.subModeMurid === 'mapel' && selectedMapel) {
        let guruMapel = state.staffData.find((s: Staff) => {
          const tugasStr = (s.tugas || "").toLowerCase();
          return tugasStr.includes("guru mapel") && tugasStr.includes(selectedMapel);
        });
        if (guruMapel) foundWali = { nama: guruMapel.nama, nip: guruMapel.nip || "" };
      } else if (state.kelas) {
        let wali = state.staffData.find((s: Staff) => {
          const p = s.jabatan.primary;
          const sec = s.jabatan.secondary;
          return (p.cat === 'Guru Kelas' && p.kls.includes(state.kelas)) || 
                 (sec.active && sec.cat === 'Guru Kelas' && sec.kls.includes(state.kelas));
        });
        if (wali) foundWali = { nama: wali.nama, nip: wali.nip || "" };
      }
    }

    setState(prev => {
      const next = { ...prev };
      if (foundKepsek) {
        next.kepsek = foundKepsek.nama;
        next.nip = foundKepsek.nip;
      }
      if (foundWali) {
        next.wali = foundWali.nama;
        next.nipWali = foundWali.nip;
      }
      return next;
    });
  };

  const setField = (field: keyof AppState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const setMode = (val: Mode) => {
    setState(prev => {
      const next = { ...prev, mode: val };
      return next;
    });
    // We defer syncPejabatData to a useEffect tracking mode, or call it after setting.
  };

  const setSubModeMurid = (val: SubModeMurid) => setState(prev => ({ ...prev, subModeMurid: val }));
  const updateStaffData = (data: Staff[]) => setState(prev => ({ ...prev, staffData: data }));
  const updateStudentData = (data: Student[]) => setState(prev => ({ ...prev, studentData: data }));
  const updateHolidayData = (data: Holiday[]) => setState(prev => ({ ...prev, holidayData: data }));
  const restoreState = (newState: AppState) => setState(newState);

  useEffect(() => {
    if (isLoaded) {
      syncPejabatData();
    }
  }, [
    state.mode, state.subModeMurid, state.kelas, state.namaMapel, state.staffData
  ]);

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{
      ...state,
      setMode,
      setSubModeMurid,
      setField,
      updateStaffData,
      updateStudentData,
      updateHolidayData,
      restoreState,
      syncPejabatData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
