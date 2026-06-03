import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Topbar } from './components/Topbar';
import { PrintableSheet } from './components/PrintableSheet';
import { ModalSettings } from './components/ModalSettings';
import { ModalLibur } from './components/ModalLibur';
import { ModalDatabase } from './components/ModalDatabase';
import { bNames } from './types';

import { DialogProvider, useDialog } from './context/DialogContext';

const AppContent = () => {
  const ctx = useAppContext();
  const dialog = useDialog();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [dataTarget, setDataTarget] = useState<'pegawai' | 'murid'>('pegawai');
  
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);

  useEffect(() => {
    // Add print event listeners
    const handleAfterPrint = () => {
      setIsBulkPrinting(false);
    };
    
    const formatTimestamp = () => {
      const d = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())} ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
    };

    const handleBeforePrint = () => {
      const ts = formatTimestamp();
      const namaSekolah = ctx.sekolah || 'Sekolah';
      const bulan = bNames[ctx.bulan];
      const tahun = ctx.tahun;
      
      let title = '';
      
      if (ctx.mode === 'pegawai') {
        if (isBulkPrinting) {
           title = `Edi Brata Presensi Pegawai ${namaSekolah} ${tahun} Januari - Desember ${ts}`;
        } else {
           title = `Edi Brata Presensi Pegawai ${namaSekolah} ${tahun} ${bulan} ${ts}`;
        }
      } else {
        const mapel = ctx.subModeMurid === 'mapel' && ctx.namaMapel ? ` ${ctx.namaMapel}` : '';
        if (isBulkPrinting) {
           title = `Edi Brata Presensi Murid${mapel} ${namaSekolah} ${tahun} ${bulan} ${ts}`;
        } else {
           const kls = ctx.kelas ? ` Kelas ${ctx.kelas}` : '';
           const rmb = ctx.rombel && ctx.rombel !== 'Hanya Satu' ? ` ${ctx.rombel}` : '';
           title = `Edi Brata Presensi Murid${mapel} ${namaSekolah}${kls}${rmb} ${tahun} ${bulan} ${ts}`;
        }
      }
      
      document.title = title;
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [ctx, isBulkPrinting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const handleOpenModal = (id: string) => setActiveModal(id);
  const handleCloseModal = () => setActiveModal(null);
  
  const handleOpenDataModal = (target: 'pegawai' | 'murid') => {
    setDataTarget(target);
    setActiveModal('modalDatabase');
  };

  const handleBulkPrint = () => {
    const targets: any[] = [];
    if (ctx.mode === 'murid') {
      const seen = new Set();
      // Collect from students
      ctx.studentData.forEach(s => {
        if (s.kelas && s.rombel) {
          const key = `${s.kelas}|${s.rombel}`;
          if (!seen.has(key)) {
            seen.add(key);
            targets.push({ kelas: s.kelas, rombel: s.rombel });
          }
        }
      });
      // Collect from teachers
      ctx.staffData.forEach(staff => {
        const checkRole = (jab: any) => {
          if (jab?.cat === 'Guru Kelas' && Array.isArray(jab?.kls)) {
             jab.kls.forEach((k: string) => {
                if (k) {
                  const romb = jab.rombel || 'Hanya Satu';
                  const key = `${k}|${romb}`;
                  if (!seen.has(key)) {
                    seen.add(key);
                    targets.push({ kelas: k, rombel: romb });
                  }
                }
             });
          }
        };
        checkRole(staff.jabatan?.primary);
        if (staff.jabatan?.secondary?.active) checkRole(staff.jabatan?.secondary);
      });
    } else {
      for (let i = 0; i < 12; i++) targets.push({ bulan: i });
    }

    if (targets.length === 0) {
      dialog.showAlert(
        "Peringatan Cetak Massal",
        ctx.mode === 'murid' ? "Tidak ada data kelas/rombel yang valid di database untuk dicetak masal." : "Tidak ada target bulan untuk dicetak massal."
      );
      return;
    }

    setIsBulkPrinting(true);
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const renderBulkPages = () => {
    if (!isBulkPrinting) return null;
    
    const targets: any[] = [];
    if (ctx.mode === 'murid') {
      const seen = new Set();
      // Collect from students
      ctx.studentData.forEach(s => {
        if (s.kelas && s.rombel) {
          const key = `${s.kelas}|${s.rombel}`;
          if (!seen.has(key)) {
            seen.add(key);
            targets.push({ kelas: s.kelas, rombel: s.rombel });
          }
        }
      });
      // Collect from teachers
      ctx.staffData.forEach(staff => {
        const checkRole = (jab: any) => {
          if (jab?.cat === 'Guru Kelas' && Array.isArray(jab?.kls)) {
             jab.kls.forEach((k: string) => {
                if (k) {
                  const romb = jab.rombel || 'Hanya Satu';
                  const key = `${k}|${romb}`;
                  if (!seen.has(key)) {
                    seen.add(key);
                    targets.push({ kelas: k, rombel: romb });
                  }
                }
             });
          }
        };
        checkRole(staff.jabatan?.primary);
        if (staff.jabatan?.secondary?.active) checkRole(staff.jabatan?.secondary);
      });

      // Sort the targets primarily by Class, secondarily by Rombel
      const classOrder = { "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6 };
      targets.sort((a, b) => {
        const orderA = (classOrder as any)[a.kelas] || 99;
        const orderB = (classOrder as any)[b.kelas] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.rombel.localeCompare(b.rombel);
      });
    } else {
      for (let i = 0; i < 12; i++) targets.push({ bulan: i });
    }

    if (targets.length === 0) {
      setTimeout(() => setIsBulkPrinting(false), 10);
      return null;
    }

    return (
      <div id="bulkPrintContainer" style={{ display: 'block' }}>
        {targets.map((t, idx) => (
          <div key={idx} className="page-break">
            <PrintableSheet
              overrideBulan={t.bulan}
              overrideKelas={t.kelas}
              overrideRombel={t.rombel}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`p-4 ${isBulkPrinting ? 'is-bulk-printing' : ''}`}>
      <Topbar 
        onOpenModal={handleOpenModal} 
        onOpenDataModal={handleOpenDataModal} 
        onBulkPrint={handleBulkPrint}
      />
      
      {!isBulkPrinting && <PrintableSheet />}
      {renderBulkPages()}

      <AnimatePresence>
        {activeModal === 'modalSettings' && <ModalSettings key="modalSettings" isOpen={activeModal === 'modalSettings'} onClose={handleCloseModal} />}
        {activeModal === 'modalLibur' && <ModalLibur key="modalLibur" isOpen={activeModal === 'modalLibur'} onClose={handleCloseModal} />}
        {activeModal === 'modalDatabase' && <ModalDatabase key="modalDatabase" isOpen={activeModal === 'modalDatabase'} onClose={handleCloseModal} target={dataTarget} />}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <DialogProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </DialogProvider>
  );
}
