import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CollectionBannersProps {
  onSelectCollection: (collectionName: string) => void;
}

export const CollectionBanners: React.FC<CollectionBannersProps> = ({ onSelectCollection }) => {
  const collections = [
    {
      title: 'Minimal Essentials',
      desc: 'Clean lines, heavyweight organic cotton, and timeless silhouettes.',
      image: '/src/assets/images/category_everyday_essentials_1792250234342.jpg',
      aspect: 'col-span-12 md:col-span-7',
    },
    {
      title: 'Urban Streetwear',
      desc: 'Boxy cuts, relaxed fleece, and utilitarian cargo details.',
      image: '/src/assets/images/category_urban_streetwear_1792250236285.jpg',
      aspect: 'col-span-12 md:col-span-5',
    },
    {
      title: 'Casual Comfort',
      desc: 'Double-gauze cotton, breathable resort linen, and easy drawstrings.',
      image: '/src/assets/images/product_linen_shirt_1792250335977.jpg',
      aspect: 'col-span-12 md:col-span-5',
    },
    {
      title: 'Active Lifestyle',
      desc: 'Engineered for fluid motion, studio training, and daily runs.',
      image: '/src/assets/images/hero_fashion_editorial_1792250234088.jpg',
      aspect: 'col-span-12 md:col-span-7',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 border-t border-[#D8C7B5]/30">
      <div className="mb-10 text-left">
        <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
          Curated Moodboards
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171715] mt-1">
          Shop by Collection.
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {collections.map((col) => (
          <div
            key={col.title}
            onClick={() => onSelectCollection(col.title)}
            className={`${col.aspect} group relative min-h-[320px] rounded-2xl overflow-hidden cursor-pointer bg-[#171715] border border-[#D8C7B5]/40 shadow-xs hover:shadow-xl transition-all duration-300`}
          >
            <img
              src={col.image}
              alt={col.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <span className="text-[11px] font-mono tracking-widest text-[#D8C7B5] uppercase">
                Collection
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
                {col.title}
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-md font-light leading-relaxed">
                {col.desc}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#D8C7B5] group-hover:text-white transition-colors">
                <span>Explore Pieces</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
