import React, { useRef, useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, User, Download, Upload, Printer, List, IdCard, GraduationCap, Files, Landmark, Settings, CalendarDays, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MapelInput } from './MapelInput';
import { bNames, kelasOptions, rombelOptions } from '../types';
import { getTimestamp } from '../utils/excel';
import { Tooltip } from './Tooltip';

interface TopbarProps {
  onOpenModal: (id: string) => void;
  onOpenDataModal: (target: 'pegawai' | 'murid') => void;
  onBulkPrint: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenModal, onOpenDataModal, onBulkPrint }) => {
  const ctx = useAppContext();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  
  // Tab state limits toolbar options dynamically
  const [activeTab, setActiveTab] = useState<'pengaturan' | 'pegawai' | 'murid'>(
    ctx.mode as any || 'pegawai'
  );

  useEffect(() => {
    if (ctx.mode !== activeTab && (ctx.mode === 'pegawai' || ctx.mode === 'murid') && activeTab !== 'pengaturan') {
      setActiveTab(ctx.mode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.mode]);

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        ctx.restoreState({ ...data, npsn: ctx.npsn });
      } catch (err) {
        alert("File backup tidak valid!");
      }
    };
    reader.readAsText(file);
    // reset input
    if (restoreInputRef.current) restoreInputRef.current.value = '';
  };

  const handleBackup = () => {
    const data = localStorage.getItem('absensi_f4_vSUPREME_FINAL_V12_LOCKED_FIXED_V4_MASTER_V_SUBMODE_V3');
    if (!data) return;
    const sekolah = ctx.sekolah || "Sekolah";
    const ts = getTimestamp("backup");
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup DH ${sekolah} ${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isMapel = activeTab === 'murid' && ctx.subModeMurid === 'mapel';

  const mapelOptionsSet = new Set<string>();
  ctx.staffData.forEach(staff => {
    if (staff.jabatan?.primary?.cat === 'Guru Mapel' && staff.jabatan?.primary?.sub) {
      if (staff.jabatan.primary.sub !== 'Lainnya') mapelOptionsSet.add(staff.jabatan.primary.sub);
    }
    if (staff.jabatan?.secondary?.active && staff.jabatan?.secondary?.cat === 'Guru Mapel' && staff.jabatan?.secondary?.sub) {
      if (staff.jabatan.secondary.sub !== 'Lainnya') mapelOptionsSet.add(staff.jabatan.secondary.sub);
    }
  });
  const mapelOptions = Array.from(mapelOptionsSet).sort();

  return (
    <div className="no-print max-w-[1600px] mx-auto mb-6">
      {/* Hidden file input for restore action */}
      <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestore} />

      <div className="bg-white p-3 pb-2 rounded-lg shadow-sm border border-slate-200 flex flex-wrap md:flex-nowrap items-center gap-3">
        
        {/* Main Menu Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 items-center flex-shrink-0">
          <Tooltip content="Menu Pengaturan">
            <button 
              onClick={() => setActiveTab('pengaturan')} 
              className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center h-8 ${activeTab === 'pengaturan' ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-200/50 border border-transparent'}`}>
              <Settings size={16} className={activeTab === 'pengaturan' ? "text-blue-600" : "text-slate-500"} />
            </button>
          </Tooltip>
          <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
          <Tooltip content="Menu Pegawai">
            <button 
              onClick={() => { setActiveTab('pegawai'); ctx.setMode('pegawai'); }} 
              className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center h-8 ${activeTab === 'pegawai' ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-200/50 border border-transparent'}`}>
              <IdCard size={16} className={activeTab === 'pegawai' ? "text-blue-600" : "text-slate-500"} />
            </button>
          </Tooltip>
          <Tooltip content="Menu Murid">
            <button 
              onClick={() => { setActiveTab('murid'); ctx.setMode('murid'); }} 
              className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center h-8 ${activeTab === 'murid' ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-200/50 border border-transparent'}`}>
              <GraduationCap size={16} className={activeTab === 'murid' ? "text-blue-600" : "text-slate-500"} />
            </button>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-slate-200 flex-shrink-0 mx-1"></div>

        {/* --- PENGATURAN SUB-MENU --- */}
        {activeTab === 'pengaturan' && (
          <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-2 flex-1 animate-fade-in">
            <Tooltip content="Identitas Sekolah">
              <button onClick={() => onOpenModal('modalSettings')} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                <Landmark size={14} className="text-blue-600" />
              </button>
            </Tooltip>
            <Tooltip content="Data Pegawai">
              <button onClick={() => onOpenDataModal('pegawai')} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                <Users size={14} className="text-emerald-600" />
              </button>
            </Tooltip>
            <Tooltip content="Data Murid">
              <button onClick={() => onOpenDataModal('murid')} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                <User size={14} className="text-indigo-600" />
              </button>
            </Tooltip>

            {/* Global Date Options */}
            <Tooltip content="Tahun Ajaran">
              <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors ml-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">TA:</span>
                <input type="text" value={ctx.tahunAjaranMapel} onChange={(e) => ctx.setField('tahunAjaranMapel', e.target.value)} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-20" placeholder="2024/2025" />
              </div>
            </Tooltip>

            <Tooltip content="Tahun & Bulan">
              <div className="flex flex-row items-center gap-2 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
                <CalendarIcon size={14} className="text-slate-400" />
                <input type="number" value={ctx.tahun} onChange={(e) => ctx.setField('tahun', Number(e.target.value))} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-12" />
                <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                <select value={ctx.bulan} onChange={(e) => ctx.setField('bulan', Number(e.target.value))} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-[85px]">
                  {bNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
              </div>
            </Tooltip>

            <Tooltip content="Hari Libur">
              <button onClick={() => onOpenModal('modalLibur')} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm ml-1">
                <CalendarDays size={14} className="text-orange-500" />
              </button>
            </Tooltip>

            <div className="flex-grow"></div>

            <div className="flex flex-row gap-2 flex-shrink-0">
              <Tooltip content="Backup Data">
                <button onClick={handleBackup} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                  <Download size={14} className="text-slate-500" />
                </button>
              </Tooltip>
              <Tooltip content="Restore Data">
                <button onClick={() => restoreInputRef.current?.click()} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                  <Upload size={14} className="text-slate-500" />
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* --- PEGAWAI SUB-MENU --- */}
        {activeTab === 'pegawai' && (
          <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-2 flex-1 animate-fade-in justify-between">
            <div className="flex items-center gap-2">
               <span className="text-xs font-medium text-slate-500 mr-2">Mode Pegawai Aktif</span>
            </div>
            
            <div className="flex flex-row gap-2 flex-shrink-0 items-center">
              <Tooltip content="Backup Data">
                <button onClick={handleBackup} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                  <Download size={14} className="text-slate-500" />
                </button>
              </Tooltip>
              <Tooltip content="Restore Data">
                <button onClick={() => restoreInputRef.current?.click()} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                  <Upload size={14} className="text-slate-500" />
                </button>
              </Tooltip>
              
              <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

              <Tooltip content="Cetak F4">
                <button onClick={() => window.print()} className="flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white transition-all hover:bg-blue-600 active:bg-blue-700 active:scale-95 border-none shadow-sm">
                  <Printer size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Cetak Massal">
                <button onClick={onBulkPrint} className="flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white transition-all hover:bg-blue-600 active:bg-blue-700 active:scale-95 border-none shadow-sm">
                  <Files size={16} />
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* --- MURID SUB-MENU --- */}
        {activeTab === 'murid' && (
          <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-2 flex-1 animate-fade-in">
            <Tooltip content="Pilih Jenis Guru">
              <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
                <List size={14} className="text-slate-400" />
                <select value={ctx.subModeMurid} onChange={(e) => ctx.setSubModeMurid(e.target.value as any)} className="outline-none text-xs font-medium bg-transparent text-slate-700">
                  <option value="kelas">Gr. Kelas</option>
                  <option value="mapel">Gr. Mapel</option>
                </select>
              </div>
            </Tooltip>

            {isMapel && (
              <Tooltip content="Pilih Mapel">
                <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 w-36 hover:border-slate-300 transition-colors">
                  <BookOpen size={14} className="text-slate-400" />
                  <MapelInput 
                    value={ctx.namaMapel} 
                    onChange={(val) => ctx.setField('namaMapel', val)} 
                    options={mapelOptions}
                    className="outline-none text-xs font-medium bg-transparent text-slate-700 w-full ml-1"
                    placeholder="Nama Mapel"
                  />
                </div>
              </Tooltip>
            )}

            <Tooltip content="Pilih Kelas">
              <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
                <User size={14} className="text-slate-400" />
                <select value={ctx.kelas} onChange={(e) => ctx.setField('kelas', e.target.value)} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-16">
                  <option value="">Kelas</option>
                  {kelasOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </Tooltip>

            <Tooltip content="Pilih Rombel">
              <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
                <Users size={14} className="text-slate-400" />
                <select value={ctx.rombel} onChange={(e) => ctx.setField('rombel', e.target.value)} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-20">
                  <option value="">Rombel</option>
                  {rombelOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </Tooltip>

            {isMapel && (
              <>
                <Tooltip content="Pilih Semester">
                  <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Smt:</span>
                    <select value={ctx.semesterMapel} onChange={(e) => ctx.setField('semesterMapel', e.target.value)} className="outline-none text-xs font-medium bg-transparent text-slate-700">
                      <option value="I (Ganjil)">I</option>
                      <option value="II (Genap)">II</option>
                    </select>
                  </div>
                </Tooltip>

                <Tooltip content="Jumlah Pertemuan">
                  <div className="flex flex-row items-center justify-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Pert:</span>
                    <input type="number" value={ctx.meetingCount} onChange={(e) => ctx.setField('meetingCount', Number(e.target.value))} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-12 text-center" />
                  </div>
                </Tooltip>
              </>
            )}

            <div className="flex-grow"></div>

            <div className="flex flex-row gap-2 flex-shrink-0 items-center">
              <Tooltip content="Backup Data">
                <button onClick={handleBackup} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                  <Download size={14} className="text-slate-500" />
                </button>
              </Tooltip>
              <Tooltip content="Restore Data">
                <button onClick={() => restoreInputRef.current?.click()} className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
                  <Upload size={14} className="text-slate-500" />
                </button>
              </Tooltip>
              
              <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

              <Tooltip content="Cetak F4">
                <button onClick={() => window.print()} className="flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white transition-all hover:bg-blue-600 active:bg-blue-700 active:scale-95 border-none shadow-sm">
                  <Printer size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Cetak Massal">
                <button onClick={onBulkPrint} className="flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white transition-all hover:bg-blue-600 active:bg-blue-700 active:scale-95 border-none shadow-sm">
                  <Files size={16} />
                </button>
              </Tooltip>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Topbar;


