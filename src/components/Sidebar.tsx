import React, { useRef, useState } from 'react';
import { Settings, Calendar as CalendarIcon, Users, Download, Upload, Printer, List, CheckCircle2, IdCard, GraduationCap, Files, Landmark, ChevronDown, ShieldCheck, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onBulkPrint: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onBulkPrint }) => {
  const ctx = useAppContext();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [expandedMenu, setExpandedMenu] = useState<string>('cetak');

  const handleBackup = () => {
    const data = ctx.getBackupData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0, 10);
    const sekolah = ctx.sekolah || 'Sekolah';
    a.download = `Backup DH ${sekolah} ${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        ctx.restoreState(data);
      } catch (err) {
        alert("File backup tidak valid!");
      }
    };
    reader.readAsText(file);
    if (restoreInputRef.current) restoreInputRef.current.value = '';
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col no-print z-10 flex-shrink-0">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <Settings size={18} />
        </div>
        <div>
          <h2 className="font-bold text-slate-700 text-sm">Dashboard</h2>
          <p className="text-[10px] text-slate-500">Aplikasi Absensi</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">
        
        {/* Cetak Berkas */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button onClick={() => setExpandedMenu(expandedMenu === 'cetak' ? '' : 'cetak')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
              <FileText size={16} className="text-blue-500" />
              <span>Cetak Berkas</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${expandedMenu === 'cetak' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedMenu === 'cetak' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-2 space-y-1 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setActiveView('cetak')} className={`w-full flex items-center gap-3 text-sm p-2.5 rounded-lg transition-colors border ${activeView === 'cetak' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'text-slate-600 hover:bg-blue-50/50 border-transparent'} group`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${activeView === 'cetak' ? 'bg-blue-100' : 'bg-white shadow-sm'}`}>
                  <Printer size={14} /> 
                </div>
                <span className="font-medium">Pratinjau Cetak</span>
              </button>
              
              <button onClick={() => window.print()} className="w-full flex items-center gap-3 text-sm p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border border-transparent group">
                <div className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center transition-colors">
                  <Printer size={14} className="text-slate-500" /> 
                </div>
                <span className="font-medium">Cetak (F4)</span>
              </button>

              <button onClick={onBulkPrint} className="w-full flex items-center gap-3 text-sm p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border border-transparent group">
                <div className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center transition-colors">
                  <Files size={14} className="text-slate-500" /> 
                </div>
                <span className="font-medium">Cetak Massal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Konfigurasi */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button onClick={() => setExpandedMenu(expandedMenu === 'konfigurasi' ? '' : 'konfigurasi')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
              <Landmark size={16} className="text-orange-500" />
              <span>Konfigurasi Utama</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${expandedMenu === 'konfigurasi' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedMenu === 'konfigurasi' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-2 space-y-1 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setActiveView('identitas')} className={`w-full flex items-center gap-3 text-sm p-2.5 rounded-lg transition-colors border ${activeView === 'identitas' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'text-slate-600 hover:bg-orange-50/50 border-transparent'} group`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${activeView === 'identitas' ? 'bg-orange-100' : 'bg-white shadow-sm'}`}>
                  <Landmark size={14} /> 
                </div>
                <span className="font-medium">Identitas Sekolah</span>
              </button>
              
              <button onClick={() => setActiveView('libur')} className={`w-full flex items-center gap-3 text-sm p-2.5 rounded-lg transition-colors border ${activeView === 'libur' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'text-slate-600 hover:bg-orange-50/50 border-transparent'} group`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${activeView === 'libur' ? 'bg-orange-100' : 'bg-white shadow-sm'}`}>
                  <CalendarIcon size={14} /> 
                </div>
                <span className="font-medium">Hari Libur Sekolah</span>
              </button>
            </div>
          </div>
        </div>

        {/* Master Data */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button onClick={() => setExpandedMenu(expandedMenu === 'data' ? '' : 'data')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
              <Users size={16} className="text-emerald-500" />
              <span>Basis Data</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${expandedMenu === 'data' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedMenu === 'data' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-2 space-y-1 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setActiveView('pegawai')} className={`w-full flex items-center gap-3 text-sm p-2.5 rounded-lg transition-colors border ${activeView === 'pegawai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'text-slate-600 hover:bg-emerald-50/50 border-transparent'} group`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${activeView === 'pegawai' ? 'bg-emerald-100' : 'bg-white shadow-sm'}`}>
                  <IdCard size={14} /> 
                </div>
                <span className="font-medium">Data Pegawai</span>
              </button>

              <button onClick={() => setActiveView('murid')} className={`w-full flex items-center gap-3 text-sm p-2.5 rounded-lg transition-colors border ${activeView === 'murid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'text-slate-600 hover:bg-emerald-50/50 border-transparent'} group`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${activeView === 'murid' ? 'bg-emerald-100' : 'bg-white shadow-sm'}`}>
                  <GraduationCap size={14} /> 
                </div>
                <span className="font-medium">Data Murid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pemeliharaan Sistem */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button onClick={() => setExpandedMenu(expandedMenu === 'backup' ? '' : 'backup')} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
              <ShieldCheck size={16} className="text-purple-500" />
              <span>Pemeliharaan</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${expandedMenu === 'backup' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedMenu === 'backup' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-2 space-y-1 border-t border-slate-100 bg-slate-50/50">
              <button onClick={handleBackup} className="w-full flex items-center gap-3 text-sm p-2.5 rounded-lg text-slate-600 hover:bg-purple-50/50 transition-colors border border-transparent group">
                <div className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center transition-colors">
                  <Download size={14} className="text-purple-500" /> 
                </div>
                <span className="font-medium">Backup Data (.json)</span>
              </button>

              <button onClick={() => restoreInputRef.current?.click()} className="w-full flex items-center gap-3 text-sm p-2.5 rounded-lg text-slate-600 hover:bg-purple-50/50 transition-colors border border-transparent group">
                <div className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center transition-colors">
                  <Upload size={14} className="text-purple-500" /> 
                </div>
                <span className="font-medium">Restore Data (.json)</span>
              </button>
              <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestore} />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
