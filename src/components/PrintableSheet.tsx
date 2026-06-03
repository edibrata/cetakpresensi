import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { bNames } from '../types';

interface PrintableSheetProps {
  overrideKelas?: string;
  overrideRombel?: string;
  overrideBulan?: number;
}

export const PrintableSheet: React.FC<PrintableSheetProps> = ({ overrideKelas, overrideRombel, overrideBulan }) => {
  const ctx = useAppContext();
  const sheetRef = useRef<HTMLDivElement>(null);

  const bIdx = overrideBulan !== undefined ? overrideBulan : ctx.bulan;
  const thn = ctx.tahun;
  const sek = ctx.sekolah || '[NAMA SEKOLAH]';
  const bName = bNames[bIdx];
  const isMurid = ctx.mode === 'murid';
  const isMapelFormat = isMurid && ctx.subModeMurid === 'mapel';
  const namaMapel = (ctx.namaMapel || '').toUpperCase();
  const kls = overrideKelas !== undefined ? overrideKelas : (ctx.kelas || '');
  const rmb = overrideRombel !== undefined ? overrideRombel : (ctx.rombel || '');
  const rmbDisplay = rmb === 'Hanya Satu' || rmb === '' ? '' : '/' + rmb;

  let headerJudul = '';
  let periode = '';

  if (isMapelFormat) {
    headerJudul = `DAFTAR HADIR MURID MAPEL ${namaMapel} ${sek}`;
    periode = `KELAS ${kls}${rmbDisplay} SEMESTER ${ctx.semesterMapel} TAHUN AJARAN ${ctx.tahunAjaranMapel}`;
  } else if (isMurid) {
    headerJudul = `DAFTAR HADIR MURID ${sek}`;
    periode = `KELAS ${kls}${rmbDisplay} BULAN ${bName.toUpperCase()} TAHUN ${thn}`;
  } else {
    headerJudul = `DAFTAR HADIR PEGAWAI ${sek}`;
    periode = `BULAN ${bName.toUpperCase()} TAHUN ${thn}`;
  }

  const getHolidaysForCurrentMonth = () => {
    const hols: { d: number, desc: string }[] = [];
    ctx.holidayData.forEach(h => {
      if (Number(h.month) === bIdx) {
        (h.date || '').split(',').forEach(p => {
          const r = p.split('-');
          if (r.length === 2) {
            for (let i = parseInt(r[0]); i <= parseInt(r[1]); i++) {
              hols.push({ d: i, desc: h.desc });
            }
          } else if (p.trim()) {
            hols.push({ d: parseInt(p.trim()), desc: h.desc });
          }
        });
      }
    });
    return hols;
  };

  const hols = getHolidaysForCurrentMonth();
  const daysInMonth = new Date(thn, bIdx + 1, 0).getDate();

  let filteredData: any[] = [];
  if (isMurid) {
    filteredData = ctx.studentData.filter(s => s.kelas === kls && s.rombel === rmb);
    if (filteredData.length > 0) {
      filteredData.push({ nama: '', lp: '' });
      filteredData.push({ nama: '', lp: '' });
    } else {
      filteredData = Array(15).fill({ nama: '', lp: '' });
    }
  } else {
    filteredData = ctx.staffData.length > 0 ? ctx.staffData : Array(15).fill({ nama: '', tugas: '', status: '' });
  }

  useEffect(() => {
    // applyShrinkToFit logic
    const handleShrink = () => {
      if (!sheetRef.current) return;
      const maxFontSize = isMurid ? 8.5 : 10.5;
      const elements = sheetRef.current.querySelectorAll('.shrink-to-fit') as NodeListOf<HTMLElement>;
      elements.forEach(el => {
        const parent = el.parentElement;
        if (!parent) return;
        let size = maxFontSize;
        el.style.fontSize = size + 'pt';
        const maxW = parent.getBoundingClientRect().width - 3;
        if (el.scrollWidth > maxW) {
          while (el.scrollWidth > maxW && size > 5) {
            size -= 0.1;
            el.style.fontSize = size + 'pt';
          }
        }
      });
    };
    
    // Tiny delay to ensure DOM is ready
    const to = setTimeout(handleShrink, 50);
    return () => clearTimeout(to);
  }, [filteredData, isMurid, ctx.subModeMurid, overrideKelas, overrideRombel, overrideBulan]);

  const renderTableHeaders = () => {
    if (isMapelFormat) {
      const mc = ctx.meetingCount;
      return (
        <thead className="bg-gray-50">
          <tr>
            <th rowSpan={3}>No</th>
            <th rowSpan={3}>Nama Murid</th>
            <th rowSpan={3}>L/P</th>
            <th colSpan={mc}>Pertemuan Ke-</th>
            <th colSpan={3} rowSpan={2}>Jml</th>
            <th rowSpan={3}>Catatan</th>
          </tr>
          <tr>
            {Array.from({ length: mc }).map((_, i) => <th key={i} className="text-[8pt] h-6">{i + 1}</th>)}
          </tr>
          <tr className="bg-white/50">
            {Array.from({ length: mc }).map((_, i) => <th key={i} style={{ height: '35px' }}></th>)}
            <th className="text-[7pt] w-5">S</th>
            <th className="text-[7pt] w-5">I</th>
            <th className="text-[7pt] w-5">A</th>
          </tr>
        </thead>
      );
    } else if (isMurid) {
      return (
        <thead className="bg-gray-50">
          <tr>
            <th rowSpan={2}>No</th>
            <th rowSpan={2}>Nama Murid</th>
            <th rowSpan={2}>L/P</th>
            <th colSpan={daysInMonth}>Tanggal</th>
            <th colSpan={3}>Jumlah</th>
            <th rowSpan={2}>Catatan</th>
          </tr>
          <tr>
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const isSun = new Date(thn, bIdx, d).getDay() === 0;
              const hol = hols.find(h => h.d === d);
              return <th key={d} className={isSun ? 'sunday' : hol ? 'holiday' : ''} style={{ fontSize: '7.5pt' }}>{d}</th>;
            })}
            <th style={{ width: '15.5px' }}>S</th>
            <th style={{ width: '15.5px' }}>I</th>
            <th style={{ width: '15.5px' }}>A</th>
          </tr>
        </thead>
      );
    } else {
      return (
        <thead className="bg-gray-50">
          <tr>
            <th rowSpan={2}>No.</th>
            <th rowSpan={2}>Nama Pegawai</th>
            <th rowSpan={2}>Tugas</th>
            <th rowSpan={2}>Status Kepeg.</th>
            <th colSpan={daysInMonth}>Tanggal</th>
            <th rowSpan={2}>Ket.</th>
          </tr>
          <tr>
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const isSun = new Date(thn, bIdx, d).getDay() === 0;
              const hol = hols.find(h => h.d === d);
              return <th key={d} className={isSun ? 'sunday' : hol ? 'holiday' : ''}>{d}</th>;
            })}
          </tr>
        </thead>
      );
    }
  };

  const renderTableBody = () => {
    if (isMapelFormat) {
      const mc = ctx.meetingCount;
      return (
        <tbody>
          {filteredData.map((item, r) => (
            <tr key={r}>
              <td>{r + 1}</td>
              <td className="!text-left px-2"><span className="shrink-to-fit">{item.nama}</span></td>
              <td className="uppercase">{item.lp}</td>
              {Array.from({ length: mc }).map((_, i) => <td key={i}></td>)}
              <td></td><td></td><td></td><td></td>
            </tr>
          ))}
          <tr className="font-bold" style={{ height: '20px' }}>
            <td colSpan={3 + mc} className="text-center px-2">Jumlah Sakit/Izin/Alfa (S/I/A)</td>
            <td></td><td></td><td></td><td></td>
          </tr>
          <tr className="font-bold" style={{ height: '20px' }}>
            <td colSpan={3 + mc} className="text-center px-2">Total Tidak Hadir (S + I + A)</td>
            <td colSpan={3}></td><td></td>
          </tr>
        </tbody>
      );
    } else if (isMurid) {
      return (
        <tbody>
          {filteredData.map((item, r) => (
            <tr key={r}>
              <td>{r + 1}</td>
              <td className="!text-left px-2"><span className="shrink-to-fit">{item.nama}</span></td>
              <td className="uppercase">{item.lp}</td>
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const isSun = new Date(thn, bIdx, d).getDay() === 0;
                const hol = hols.find(h => h.d === d);
                if (isSun && r === 0) return <td key={d} className="sunday" rowSpan={filteredData.length}><div className="vertical-text-wrapper"><span className="vertical-text">LIBUR MINGGU</span></div></td>;
                else if (hol && r === 0) return <td key={d} className="holiday" rowSpan={filteredData.length}><div className="vertical-text-wrapper"><span className="vertical-text">{hol.desc}</span></div></td>;
                else if (!isSun && !hol) return <td key={d}></td>;
                return null;
              })}
              <td></td><td></td><td></td><td></td>
            </tr>
          ))}
          <tr className="font-bold" style={{ height: '20px' }}>
            <td colSpan={3 + daysInMonth} className="text-center px-2">Jumlah Sakit/Izin/Alfa (S/I/A)</td>
            <td></td><td></td><td></td><td></td>
          </tr>
          <tr className="font-bold" style={{ height: '20px' }}>
            <td colSpan={3 + daysInMonth} className="text-center px-2">Total Tidak Hadir (S + I + A)</td>
            <td colSpan={3}></td><td></td>
          </tr>
        </tbody>
      );
    } else {
      return (
        <tbody>
          {filteredData.map((item, r) => {
            const combinedTugas = (item.tugas || "").replace(/\|/g, '&');
            return (
              <tr key={r}>
                <td>{r + 1}</td>
                <td className="pl-3"><span className="shrink-to-fit">{item.nama}</span></td>
                <td className="text-left pl-3"><div className="text-left leading-tight py-0.5 whitespace-normal break-words">{combinedTugas}</div></td>
                <td className="text-center px-1 whitespace-nowrap">{item.status || ""}</td>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const isSun = new Date(thn, bIdx, d).getDay() === 0;
                  const hol = hols.find(h => h.d === d);
                  if (isSun && r === 0) return <td key={d} className="sunday" rowSpan={filteredData.length}><div className="vertical-text-wrapper"><span className="vertical-text">LIBUR MINGGU</span></div></td>;
                  else if (hol && r === 0) return <td key={d} className="holiday" rowSpan={filteredData.length}><div className="vertical-text-wrapper"><span className="vertical-text">{hol.desc}</span></div></td>;
                  else if (!isSun && !hol) return <td key={d}></td>;
                  return null;
                })}
                <td></td>
              </tr>
            );
          })}
        </tbody>
      );
    }
  };

  const getColGroup = () => {
    if (isMapelFormat) {
      const mc = ctx.meetingCount;
      const colWidth = 25;
      return (
        <colgroup>
          <col style={{ width: '25px' }} />
          <col style={{ width: '180px' }} />
          <col style={{ width: '25px' }} />
          {Array.from({ length: mc }).map((_, i) => <col key={i} style={{ width: `${colWidth}px` }} />)}
          <col style={{ width: '20px' }} /><col style={{ width: '20px' }} /><col style={{ width: '20px' }} />
          <col style={{ width: '75px' }} />
        </colgroup>
      );
    } else if (isMurid) {
      const unitWidth = 15.5;
      return (
        <colgroup>
          <col style={{ width: '25px' }} />
          <col style={{ width: '180px' }} />
          <col style={{ width: '25px' }} />
          {Array.from({ length: daysInMonth }).map((_, i) => <col key={i} style={{ width: `${unitWidth}px` }} />)}
          <col style={{ width: `${unitWidth}px` }} /><col style={{ width: `${unitWidth}px` }} /><col style={{ width: `${unitWidth}px` }} />
          <col style={{ width: '75px' }} />
        </colgroup>
      );
    } else {
      const dateUnitWidth = 21 + (5 / daysInMonth);
      return (
        <colgroup>
          <col style={{ width: '30px' }} /><col style={{ width: '195px' }} /><col style={{ width: '150px' }} /><col style={{ width: '65px' }} />
          {Array.from({ length: daysInMonth }).map((_, i) => <col key={i} style={{ width: `${dateUnitWidth}px` }} />)}
          <col style={{ width: '60px' }} />
        </colgroup>
      );
    }
  };

  const labelRight = isMapelFormat ? "Guru Mata Pelajaran," : (isMurid ? "Guru/ Wali Kelas," : "Kepala Sekolah,");
  const displayNamaLeft = ctx.kepsek || '';
  const displayNIPLeft = ctx.nip || '';
  const displayNamaRight = isMurid ? (ctx.wali || '') : (ctx.kepsek || '');
  const displayNIPRight = isMurid ? (ctx.nipWali || '') : (ctx.nip || '');
  const tglText = ctx.tglManual || (isMapelFormat ? "......................" : `${new Date(thn, bIdx + 1, 0).getDate()} ${bName} ${thn}`);
  const displayTglTtd = ctx.kota ? `${ctx.kota}, ${tglText}` : tglText;

  const formulaText = isMapelFormat
    ? "((Jml Murid x Jml Pert.) - Total Tidak Hadir) / (Jml Murid x Jml Pert.) x 100"
    : "((Jml Murid x Hari Efektif) - Total Tidak Hadir) / (Jml Murid x Hari Efektif) x 100";

  return (
    <div ref={sheetRef} id="printableArea" className={`f4-paper print-container ${isMurid ? 'murid-mode' : 'pegawai-mode'}`}>
      <div className="header-text text-center mb-4">
        <h1 className="text-[14pt] font-bold m-0 leading-tight uppercase">{headerJudul}</h1>
        <p className="text-[12pt] font-bold m-0 leading-tight uppercase mb-3">{periode}</p>
      </div>

      <div className="w-full">
        <table>
          {getColGroup()}
          {renderTableHeaders()}
          {renderTableBody()}
        </table>
      </div>

      <div className="signature-section mt-6 w-full" style={{ fontSize: '11pt' }}>
        <div className="flex w-full items-start justify-between">
          <div className={`${!isMurid ? 'hidden' : 'flex'} w-[240px] text-left flex-col ml-40`}>
            <div className="h-4"><p className="m-0 p-0 leading-tight">Mengetahui:</p></div>
            <div className="h-4"><p className="m-0 p-0 leading-tight">Kepala Sekolah,</p></div>
            <div className="h-14"></div>
            <div className="h-4"><p className="font-bold m-0 p-0 leading-none">{displayNamaLeft}</p></div>
            <div className="h-4"><p className="m-0 p-0 leading-none">NIP. <span>{displayNIPLeft}</span></p></div>
          </div>

          <div id="footerMurid" className={`${!isMurid ? 'hidden' : 'flex'} flex-col items-center justify-center mr-14`}>
            <div className="border border-black p-0 text-center w-[350px] bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-100 border-b border-black py-2 px-2">
                <p className="text-[11pt] font-bold leading-tight">Persentase Kehadiran:</p>
                <p className="text-[7pt] font-bold leading-tight mt-1 text-slate-600 line-clamp-1">{formulaText}</p>
              </div>
              <div className="py-4 px-2 flex flex-col items-center justify-center">
                <p className="text-[10pt] font-normal text-center tracking-wide">
                  (( ....... x ....... ) - ....... ) / ( ....... x ....... ) x 100 = ........ %
                </p>
              </div>
            </div>
          </div>

          <div id="catatanPegawai" className={`${isMurid ? 'hidden' : 'w-[45%]'}`}>
            <p className="font-bold mb-1" style={{ marginLeft: '40px' }}>Catatan Khusus:</p>
            <div className="h-16 w-full mb-2"></div>
          </div>

          <div className="w-[240px] text-left flex flex-col">
            <div className="h-4"><p className="m-0 p-0 leading-tight">{displayTglTtd}</p></div>
            <div className="h-4"><p className="m-0 p-0 leading-tight">{labelRight}</p></div>
            <div className="h-14"></div>
            <div className="h-4"><p className="font-bold m-0 p-0 leading-none">{displayNamaRight}</p></div>
            <div className="h-4"><p className="m-0 p-0 leading-none">NIP. <span>{displayNIPRight}</span></p></div>
          </div>
        </div>
      </div>
    </div>
  );
};
