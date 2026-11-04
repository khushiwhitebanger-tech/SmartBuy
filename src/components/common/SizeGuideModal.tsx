import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Ruler } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, closeSizeGuide } = useStore();
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeTab, setActiveTab] = useState<'tops' | 'bottoms' | 'shoes'>('tops');

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#D8C7B5]/40 overflow-hidden text-[#171715]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D8C7B5]/30 bg-[#F7F3EE]/50">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-[#30372B]" />
            <h3 className="font-display text-lg font-bold tracking-tight text-[#171715]">
              SMART BUY Sizing Guide
            </h3>
          </div>
          <button
            onClick={closeSizeGuide}
            className="p-2 text-[#77736D] hover:text-[#171715] rounded-full hover:bg-[#D8C7B5]/20 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Unit Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#FFFFFF] border-b border-[#D8C7B5]/20">
          <div className="flex gap-2">
            {(['tops', 'bottoms', 'shoes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-[#171715] text-[#FFFFFF]'
                    : 'bg-[#F7F3EE] text-[#77736D] hover:text-[#171715]'
                }`}
              >
                {tab === 'tops' ? 'Tops & Shirts' : tab === 'bottoms' ? 'Trousers & Jeans' : 'Footwear'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F7F3EE] rounded-lg">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                unit === 'inches' ? 'bg-[#FFFFFF] text-[#171715] shadow-xs' : 'text-[#77736D]'
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                unit === 'cm' ? 'bg-[#FFFFFF] text-[#171715] shadow-xs' : 'text-[#77736D]'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Tables */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'tops' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#D8C7B5]/40 text-xs uppercase tracking-wider text-[#77736D] bg-[#F7F3EE]/40">
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold">Chest ({unit})</th>
                    <th className="py-3 px-4 font-semibold">Shoulder ({unit})</th>
                    <th className="py-3 px-4 font-semibold">Length ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C7B5]/20 font-mono text-xs">
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">XS</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '36' : '91'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '17.0' : '43'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '26.5' : '67'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">S</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '38' : '96'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '17.5' : '44.5'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '27.5' : '70'}</td>
                  </tr>
                  <tr className="bg-[#F7F3EE]/30">
                    <td className="py-3 px-4 font-sans font-bold">M</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '40' : '101'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '18.2' : '46'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '28.5' : '72'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">L</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '42' : '106'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '19.0' : '48'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '29.5' : '75'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">XL</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '44' : '112'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '19.8' : '50'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '30.5' : '77'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">XXL</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '46' : '117'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '20.5' : '52'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '31.5' : '80'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bottoms' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#D8C7B5]/40 text-xs uppercase tracking-wider text-[#77736D] bg-[#F7F3EE]/40">
                    <th className="py-3 px-4 font-semibold">Waist Size</th>
                    <th className="py-3 px-4 font-semibold">Waist ({unit})</th>
                    <th className="py-3 px-4 font-semibold">Hip ({unit})</th>
                    <th className="py-3 px-4 font-semibold">Inseam ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C7B5]/20 font-mono text-xs">
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">28</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '28 - 29' : '71 - 74'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '36' : '91'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '30' : '76'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">30</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '30 - 31' : '76 - 79'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '38' : '96'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '31' : '79'}</td>
                  </tr>
                  <tr className="bg-[#F7F3EE]/30">
                    <td className="py-3 px-4 font-sans font-bold">32</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '32 - 33' : '81 - 84'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '40' : '101'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '32' : '81'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">34</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '34 - 35' : '86 - 89'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '42' : '106'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '32' : '81'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">36</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '36 - 37' : '91 - 94'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '44' : '112'}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '33' : '84'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shoes' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#D8C7B5]/40 text-xs uppercase tracking-wider text-[#77736D] bg-[#F7F3EE]/40">
                    <th className="py-3 px-4 font-semibold">UK / India</th>
                    <th className="py-3 px-4 font-semibold">US Men</th>
                    <th className="py-3 px-4 font-semibold">EU</th>
                    <th className="py-3 px-4 font-semibold">Foot Length ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C7B5]/20 font-mono text-xs">
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">UK 7</td>
                    <td className="py-3 px-4">8</td>
                    <td className="py-3 px-4">41</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '10.0' : '25.4'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">UK 8</td>
                    <td className="py-3 px-4">9</td>
                    <td className="py-3 px-4">42</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '10.4' : '26.4'}</td>
                  </tr>
                  <tr className="bg-[#F7F3EE]/30">
                    <td className="py-3 px-4 font-sans font-bold">UK 9</td>
                    <td className="py-3 px-4">10</td>
                    <td className="py-3 px-4">43</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '10.7' : '27.2'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-bold">UK 10</td>
                    <td className="py-3 px-4">11</td>
                    <td className="py-3 px-4">44</td>
                    <td className="py-3 px-4">{unit === 'inches' ? '11.1' : '28.2'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 p-4 rounded-xl bg-[#F7F3EE] border border-[#D8C7B5]/30 text-xs text-[#77736D] space-y-1">
            <p className="font-semibold text-[#171715]">Measuring Tip:</p>
            <p>For an oversized, relaxed silhouette, order your standard true size. For a tailored, closer fit, consider sizing down one step.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
