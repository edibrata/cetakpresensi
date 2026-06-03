import React, { useRef, useState, useEffect } from 'react';
import { X, Upload, Download, Trash2, Plus, GripVertical } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { MapelInput } from './MapelInput';
import { Staff, Student, kelasOptions, rombelOptions } from '../types';
import { exportPeopleToExcel, parsePeopleExcel } from '../utils/excel';
import { buildTugasString } from '../utils/helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: 'pegawai' | 'murid';
}

export const ModalDatabase: React.FC<ModalProps> = ({ isOpen, onClose, target }) => {
  const ctx = useAppContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    setSelectedRows(new Set());
  }, [target, isOpen]);
  
  if (!isOpen) return null;

  const isMurid = target === 'murid';
  const data = isMurid ? ctx.studentData : ctx.staffData;

  const addRow = () => {
    if (isMurid) {
      ctx.updateStudentData([...ctx.studentData, { nama: '', lp: '', kelas: '', rombel: '' }]);
    } else {
      ctx.updateStaffData([...ctx.staffData, {
        nama: '', nip: '', status: '', tugas: '',
        jabatan: {
          primary: { cat: 'Lainnya', sub: '', kls: [] },
          secondary: { active: false, cat: 'Lainnya', sub: '', kls: [] }
        }
      }]);
    }
  };

  const removeRow = (idx: number) => {
    if (isMurid) {
      const next = [...ctx.studentData];
      next.splice(idx, 1);
      ctx.updateStudentData(next);
    } else {
      const next = [...ctx.staffData];
      next.splice(idx, 1);
      ctx.updateStaffData(next);
    }
    const nextSelected = new Set(selectedRows);
    nextSelected.delete(idx);
    setSelectedRows(nextSelected);
  };

  const clearAllData = () => {
    if (confirm('Hapus semua data dalam database ini?')) {
      if (isMurid) ctx.updateStudentData([]);
      else ctx.updateStaffData([]);
      setSelectedRows(new Set());
    }
  };

  const deleteSelected = () => {
    if (selectedRows.size > 0 && confirm(`Hapus ${selectedRows.size} data terpilih?`)) {
      if (isMurid) {
        ctx.updateStudentData(ctx.studentData.filter((_, i) => !selectedRows.has(i)));
      } else {
        ctx.updateStaffData(ctx.staffData.filter((_, i) => !selectedRows.has(i)));
      }
      setSelectedRows(new Set());
    }
  };

  const toggleRowChecked = (idx: number) => {
    const next = new Set(selectedRows);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedRows(next);
  };

  const toggleAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedRows(new Set(data.map((_, i) => i)));
    else setSelectedRows(new Set());
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    if (isMurid) {
      const next = [...ctx.studentData];
      const item = next.splice(draggedIdx, 1)[0];
      next.splice(idx, 0, item);
      ctx.updateStudentData(next);
      
      const newSelected = new Set<number>();
      selectedRows.forEach(i => {
        if (i === draggedIdx) newSelected.add(idx);
        else if (draggedIdx < idx && i > draggedIdx && i <= idx) newSelected.add(i - 1);
        else if (draggedIdx > idx && i < draggedIdx && i >= idx) newSelected.add(i + 1);
        else newSelected.add(i);
      });
      setSelectedRows(newSelected);
      setDraggedIdx(idx);
    } else {
      const next = [...ctx.staffData];
      const item = next.splice(draggedIdx, 1)[0];
      next.splice(idx, 0, item);
      ctx.updateStaffData(next);
      
      const newSelected = new Set<number>();
      selectedRows.forEach(i => {
        if (i === draggedIdx) newSelected.add(idx);
        else if (draggedIdx < idx && i > draggedIdx && i <= idx) newSelected.add(i - 1);
        else if (draggedIdx > idx && i < draggedIdx && i >= idx) newSelected.add(i + 1);
        else newSelected.add(i);
      });
      setSelectedRows(newSelected);
      setDraggedIdx(idx);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const updateStudent = (idx: number, field: keyof Student, val: any) => {
    const next = [...ctx.studentData];
    next[idx] = { ...next[idx], [field]: val };
    ctx.updateStudentData(next);
  };

  const updateStaffText = (idx: number, field: keyof Staff, val: any) => {
    const next = [...ctx.staffData];
    next[idx] = { ...next[idx], [field]: val };
    ctx.updateStaffData(next);
  };

  const updateStaffJabatan = (idx: number, roleType: 'primary' | 'secondary', field: string, val: any, isChecked?: boolean) => {
    const next = [...ctx.staffData];
    const item = { ...next[idx] };
    const jab = { ...item.jabatan };
    const targetRole = roleType === 'primary' ? { ...jab.primary } : { ...jab.secondary };

    if (field === 'active') {
      (targetRole as any).active = isChecked;
    } else if (field === 'cat') {
      targetRole.cat = val;
      if (val === 'Kepsek' || val === 'Plt. Kepsek' || val === 'Lainnya') targetRole.kls = [];
      if (val !== 'Guru Mapel' && val !== 'Lainnya') targetRole.sub = '';
    } else if (field === 'sub') {
      targetRole.sub = val;
    } else if (field === 'rombel') {
      targetRole.rombel = val;
    } else if (field === 'kls') {
      const currentKls = [...targetRole.kls];
      if (isChecked) {
        if (!currentKls.includes(val)) currentKls.push(val);
      } else {
        const i = currentKls.indexOf(val);
        if (i > -1) currentKls.splice(i, 1);
      }
      targetRole.kls = currentKls;
    }

    if (roleType === 'primary') jab.primary = targetRole;
    else jab.secondary = targetRole as any;

    item.jabatan = jab;
    item.tugas = buildTugasString(jab);
    next[idx] = item;
    ctx.updateStaffData(next);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parsePeopleExcel(file, isMurid);
      if (isMurid) ctx.updateStudentData([...ctx.studentData, ...imported]);
      else ctx.updateStaffData([...ctx.staffData, ...imported]);
    } catch (err) {
      alert('Gagal impor file.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const mapelOptionsDB = ['PABP', 'PJOK', 'Bahasa Inggris', 'Lainnya'];

  const buildPartUI = (idx: number, type: 'primary' | 'secondary', dataPart: any) => {
    const catOpts = ["Kepsek", "Plt. Kepsek", "Guru Kelas", "Guru Mapel", "Lainnya"];
    return (
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg mb-2">
        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">{type === 'primary' ? 'Peran Utama' : 'Tugas Tambahan'}</div>
        <select className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] font-bold mb-1" value={dataPart.cat} onChange={e => updateStaffJabatan(idx, type, 'cat', e.target.value)}>
          {catOpts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {(dataPart.cat === 'Guru Mapel' || dataPart.cat === 'Lainnya') && (
          <MapelInput 
            value={dataPart.sub} 
            onChange={(val) => updateStaffJabatan(idx, type, 'sub', val)} 
            options={dataPart.cat === 'Guru Mapel' ? mapelOptionsDB : []}
            placeholder="Nama Mapel/Jabatan..."
          />
        )}
        {(dataPart.cat !== 'Kepsek' && dataPart.cat !== 'Plt. Kepsek' && dataPart.cat !== 'Lainnya') && (
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex flex-wrap gap-x-3 gap-y-1 items-center bg-white p-1 rounded border border-slate-100">
              {kelasOptions.map(k => (
                <label key={k} className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 cursor-pointer" checked={dataPart.kls?.includes(k)} onChange={e => updateStaffJabatan(idx, type, 'kls', k, e.target.checked)} />
                  <span className="text-[10px] font-bold text-slate-600">{k}</span>
                </label>
              ))}
            </div>
            {dataPart.cat === 'Guru Kelas' && (
              <select className="w-full bg-white border border-slate-100 rounded p-1 text-[10px] font-bold" value={dataPart.rombel || ""} onChange={e => updateStaffJabatan(idx, type, 'rombel', e.target.value)}>
                <option value="">Rombel (Kosongkan jika hanya 1)</option>
                {rombelOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          </div>
        )}
      </div>
    );
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
        className="bg-white rounded-lg border border-slate-200 shadow-sm w-full max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col font-sans text-slate-800" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-wrap justify-between items-center gap-4 font-semibold">
          <h3 className="text-lg font-semibold tracking-tight text-slate-800">Database {isMurid ? 'Murid' : 'Pegawai'}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedRows.size > 0 && (
              <button onClick={deleteSelected} className="px-4 py-1.5 border border-red-200 rounded-md bg-red-50 text-xs text-red-600 font-medium transition-all active:scale-95 hover:bg-red-100 flex items-center gap-1">
                <Trash2 size={14} /> Hapus {selectedRows.size} Terpilih
              </button>
            )}
            <button onClick={() => exportPeopleToExcel(isMurid, data, ctx.sekolah)} className="px-4 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 font-medium transition-all active:scale-95 hover:bg-slate-50 flex items-center gap-1 hover:border-slate-300">
              <Download size={14} /> Ekspor
            </button>
            <button onClick={() => fileRef.current?.click()} className="px-4 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 font-medium transition-all active:scale-95 hover:bg-slate-50 cursor-pointer flex items-center gap-1 hover:border-slate-300">
              <Upload size={14} /> Impor
            </button>
            <input type="file" ref={fileRef} accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
            <button onClick={clearAllData} className="px-4 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-red-600 font-medium transition-all active:scale-95 hover:bg-red-50 flex items-center gap-1 hover:border-red-200">
              <Trash2 size={14} /> Kosongkan
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <table className="w-full text-left border-collapse mb-4 border border-slate-200 table-fixed">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              {isMurid ? (
                <tr>
                  <th className="p-3 border-r border-slate-200 w-12 text-center text-slate-400">
                    <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={selectedRows.size === data.length && data.length > 0} onChange={toggleAllRows} />
                  </th>
                  <th className="p-3 border-r border-slate-200 w-12 text-center text-slate-400">Drag</th>
                  <th className="p-3 border-r border-slate-200 w-12 text-center">No</th>
                  <th className="p-3 border-r border-slate-200">Nama Murid</th>
                  <th className="p-3 border-r border-slate-200 w-16 text-center">L/P</th>
                  <th className="p-3 border-r border-slate-200 w-28 text-center">Kelas</th>
                  <th className="p-3 border-r border-slate-200 w-24 text-center">Rombel</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-3 border-r border-slate-200 w-12 text-center text-slate-400">
                    <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={selectedRows.size === data.length && data.length > 0} onChange={toggleAllRows} />
                  </th>
                  <th className="p-3 border-r border-slate-200 w-12 text-center text-slate-400">Drag</th>
                  <th className="p-3 border-r border-slate-200 w-12 text-center">No</th>
                  <th className="p-3 border-r border-slate-200 w-56">Nama Pegawai / NIP</th>
                  <th className="p-3 border-r border-slate-200">Jabatan & Penugasan</th>
                  <th className="p-3 border-r border-slate-200 w-32">Status Kepeg.</th>
                </tr>
              )}
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={isMurid ? 7 : 6} className="p-4 text-center text-sm text-slate-500">Database kosong.</td></tr>
              ) : (
                isMurid ? (ctx.studentData.map((item, idx) => (
                  <tr key={idx} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, idx)} 
                      onDragOver={(e) => handleDragOver(e, idx)} 
                      onDragEnd={handleDragEnd}
                      className={`border-b border-slate-100 last:border-b-0 transition-colors ${selectedRows.has(idx) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'} ${draggedIdx === idx ? 'opacity-50' : ''}`}
                  >
                    <td className="p-1 border-r border-slate-200 text-center text-slate-400">
                      <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={selectedRows.has(idx)} onChange={() => toggleRowChecked(idx)} />
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing align-middle">
                      <GripVertical size={16} className="mx-auto" />
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center text-sm text-slate-400">{idx + 1}</td>
                    <td className="p-1 border-r border-slate-200"><input type="text" className="!text-left w-full bg-transparent p-2 text-sm outline-none transition-colors hover:bg-white focus:bg-white border border-transparent focus:border-blue-300 rounded" value={item.nama} onChange={e => updateStudent(idx, 'nama', e.target.value)} /></td>
                    <td className="p-1 border-r border-slate-200"><input type="text" className="w-full bg-transparent p-2 text-sm text-center outline-none transition-colors hover:bg-white focus:bg-white border border-transparent focus:border-blue-300 rounded" value={item.lp} maxLength={1} onChange={e => updateStudent(idx, 'lp', e.target.value)} /></td>
                    <td className="p-1 border-r border-slate-200 text-center">
                      <select className="w-full bg-transparent p-2 text-sm outline-none transition-colors hover:bg-white focus:bg-white border border-transparent rounded" value={item.kelas} onChange={e => updateStudent(idx, 'kelas', e.target.value)}>
                        <option value="">-</option>
                        {kelasOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center">
                      <select className="w-full bg-transparent p-2 text-sm outline-none transition-colors hover:bg-white focus:bg-white border border-transparent rounded" value={item.rombel} onChange={e => updateStudent(idx, 'rombel', e.target.value)}>
                        <option value="">-</option>
                        {rombelOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                  </tr>
                ))) : (ctx.staffData.map((item, idx) => {
                  const statusOpts = ["PNS", "PPPK", "PPPK PW", "Honorer", "Lainnya"];
                  const jab: any = item.jabatan || { primary: {}, secondary: {} };
                  return (
                    <tr key={idx}
                        draggable 
                        onDragStart={(e) => handleDragStart(e, idx)} 
                        onDragOver={(e) => handleDragOver(e, idx)} 
                        onDragEnd={handleDragEnd}
                        className={`align-top border-b border-slate-100 last:border-b-0 transition-colors ${selectedRows.has(idx) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'} ${draggedIdx === idx ? 'opacity-50' : ''}`}
                    >
                      <td className="p-3 border-r border-slate-200 text-center text-slate-400 align-middle">
                        <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={selectedRows.has(idx)} onChange={() => toggleRowChecked(idx)} />
                      </td>
                      <td className="p-3 border-r border-slate-200 text-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing align-middle">
                        <GripVertical size={16} className="mx-auto" />
                      </td>
                      <td className="p-3 border-r border-slate-200 text-center text-sm text-slate-400 align-middle">{idx + 1}</td>
                      <td className="p-3 border-r border-slate-200 space-y-2">
                        <input type="text" className="!text-left w-full border border-slate-200 rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-transparent transition-colors hover:bg-white focus:bg-white" value={item.nama} placeholder="Nama Lengkap" onChange={e => updateStaffText(idx, 'nama', e.target.value)} />
                        <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-transparent transition-colors hover:bg-white focus:bg-white" value={item.nip || ''} placeholder="NIP" onChange={e => updateStaffText(idx, 'nip', e.target.value)} />
                      </td>
                      <td className="p-3 border-r border-slate-200">
                        <div className="flex flex-col text-left bg-white p-2 border border-transparent rounded-md transition-all">
                          {buildPartUI(idx, 'primary', jab.primary)}
                          <label className="flex items-center gap-2 cursor-pointer mb-2 ml-1 mt-2">
                            <input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={jab.secondary?.active || false} onChange={e => updateStaffJabatan(idx, 'secondary', 'active', '', e.target.checked)} />
                            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Memiliki Tugas Tambahan?</span>
                          </label>
                          {jab.secondary?.active && buildPartUI(idx, 'secondary', jab.secondary)}
                        </div>
                      </td>
                      <td className="p-3 border-r border-slate-200">
                        <select className="w-full bg-transparent p-1 text-sm outline-none border border-slate-200 rounded transition-colors hover:bg-white focus:bg-white" value={item.status} onChange={e => updateStaffText(idx, 'status', e.target.value)}>
                          <option value="">-</option>
                          {statusOpts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                }))
              )}
            </tbody>
          </table>
          <button onClick={addRow} className="w-full py-2.5 bg-white border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition-all active:scale-[0.99] text-slate-600 flex items-center justify-center gap-2 hover:border-slate-300">
            <Plus size={16} /> Tambah Baris Baru
          </button>
        </div>
        
        <div className="px-5 py-4 border-t border-slate-200 bg-white">
          <button onClick={onClose} className="w-full py-2 bg-blue-500 text-white rounded-md font-medium text-sm hover:bg-blue-600 active:bg-blue-700 active:scale-[0.99] transition-all">Selesai</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

