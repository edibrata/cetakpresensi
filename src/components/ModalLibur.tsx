import React, { useRef, useState, useEffect } from 'react';
import { X, Upload, Download, Plus, Trash2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { bNames, Holiday } from '../types';
import { parseHolidaysExcel, exportHolidaysToExcel } from '../utils/excel';
import { useDialog } from '../context/DialogContext';
import { Tooltip } from './Tooltip';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalLibur: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const ctx = useAppContext();
  const dialog = useDialog();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [localData, setLocalData] = useState<Holiday[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setLocalData([...ctx.holidayData].sort((a, b) => Number(a.month) - Number(b.month) || String(a.date).split(',')[0].localeCompare(String(b.date).split(',')[0])));
      setSelectedRows(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addRow = () => setLocalData([...localData, { month: ctx.bulan, date: '', desc: '' }]);
  
  const removeRow = (idx: number) => {
    const next = [...localData];
    next.splice(idx, 1);
    setLocalData(next);
    
    const nextSelected = new Set(selectedRows);
    nextSelected.delete(idx);
    setSelectedRows(nextSelected);
  };
  
  const updateRow = (idx: number, field: keyof Holiday, value: any) => {
    const next = [...localData];
    next[idx] = { ...next[idx], [field]: value };
    setLocalData(next);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseHolidaysExcel(file);
      setLocalData([...localData, ...imported]);
    } catch (err) {
      dialog.showAlert("Error", "Gagal mengimpor file.");
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = () => {
    const sorted = [...localData].sort((a, b) => Number(a.month) - Number(b.month) || String(a.date).split(',')[0].localeCompare(String(b.date).split(',')[0]));
    ctx.updateHolidayData(sorted);
    onClose();
  };

  const deleteSelected = () => {
    if (selectedRows.size > 0) {
      dialog.showConfirm(
        "Konfirmasi Hapus",
        `Hapus ${selectedRows.size} data libur terpilih?`,
        () => {
          setLocalData(localData.filter((_, i) => !selectedRows.has(i)));
          setSelectedRows(new Set());
        },
        "Ya, Hapus"
      );
    }
  };

  const toggleRowChecked = (idx: number) => {
    const next = new Set(selectedRows);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedRows(next);
  };

  const toggleAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedRows(new Set(localData.map((_, i) => i)));
    else setSelectedRows(new Set());
  };

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
        className="bg-white rounded-lg border border-slate-200 shadow-sm w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col font-sans text-slate-800" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white font-semibold flex-wrap gap-2">
          <h3 className="text-lg font-semibold tracking-tight text-slate-800 flex items-center gap-2 w-full md:w-auto">
            <Calendar size={18} className="text-slate-500" /> Master Hari Libur Tahunan
          </h3>
          <div className="flex gap-2">
            {selectedRows.size > 0 && (
              <button onClick={deleteSelected} className="px-3 py-1.5 border border-red-200 rounded-md bg-red-50 text-xs text-red-600 font-medium transition-all active:scale-95 hover:bg-red-100 flex items-center gap-1">
                <Trash2 size={14} /> Hapus {selectedRows.size} Terpilih
              </button>
            )}
            <Tooltip content="Ekspor Libur ke Excel">
              <button onClick={() => exportHolidaysToExcel(localData, ctx.sekolah)} className="p-1.5 rounded-md hover:bg-slate-100 transition-all text-slate-500 border border-transparent active:scale-95 hover:text-slate-700 bg-slate-50">
                <Download size={18} />
              </button>
            </Tooltip>
            <Tooltip content="Impor Libur dari Excel">
              <button onClick={() => fileRef.current?.click()} className="p-1.5 rounded-md hover:bg-slate-100 transition-all text-slate-500 border border-transparent active:scale-95 hover:text-slate-700 bg-slate-50">
                <Upload size={18} />
              </button>
            </Tooltip>
            <input type="file" ref={fileRef} className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <table className="w-full text-left border-collapse mb-4 border border-slate-200 table-fixed">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <th className="p-3 border-r border-slate-200 w-12 text-center text-slate-400">
                  <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={selectedRows.size === localData.length && localData.length > 0} onChange={toggleAllRows} />
                </th>
                <th className="p-3 border-r border-slate-200 w-40">Bulan</th>
                <th className="p-3 border-r border-slate-200 w-32">Tanggal (Angka)</th>
                <th className="p-3 border-r border-slate-200">Keterangan Hari Libur</th>
              </tr>
            </thead>
            <tbody>
              {localData.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">Belum ada hari libur.</td></tr>
              ) : (
                localData.map((h, i) => (
                  <tr key={i} className={`border-b border-slate-100 last:border-b-0 transition-colors ${selectedRows.has(i) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={selectedRows.has(i)} onChange={() => toggleRowChecked(i)} />
                    </td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button onClick={addRow} className="w-full py-2.5 bg-white border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition-all active:scale-[0.99] text-slate-600 flex items-center justify-center gap-2 hover:border-slate-300">
            <Plus size={16} /> Tambah Baris Libur
          </button>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-white">
          <button onClick={handleSave} className="w-full py-2 bg-blue-500 text-white rounded-md font-medium text-sm hover:bg-blue-600 active:bg-blue-700 active:scale-[0.99] transition-all">
            Simpan & Selesai
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

