import React, { useRef } from 'react';
import { X, Upload, Download, Plus, Trash2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { bNames, Holiday } from '../types';
import { parseHolidaysExcel, exportHolidaysToExcel } from '../utils/excel';

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export const ModalLibur: React.FC<ModalProps> = ({ isOpen = true, onClose, inline = false }) => {
  const ctx = useAppContext();
  const fileRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen && !inline) return null;

  const data = [...ctx.holidayData].sort((a, b) => Number(a.month) - Number(b.month) || String(a.date).split(',')[0].localeCompare(String(b.date).split(',')[0]));

  const addRow = () => ctx.updateHolidayData([...ctx.holidayData, { month: ctx.bulan, date: '', desc: '' }]);
  const removeRow = (idx: number) => {
    const next = [...data];
    next.splice(idx, 1);
    ctx.updateHolidayData(next);
  };
  const updateRow = (idx: number, field: keyof Holiday, value: any) => {
    const next = [...data];
    next[idx] = { ...next[idx], [field]: value };
    ctx.updateHolidayData(next);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseHolidaysExcel(file);
      ctx.updateHolidayData([...ctx.holidayData, ...imported]);
    } catch (err) {
      alert("Gagal mengimpor file.");
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const content = (
    <div 
      className={`bg-white rounded-lg border border-slate-200 shadow-sm w-full max-w-3xl max-h-[90vh] flex flex-col font-sans text-slate-800 ${inline ? 'h-fit max-h-none shadow-md mx-auto my-4' : 'overflow-hidden'}`} 
      onClick={e => e.stopPropagation()}
    >
      <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white font-semibold">
        <h3 className="text-lg font-semibold tracking-tight text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-slate-500" /> Master Hari Libur Tahunan
        </h3>
        <div className="flex gap-2">
          <button onClick={() => exportHolidaysToExcel(ctx.holidayData, ctx.sekolah)} className="p-1.5 rounded-md hover:bg-slate-100 transition-all text-slate-500 border border-transparent active:scale-95 hover:text-slate-700" title="Ekspor Libur ke Excel">
            <Download size={18} />
          </button>
          <button onClick={() => fileRef.current?.click()} className="p-1.5 rounded-md hover:bg-slate-100 transition-all text-slate-500 border border-transparent active:scale-95 hover:text-slate-700" title="Impor Libur dari Excel">
            <Upload size={18} />
          </button>
          <input type="file" ref={fileRef} className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
          {!inline && onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md transition-all text-slate-500 active:scale-95 ml-2">
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      <div className={`p-6 overflow-y-auto flex-1 bg-white ${inline ? 'overflow-visible' : ''}`}>
          <table className="w-full text-left border-collapse mb-4 border border-slate-200 table-fixed">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <th className="p-3 border-r border-slate-200 w-40">Bulan</th>
                <th className="p-3 border-r border-slate-200 w-32">Tanggal (Angka)</th>
                <th className="p-3 border-r border-slate-200">Keterangan Hari Libur</th>
                <th className="p-3 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">Belum ada hari libur.</td></tr>
              ) : (
                data.map((h, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50/50">
                    <td className="p-1 border-r border-slate-200">
                      <select className="w-full bg-transparent p-2 text-sm outline-none transition-colors hover:bg-white focus:bg-white rounded" value={h.month} onChange={e => updateRow(i, 'month', Number(e.target.value))}>
                        {bNames.map((name, idx) => <option key={idx} value={idx}>{name}</option>)}
                      </select>
                    </td>
                    <td className="p-1 border-r border-slate-200">
                      <input type="text" className="w-full p-2 text-center bg-transparent border border-transparent rounded text-sm outline-none transition-colors hover:bg-white focus:bg-white focus:border-blue-300" value={h.date} placeholder="1,2-5" onChange={e => updateRow(i, 'date', e.target.value)} />
                    </td>
                    <td className="p-1 border-r border-slate-200">
                      <input type="text" className="w-full p-2 bg-transparent border border-transparent rounded text-sm outline-none transition-colors hover:bg-white focus:bg-white focus:border-blue-300" value={h.desc} placeholder="Keterangan Libur" onChange={e => updateRow(i, 'desc', e.target.value)} />
                    </td>
                    <td className="p-1 text-center">
                      <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all active:scale-90">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button onClick={addRow} className="w-full py-2.5 bg-white border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition-all active:scale-[0.99] text-slate-600 flex items-center justify-center gap-2 hover:border-slate-300">
            <Plus size={16} /> Tambah Baris Libur
          </button>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-white text-right space-x-2">
          {inline ? (
            <span className="text-slate-400 text-xs italic">Perubahan tersimpan otomatis</span>
          ) : (
            <button onClick={onClose} className="w-full py-2 bg-blue-500 text-white rounded-md font-medium text-sm hover:bg-blue-600 active:bg-blue-700 active:scale-[0.99] transition-all">
              Selesai
            </button>
          )}
        </div>
    </div>
  );

  if (inline) {
    return content;
  }

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
        className="w-full max-w-3xl"
      >
        {content}
      </motion.div>
    </motion.div>
  );
};
