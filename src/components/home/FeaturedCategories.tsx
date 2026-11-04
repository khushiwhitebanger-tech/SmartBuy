import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  onSelectCategory: (collection: string) => void;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      title: 'Everyday Essentials',
      tagline: 'Textured waffle Johnny polos & heavyweight tees',
      image: '/images/vneck/vneck_camel.jpeg',
      collection: 'Everyday Essentials',
    },
    {
      title: 'Performance Wear',
      tagline: 'Technical stretch fabrics & seamless contour',
      image: '/src/assets/images/hero_fashion_editorial_1792250234088.jpg',
      collection: 'Active Lifestyle',
    },
    {
      title: 'Lifestyle Collection',
      tagline: 'Full-zip fleece hoodies & utility cargo trousers',
      image: '/images/hoodies/hoodie_zipper_green.jpeg',
      collection: 'Urban Streetwear',
    },
    {
      title: 'Accessories & Footwear',
      tagline: 'Top-grain leather sneakers & washed caps',
      image: '/src/assets/images/complete_the_look_bundle_1792250235277.jpg',
      collection: 'Minimal Essentials',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
            Curated Categories
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171715] mt-1">
            Form Meets Function.
          </h2>
        </div>
        <p className="text-xs text-[#77736D] max-w-sm">
          Four foundational pillars engineered for everyday versatility, elevated aesthetics, and comfortable movement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.title}
            onClick={() => onSelectCategory(cat.collection)}
            className="group relative aspect-4/5 rounded-2xl overflow-hidden cursor-pointer bg-[#F7F3EE] border border-[#D8C7B5]/30 shadow-xs hover:shadow-xl transition-all duration-300"
          >
            <img
              src={cat.image}
              alt={cat.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:opacity-90" />

            <div className="absolute inset-0 p-6 flex flex-col justify-end text-[#F7F3EE]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-[#D8C7B5] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 line-clamp-2 font-light">
                    {cat.tagline}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#171715] transition-all shrink-0 ml-2">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
