import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { PrintableSheet } from './components/PrintableSheet';
import { ModalSettings } from './components/ModalSettings';
import { ModalLibur } from './components/ModalLibur';
import { ModalDatabase } from './components/ModalDatabase';

const AppContent = () => {
  const ctx = useAppContext();
  
  const [activeView, setActiveView] = useState<string>('cetak');
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsBulkPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleBulkPrint = () => {
    setIsBulkPrinting(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const renderBulkPages = () => {
    if (!isBulkPrinting) return null;
    
    const targets: any[] = [];
    if (ctx.mode === 'murid') {
      const seen = new Set();
      ctx.studentData.forEach(s => {
        if (s.kelas && s.rombel) {
          const key = `${s.kelas}|${s.rombel}`;
          if (!seen.has(key)) {
            seen.add(key);
            targets.push({ kelas: s.kelas, rombel: s.rombel });
          }
        }
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
    <div className={`flex h-screen bg-slate-100 overflow-hidden ${isBulkPrinting ? 'is-bulk-printing' : ''}`}>
      {!isBulkPrinting && (
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onBulkPrint={handleBulkPrint} 
        />
      )}
      
      <div className="flex-1 overflow-auto flex flex-col items-center">
        {!isBulkPrinting && activeView === 'cetak' && (
          <div className="w-full p-4 pb-0 max-w-[1600px] flex-shrink-0">
            <Topbar onBulkPrint={handleBulkPrint} />
          </div>
        )}

        <div className="flex-1 w-full overflow-y-auto p-4 flex justify-center custom-scrollbar">
          {!isBulkPrinting && activeView === 'cetak' && <PrintableSheet />}
          {!isBulkPrinting && activeView === 'identitas' && <ModalSettings inline />}
          {!isBulkPrinting && activeView === 'libur' && <ModalLibur inline />}
          {!isBulkPrinting && activeView === 'pegawai' && <ModalDatabase target="pegawai" inline />}
          {!isBulkPrinting && activeView === 'murid' && <ModalDatabase target="murid" inline />}
        </div>
        
        {renderBulkPages()}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
