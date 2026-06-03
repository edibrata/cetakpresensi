import React, { useRef, useState, useEffect } from 'react';
import { X, Save, Upload, Download, Plus, Trash2, Calendar, User, Users, Book, CheckCircle, Search, Loader2, Cloud, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext, defaultState } from '../context/AppContext';
import { Staff, Student, Holiday, kelasOptions, rombelOptions, bNames } from '../types';
import { parseHolidaysExcel, exportHolidaysToExcel, exportPeopleToExcel, parsePeopleExcel } from '../utils/excel';
import { fetchNpsnData } from '../lib/firebase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalSettings: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const ctx = useAppContext();
  const [npsnInput, setNpsnInput] = useState(ctx.npsn);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'loading' | 'found' | 'new'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNpsnInput(ctx.npsn);
      setCloudStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen, ctx.npsn]);

  const handleCheckNPSN = async () => {
    if (!npsnInput.trim()) return;
    
    setCloudStatus('loading');
    setStatusMessage('Mencari data...');
    try {
      const result = await fetchNpsnData(npsnInput.trim());
      
      if (result.exists && result.data) {
        setCloudStatus('found');
        setStatusMessage('Data tersinkronisasi.');
        
        const d = result.data;
        const newState: any = { ...defaultState };
        newState.npsn = npsnInput.trim();
        
        if (d.sekolah !== undefined) newState.sekolah = d.sekolah;
        if (d.kota !== undefined) newState.kota = d.kota;
        if (d.kepsek !== undefined) newState.kepsek = d.kepsek;
        if (d.nip !== undefined) newState.nip = d.nip;
        if (d.wali !== undefined) newState.wali = d.wali;
        if (d.nipWali !== undefined) newState.nipWali = d.nipWali;
        if (d.tglManual !== undefined) newState.tglManual = d.tglManual;
        if (d.staffData !== undefined) newState.staffData = d.staffData;
        if (d.studentData !== undefined) newState.studentData = d.studentData;
        if (d.holidayData !== undefined) newState.holidayData = d.holidayData;
        if (d.mode !== undefined) newState.mode = d.mode;
        if (d.subModeMurid !== undefined) newState.subModeMurid = d.subModeMurid;
        if (d.bulan !== undefined) newState.bulan = d.bulan;
        if (d.tahun !== undefined) newState.tahun = d.tahun;
        if (d.kelas !== undefined) newState.kelas = d.kelas;
        if (d.rombel !== undefined) newState.rombel = d.rombel;
        if (d.namaMapel !== undefined) newState.namaMapel = d.namaMapel;
        if (d.tahunAjaranMapel !== undefined) newState.tahunAjaranMapel = d.tahunAjaranMapel;
        if (d.semesterMapel !== undefined) newState.semesterMapel = d.semesterMapel;
        if (d.meetingCount !== undefined) newState.meetingCount = d.meetingCount;
        
        ctx.restoreState(newState);
      } else {
        // Coba cari di local storage jika cloud tidak ada 
        const localKey = `absensi_f4_vSUPREME_FINAL_V12_LOCKED_FIXED_V4_MASTER_V_SUBMODE_V3_${npsnInput.trim()}`;
        const saved = localStorage.getItem(localKey);
        
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const nextState: any = { ...defaultState, ...parsed };
            nextState.npsn = npsnInput.trim();
            ctx.restoreState(nextState);
            
            setCloudStatus('found');
            setStatusMessage('Data lokal ditemukan (Offline).');
            return;
          } catch (err) {}
        }

        setCloudStatus('new');
        setStatusMessage('NPSN baru siap digunakan. Ruang kerja telah direset.');
        
        // Reset the workspace for a new NPSN, so the user doesn't accidentally save old data to the new NPSN
        ctx.restoreState({
          ...defaultState,
          npsn: npsnInput.trim()
        });
      }
    } catch (e) {
      // Offline / Error fallback
      const localKey = `absensi_f4_vSUPREME_FINAL_V12_LOCKED_FIXED_V4_MASTER_V_SUBMODE_V3_${npsnInput.trim()}`;
      const saved = localStorage.getItem(localKey);
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const nextState: any = { ...defaultState, ...parsed };
          nextState.npsn = npsnInput.trim();
          ctx.restoreState(nextState);
          setCloudStatus('found');
          setStatusMessage('Gagal ke server. Memuat rupa lokal.');
          return;
        } catch (err) {}
      }

      setCloudStatus('idle');
      setStatusMessage('Gagal menghubungi server.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.97, opacity: 0, y: 10 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-slate-50 rounded-xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col font-sans overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Pengaturan Identitas & Awan</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Konfigurasi data instansi dan sinkronisasi awan</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Cloud Sync */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5 border border-blue-100">
              <Cloud size={20} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Sinkronisasi Awan (Firestore)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Masukkan NPSN sekolah Anda. Jika data sudah ada di awan, sistem akan otomatis memuatnya. Jika belum, NPSN akan menjadi kunci baru untuk penyimpanan Anda.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={npsnInput} 
                    onChange={e => setNpsnInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleCheckNPSN()} 
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700" 
                    placeholder="Masukkan NPSN" 
                  />
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button 
                  onClick={handleCheckNPSN} 
                  disabled={cloudStatus === 'loading' || !npsnInput.trim()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-blue-700/50"
                >
                  {cloudStatus === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  <span className="hidden sm:inline">Cek Data</span>
                </button>
              </div>
              {statusMessage && (
                <p className={`text-xs font-medium flex items-center gap-1.5 ${cloudStatus === 'found' ? 'text-emerald-600' : cloudStatus === 'new' ? 'text-blue-600' : 'text-slate-600'}`}>
                  {cloudStatus === 'found' && <CheckCircle size={14} />}
                  {statusMessage}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Institusi */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-1 flex items-center gap-2">
                <Book size={15} className="text-slate-400" /> Data Institusi
              </h4>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-500">Nama Satuan Pendidikan</label>
                <input type="text" value={ctx.sekolah} onChange={e => ctx.setField('sekolah', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="SDN PERDANA 1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-500">Kota / Lokasi</label>
                  <input type="text" value={ctx.kota} onChange={e => ctx.setField('kota', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Jakarta" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-500">Tanggal Cetak</label>
                  <input type="text" value={ctx.tglManual} onChange={e => ctx.setField('tglManual', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Contoh: 31 Jan 2024" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Kepala Sekolah */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-1 flex items-center gap-2">
                  <User size={15} className="text-slate-400" /> Kepala Sekolah
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-500">Nama Lengkap & Gelar</label>
                    <input type="text" value={ctx.kepsek} onChange={e => ctx.setField('kepsek', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Nama Kepala Sekolah" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-500">NIP</label>
                    <input type="text" value={ctx.nip} onChange={e => ctx.setField('nip', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="198001012010011001" />
                  </div>
                </div>
              </div>

              {/* Wali Kelas */}
              {ctx.mode === 'murid' && (
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
                  <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-1 flex items-center gap-2">
                    <Users size={15} className="text-slate-400" /> Guru / Wali Kelas
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-medium text-slate-500">Nama Lengkap & Gelar</label>
                      <input type="text" value={ctx.wali} onChange={e => ctx.setField('wali', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Nama Guru" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-medium text-slate-500">NIP</label>
                      <input type="text" value={ctx.nipWali} onChange={e => ctx.setField('nipWali', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="199001012015011001" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-white flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm">
            <Save size={15} /> Simpan Info
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
