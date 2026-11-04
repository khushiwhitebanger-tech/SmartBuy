import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface TrendingCollectionsProps {
  onSelectCollection: (col: string) => void;
}

export const TrendingCollections: React.FC<TrendingCollectionsProps> = ({ onSelectCollection }) => {
  const trending = [
    {
      name: 'Streetwear',
      tag: 'Full-Zip Fleece · Video Reel',
      image: '/images/hoodies/hoodie_zipper_black.jpeg',
      query: 'Urban Streetwear',
    },
    {
      name: 'Outdoor',
      tag: 'Weatherproof Layering',
      image: '/src/assets/images/hero_fashion_editorial_1792250234088.jpg',
      query: 'Outdoor',
    },
    {
      name: 'Half-Zip Fleeces',
      tag: 'Thermal Mock-Neck Layers',
      image: '/images/sweatshirts/sweatshirt_quarterzip_beige.jpeg',
      query: 'Everyday Essentials',
    },
    {
      name: 'Ethnic Co-ords',
      tag: 'Embroidered Kurti & Palazzo Sets',
      image: '/images/coordsets/coord_pakistani_black.jpeg',
      query: 'Ethnic & Co-ords',
    },
    {
      name: 'Smart Knitwear',
      tag: 'Waffle Knit & Johnny Collars',
      image: '/images/vneck/vneck_black.jpeg',
      query: 'Everyday Essentials',
    },
    {
      name: 'Plaid & Stripes',
      tag: 'Windowpane Cotton & Pinstripes',
      image: '/images/shirts/shirt_checked_sage_green.jpeg',
      query: 'Casual Comfort',
    },
    {
      name: 'Skate-Inspired',
      tag: 'Boxy Tees & Heavy Chinos',
      image: '/src/assets/images/complete_the_look_bundle_1792250235277.jpg',
      query: 'Minimal Essentials',
    },
    {
      name: 'Sportswear',
      tag: 'Four-Way Stretch Performance',
      image: '/src/assets/images/hero_fashion_editorial_1792250234088.jpg',
      query: 'Active Lifestyle',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 border-t border-[#D8C7B5]/30">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            Curated Styles
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171715] mt-1">
            Trending Collections.
          </h2>
        </div>
        <p className="text-xs text-[#77736D]">Scroll through popular contemporary micro-drops.</p>
      </div>

      {/* Horizontal Scroll Row */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar">
        {trending.map((item) => (
          <div
            key={item.name}
            onClick={() => onSelectCollection(item.query)}
            className="group relative min-w-[260px] sm:min-w-[280px] aspect-3/4 rounded-2xl overflow-hidden cursor-pointer bg-[#171715] border border-[#D8C7B5]/30 shadow-xs hover:shadow-xl transition-all duration-300 shrink-0"
          >
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-lg text-white group-hover:text-[#D8C7B5] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5 font-light">
                    {item.tag}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#171715] transition-all">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
