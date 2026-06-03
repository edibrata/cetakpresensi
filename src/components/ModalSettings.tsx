import React, { useRef, useState, useEffect } from 'react';
import { X, Save, Upload, Download, Plus, Trash2, Calendar, User, Users, Book, CheckCircle, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
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
      ctx.setField('npsn', npsnInput.trim());
      
      if (result.exists && result.data) {
        setCloudStatus('found');
        setStatusMessage('Data ditemukan! Memuat data...');
        
        const d = result.data;
        if (d.sekolah) ctx.setField('sekolah', d.sekolah);
        if (d.kota) ctx.setField('kota', d.kota);
        if (d.kepsek) ctx.setField('kepsek', d.kepsek);
        if (d.nip) ctx.setField('nip', d.nip);
        if (d.wali) ctx.setField('wali', d.wali);
        if (d.nipWali) ctx.setField('nipWali', d.nipWali);
        if (d.tglManual) ctx.setField('tglManual', d.tglManual);
        if (d.staffData) ctx.updateStaffData(d.staffData);
        if (d.studentData) ctx.updateStudentData(d.studentData);
        if (d.holidayData) ctx.updateHolidayData(d.holidayData);
        
      } else {
        setCloudStatus('new');
        setStatusMessage('NPSN baru, siap digunakan untuk penyimpanan awan.');
      }
    } catch (e) {
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
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg border border-slate-200 shadow-sm w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col font-sans text-slate-800" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-800">Pengaturan Identitas & Awan</h3>
            <p className="text-slate-500 text-xs mt-1 font-normal">Konfigurasi NPSN, Nama Sekolah dan Pejabat Penandatangan</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md transition-all text-slate-500 active:scale-95">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto bg-white">
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex flex-col gap-3 transition-colors hover:border-blue-200">
            <div className="flex gap-2 items-center">
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] font-semibold text-blue-800 uppercase ml-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
                <div className="flex gap-2">
                  <input type="text" value={npsnInput} onChange={e => setNpsnInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckNPSN()} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-blue-200 p-2.5 rounded-md text-sm bg-white" placeholder="Masukkan NPSN untuk sinkronisasi awan" />
                  <button onClick={handleCheckNPSN} disabled={cloudStatus === 'loading' || !npsnInput.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:active:scale-100">
                    {cloudStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Cek NPSN
                  </button>
                </div>
              </div>
            </div>
            {statusMessage && (
              <div className={`text-xs font-medium flex items-center gap-1.5 ${cloudStatus === 'found' ? 'text-emerald-600' : cloudStatus === 'new' ? 'text-blue-600' : 'text-slate-600'}`}>
                {cloudStatus === 'found' && <CheckCircle size={14} />}
                {statusMessage}
              </div>
            )}
            <p className="text-[10px] text-blue-600/70 leading-relaxed max-w-2xl">
              NPSN akan menjadi Anchor (kunci utama) penyimpanan awan Anda di Firebase Firestore. Saat Anda menginput NPSN yang sudah pernah tersimpan, data master (Sekolah, Pegawai, Murid, Hari Libur) akan otomatis dimuat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md"><Book size={18} /></div>
                <span className="font-semibold text-slate-800 text-sm tracking-wide">Data Sekolah & Dokumen</span>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase ml-1">Nama Satuan Pendidikan</label>
                <input type="text" value={ctx.sekolah} onChange={e => ctx.setField('sekolah', e.target.value)} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-200 p-2.5 rounded-md text-sm bg-white" placeholder="SDN PERDANA 1" />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase ml-1">Kota/Lokasi TTD</label>
                <input type="text" value={ctx.kota} onChange={e => ctx.setField('kota', e.target.value)} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-200 p-2.5 rounded-md text-sm bg-white" placeholder="Jakarta" />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase ml-1">Tanggal Dokumen (Teks Saja)</label>
                <input type="text" value={ctx.tglManual} onChange={e => ctx.setField('tglManual', e.target.value)} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-200 p-2.5 rounded-md text-sm bg-white" placeholder="Contoh: 31 Januari 2024" />
                <p className="text-[11px] text-slate-400 mt-1 italic">* Lokasi akan ditambahkan otomatis dari isian "Kota/Lokasi TTD".</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md"><User size={18} /></div>
                <span className="font-semibold text-slate-800 text-sm tracking-wide">Kepala Sekolah (Auto/Editable)</span>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase ml-1">Nama Lengkap & Gelar</label>
                <input type="text" value={ctx.kepsek} onChange={e => ctx.setField('kepsek', e.target.value)} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-200 p-2.5 rounded-md text-sm bg-white" placeholder="Nama Kepala Sekolah" />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase ml-1">NIP Kepala Sekolah</label>
                <input type="text" value={ctx.nip} onChange={e => ctx.setField('nip', e.target.value)} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-200 p-2.5 rounded-md text-sm bg-white" placeholder="NIP" />
              </div>
            </div>
          </div>
          {ctx.mode === 'murid' && (
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white text-slate-600 border border-slate-200 rounded-md"><Users size={18} /></div>
                <span className="font-semibold text-slate-800 text-sm tracking-wide">Guru / Wali Kelas (Auto/Editable)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase ml-1">Nama Guru/Wali Kelas</label>
                  <input type="text" value={ctx.wali} onChange={e => ctx.setField('wali', e.target.value)} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-200 p-2.5 rounded-md text-sm bg-white" placeholder="Nama Guru" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase ml-1">NIP Guru/Wali Kelas</label>
                  <input type="text" value={ctx.nipWali} onChange={e => ctx.setField('nipWali', e.target.value)} className="w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-200 p-2.5 rounded-md text-sm bg-white" placeholder="NIP Guru" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex gap-3 bg-white">
          <button onClick={onClose} className="flex-1 py-2 bg-blue-500 text-white rounded-md font-medium text-sm hover:bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <Save size={16} /> Simpan & Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
