import React from 'react';
import { Landmark, Users, User, CalendarDays, LayoutTemplate, Settings, ChevronRight } from 'lucide-react';
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
    <div className="max-w-[21cm] mx-auto mt-6 mb-12 animate-fade-in space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-md">
            <LayoutTemplate size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Dashboard</h2>
            <p className="text-sm text-slate-500">
              Aplikasi Cetak Form Presensi <span className="font-semibold text-slate-700">{ctx.sekolah || 'Sekolah'}</span>
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-slate-400">
          <Settings size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats Grid */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Pegawai</p>
            <p className="text-3xl font-bold text-slate-800">{activeStaff}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Murid</p>
            <p className="text-3xl font-bold text-slate-800">{activeStudents}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md">
            <User size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Hari Libur</p>
            <p className="text-3xl font-bold text-slate-800">{ctx.holidayData.length}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-md">
            <CalendarDays size={22} />
          </div>
        </div>
      </div>

      {/* Quick Menu */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-tight uppercase">Menu Pintasan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={() => onOpenModal('modalSettings')}
            className="flex items-center p-3 gap-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors text-left group"
          >
            <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
              <Landmark size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-slate-700 group-hover:text-blue-700">Identitas Sekolah</div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400" />
          </button>

          <button 
            onClick={() => onOpenDataModal('pegawai')}
            className="flex items-center p-3 gap-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors text-left group"
          >
            <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
              <Users size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-slate-700 group-hover:text-emerald-700">Data Pegawai</div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-400" />
          </button>

          <button 
            onClick={() => onOpenDataModal('murid')}
            className="flex items-center p-3 gap-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-left group"
          >
            <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
              <User size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-slate-700 group-hover:text-indigo-700">Data Murid</div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
