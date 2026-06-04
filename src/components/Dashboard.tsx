import React from 'react';
import { Landmark, Users, User, CalendarDays, LayoutTemplate } from 'lucide-react';
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
    <div className="max-w-[21cm] mx-auto mt-8 mb-16 animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-inner text-indigo-300">
            <LayoutTemplate size={40} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Dashboard</h2>
            <p className="text-slate-300 font-medium text-lg">
              Aplikasi Cetak Form Presensi <span className="text-white font-bold">{ctx.sekolah || 'Sekolah'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-400 text-sm mb-1 uppercase tracking-wider">Total Pegawai</h3>
              <div className="text-5xl font-black text-slate-800 tracking-tight">{activeStaff}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-400 text-sm mb-1 uppercase tracking-wider">Total Murid</h3>
              <div className="text-5xl font-black text-slate-800 tracking-tight">{activeStudents}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <User size={28} />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-400 text-sm mb-1 uppercase tracking-wider">Hari Libur</h3>
              <div className="text-5xl font-black text-slate-800 tracking-tight">{ctx.holidayData.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
              <CalendarDays size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Menu */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
          Akses Cepat Pengaturan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button 
            onClick={() => onOpenModal('modalSettings')}
            className="flex items-center gap-5 p-5 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left group active:scale-[0.98]"
          >
            <div className="p-4 bg-white text-blue-600 rounded-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 border border-slate-100 group-hover:border-transparent">
              <Landmark size={24} />
            </div>
            <div>
              <div className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors text-lg mb-0.5">Identitas Sekolah</div>
              <div className="text-sm text-slate-500">Edit nama dan pejabat</div>
            </div>
          </button>

          <button 
            onClick={() => onOpenDataModal('pegawai')}
            className="flex items-center gap-5 p-5 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 text-left group active:scale-[0.98]"
          >
            <div className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 border border-slate-100 group-hover:border-transparent">
              <Users size={24} />
            </div>
            <div>
              <div className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors text-lg mb-0.5">Data Pegawai</div>
              <div className="text-sm text-slate-500">Kelola guru & staff</div>
            </div>
          </button>

          <button 
            onClick={() => onOpenDataModal('murid')}
            className="flex items-center gap-5 p-5 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 text-left group active:scale-[0.98]"
          >
            <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 border border-slate-100 group-hover:border-transparent">
              <User size={24} />
            </div>
            <div>
              <div className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors text-lg mb-0.5">Data Murid</div>
              <div className="text-sm text-slate-500">Kelola daftar siswa</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
