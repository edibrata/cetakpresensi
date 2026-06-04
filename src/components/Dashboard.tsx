import React from 'react';
import { Landmark, Users, User, CalendarDays, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface DashboardProps {
  onOpenModal: (id: string) => void;
  onOpenDataModal: (target: 'pegawai' | 'murid') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenModal, onOpenDataModal }) => {
  const ctx = useAppContext();

  const activeStaff = ctx.staffData.length;
  const activeStudents = ctx.studentData.length;

  return (
    <div className="max-w-[21cm] mx-auto mt-8 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
          <Settings size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Pengaturan</h2>
          <p className="text-slate-500 font-medium">Informasi dan statistik aplikasi {ctx.sekolah || 'Sekolah'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Total Pegawai</h3>
          </div>
          <div className="text-4xl font-black text-slate-800">{activeStaff}</div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <User size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Total Murid</h3>
          </div>
          <div className="text-4xl font-black text-slate-800">{activeStudents}</div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <CalendarDays size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Hari Libur</h3>
          </div>
          <div className="text-4xl font-black text-slate-800">{ctx.holidayData.length}</div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Menu Cepat</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => onOpenModal('modalSettings')}
          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-left group shadow-sm active:scale-[0.98]"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
            <Landmark size={24} />
          </div>
          <div>
            <div className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Identitas Sekolah</div>
            <div className="text-xs text-slate-500">Edit nama dan pejabat</div>
          </div>
        </button>

        <button 
          onClick={() => onOpenDataModal('pegawai')}
          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left group shadow-sm active:scale-[0.98]"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
            <Users size={24} />
          </div>
          <div>
            <div className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">Data Pegawai</div>
            <div className="text-xs text-slate-500">Kelola data guru & staff</div>
          </div>
        </button>

        <button 
          onClick={() => onOpenDataModal('murid')}
          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group shadow-sm active:scale-[0.98]"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
            <User size={24} />
          </div>
          <div>
            <div className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Data Murid</div>
            <div className="text-xs text-slate-500">Kelola daftar siswa</div>
          </div>
        </button>
      </div>
    </div>
  );
}
