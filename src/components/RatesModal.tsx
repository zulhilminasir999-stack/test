import React, { useState } from 'react';
import { X, Table, Award, Car, Check, Info } from 'lucide-react';
import defaultRates from '../data/rates.json';

interface RatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RatesModal({ isOpen, onClose }: RatesModalProps) {
  const [activeTab, setActiveTab] = useState<'jadual' | 'km'>('jadual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Jadual Kadar Tuntutan Perjalanan ATM</h3>
              <p className="text-xs text-slate-300">
                Pekeliling Perkhidmatan & Kadar Rasmi Tuntutan Kerajaan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('jadual')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'jadual'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" /> Kadar Pangkat (Harian, Makan, Hotel, Lojing)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('km')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'km'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" /> Kadar Perjalanan KM
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 flex-1">
          {activeTab === 'jadual' ? (
            <div className="space-y-6">
              {/* Brig Jen */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white p-3 font-bold flex justify-between items-center">
                  <span>Brig Jen (Pegawai Tinggi)</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                    W1 / W2
                  </span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5 text-right">W1 (Semenanjung)</th>
                      <th className="p-2.5 text-right">W2 (Sabah/Sarawak)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Harian</td>
                      <td className="p-2.5 text-right ">RM 42.50</td>
                      <td className="p-2.5 text-right ">RM 57.50</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Makan</td>
                      <td className="p-2.5 text-right ">RM 85.00</td>
                      <td className="p-2.5 text-right ">RM 115.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Hotel</td>
                      <td className="p-2.5 text-right ">RM 260.00</td>
                      <td className="p-2.5 text-right ">RM 290.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Lojing</td>
                      <td className="p-2.5 text-right ">RM 100.00</td>
                      <td className="p-2.5 text-right ">RM 120.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mej - Kol */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-800 text-white p-3 font-bold flex justify-between items-center">
                  <span>Mej – Kol (Pegawai Kanan)</span>
                  <span className="text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded">
                    W1 / W2
                  </span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5 text-right">W1 (Semenanjung)</th>
                      <th className="p-2.5 text-right">W2 (Sabah/Sarawak)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Harian</td>
                      <td className="p-2.5 text-right ">RM 30.00</td>
                      <td className="p-2.5 text-right ">RM 40.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Makan</td>
                      <td className="p-2.5 text-right ">RM 60.00</td>
                      <td className="p-2.5 text-right ">RM 80.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Hotel</td>
                      <td className="p-2.5 text-right ">RM 240.00</td>
                      <td className="p-2.5 text-right ">RM 270.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Lojing</td>
                      <td className="p-2.5 text-right ">RM 100.00</td>
                      <td className="p-2.5 text-right ">RM 120.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Lt M - Kapt */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-800 text-white p-3 font-bold flex justify-between items-center">
                  <span>Lt M – Kapt (Pegawai Muda)</span>
                  <span className="text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded">
                    W1 / W2
                  </span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5 text-right">W1 (Semenanjung)</th>
                      <th className="p-2.5 text-right">W2 (Sabah/Sarawak)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Harian</td>
                      <td className="p-2.5 text-right ">RM 22.50</td>
                      <td className="p-2.5 text-right ">RM 32.50</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Makan</td>
                      <td className="p-2.5 text-right ">RM 45.00</td>
                      <td className="p-2.5 text-right ">RM 65.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Hotel</td>
                      <td className="p-2.5 text-right ">RM 220.00</td>
                      <td className="p-2.5 text-right ">RM 250.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Lojing</td>
                      <td className="p-2.5 text-right ">RM 100.00</td>
                      <td className="p-2.5 text-right ">RM 120.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pbt - PW1 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-800 text-white p-3 font-bold flex justify-between items-center">
                  <span>Pbt – PW1 (Lain-Lain Pangkat / Bintara) & Pemandu</span>
                  <span className="text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded">
                    W1 / W2
                  </span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5 text-right">W1 (Semenanjung)</th>
                      <th className="p-2.5 text-right">W2 (Sabah/Sarawak)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Harian</td>
                      <td className="p-2.5 text-right ">RM 20.00</td>
                      <td className="p-2.5 text-right ">RM 27.50</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Elaun Makan</td>
                      <td className="p-2.5 text-right ">RM 40.00</td>
                      <td className="p-2.5 text-right ">RM 55.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Hotel</td>
                      <td className="p-2.5 text-right ">RM 200.00</td>
                      <td className="p-2.5 text-right ">RM 230.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Lojing</td>
                      <td className="p-2.5 text-right ">RM 100.00</td>
                      <td className="p-2.5 text-right ">RM 120.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-600" />
                  Kadar Tuntutan Kilometer (KM) Kereta & Motosikal
                </h4>
                <p className="text-slate-600 text-xs">
                  Pengiraan mileage mengikut kadar dua peringkat (500 KM Pertama dan KM Seterusnya).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kereta */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
                  <span className="font-bold text-sm text-slate-900 block">Kereta</span>
                  <div className="space-y-1  text-xs text-slate-700">
                    <p>• 0 – 500 KM: <strong>RM 1.00</strong></p>
                    <p>• 501 KM dan ke atas: <strong>+ RM 0.90 (tambahan)</strong></p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg text-[11px] text-orange-900 mt-2">
                    Contoh: 900 KM = RM 1.00 (500 KM) + RM 0.90 (400 KM) = RM 1.90
                  </div>
                </div>

                {/* Motosikal */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
                  <span className="font-bold text-sm text-slate-900 block">Motosikal</span>
                  <div className="space-y-1  text-xs text-slate-700">
                    <p>• 0 – 500 KM: <strong>RM 0.90</strong></p>
                    <p>• 501 KM dan ke atas: <strong>+ RM 0.55 (tambahan)</strong></p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg text-[11px] text-orange-900 mt-2">
                    Contoh: 900 KM = RM 0.90 (500 KM) + RM 0.55 (400 KM) = RM 1.45
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Dikemaskini mengikut Pekeliling Perkhidmatan ATM
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
