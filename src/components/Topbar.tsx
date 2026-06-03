import React from 'react';
import { Settings, Calendar as CalendarIcon, Users, User, Download, Upload, Printer, List, CheckCircle2, IdCard, GraduationCap, Files, Landmark, ChevronDown, X, Database, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MapelInput } from './MapelInput';
import { bNames, kelasOptions, rombelOptions } from '../types';
import { Tooltip } from './Tooltip';

interface TopbarProps {
  onBulkPrint: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onBulkPrint }) => {
  const ctx = useAppContext();
  
  const isMurid = ctx.mode === 'murid';
  const isMapel = isMurid && ctx.subModeMurid === 'mapel';

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
    <div className="no-print mx-auto mb-6">
      <div className="bg-white p-3 pb-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3 overflow-x-auto custom-scrollbar">
        
        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 items-center flex-shrink-0">
          <Tooltip content="Absensi Pegawai">
            <button 
              onClick={() => ctx.setMode('pegawai')} 
              className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center h-8 ${!isMurid ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-200/50 border border-transparent'}`}>
              <IdCard size={16} className={!isMurid ? "text-blue-600" : "text-slate-500"} />
            </button>
          </Tooltip>
          <Tooltip content="Absensi Murid">
            <button 
              onClick={() => ctx.setMode('murid')} 
              className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center h-8 ${isMurid ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-200/50 border border-transparent'}`}>
              <GraduationCap size={16} className={isMurid ? "text-blue-600" : "text-slate-500"} />
            </button>
          </Tooltip>
        </div>

        {/* Dynamic Items Based on Mode */}
        {isMurid && (
          <>
            <div className="h-6 w-px bg-slate-200 flex-shrink-0 mx-1"></div>
            
            <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
              <List size={14} className="text-slate-400" />
              <select value={ctx.subModeMurid} onChange={(e) => ctx.setSubModeMurid(e.target.value as any)} className="outline-none text-xs font-medium bg-transparent text-slate-700">
                <option value="kelas">Gr. Kelas</option>
                <option value="mapel">Gr. Mapel</option>
              </select>
            </div>

            <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
              <User size={14} className="text-slate-400" />
              <select value={ctx.kelas} onChange={(e) => ctx.setField('kelas', e.target.value)} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-16">
                <option value="">Kelas</option>
                {kelasOptions.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
              <Users size={14} className="text-slate-400" />
              <select value={ctx.rombel} onChange={(e) => ctx.setField('rombel', e.target.value)} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-20">
                <option value="">Rombel</option>
                {rombelOptions.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </>
        )}

        {isMapel && (
          <>
            <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Smt:</span>
              <select value={ctx.semesterMapel} onChange={(e) => ctx.setField('semesterMapel', e.target.value)} className="outline-none text-xs font-medium bg-transparent text-slate-700">
                <option value="I (Ganjil)">I</option>
                <option value="II (Genap)">II</option>
              </select>
            </div>

            <div className="flex flex-row items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 w-36 hover:border-slate-300 transition-colors">
              <MapelInput 
                value={ctx.namaMapel} 
                onChange={(val) => ctx.setField('namaMapel', val)} 
                options={mapelOptions}
                className="outline-none text-xs font-medium bg-transparent text-slate-700 w-full"
                placeholder="Nama Mapel"
              />
            </div>

            <div className="flex flex-row items-center justify-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 shadow-sm flex-shrink-0 hover:border-slate-300 transition-colors">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Pert:</span>
              <input type="number" value={ctx.meetingCount} onChange={(e) => ctx.setField('meetingCount', Number(e.target.value))} className="outline-none text-xs font-medium bg-transparent text-slate-700 w-8 text-center" />
            </div>
          </>
        )}

        <div className="flex-grow"></div>

        <div className="flex flex-row gap-2 flex-shrink-0">
          <Tooltip content="Cetak F4">
            <button onClick={() => window.print()} className="flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white transition-all hover:bg-blue-600 active:bg-blue-700 active:scale-95 border-none shadow-sm gap-2">
              <Printer size={14} /> <span className="hidden sm:inline">Cetak</span>
            </button>
          </Tooltip>
          
          <Tooltip content="Cetak Massal">
            <button onClick={onBulkPrint} className="flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium border border-blue-500 text-blue-600 bg-blue-50 transition-all hover:bg-blue-100 active:bg-blue-200 active:scale-95 shadow-sm">
              <Files size={14} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};


