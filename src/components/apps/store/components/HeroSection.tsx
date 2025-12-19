import React from 'react';
import { motion } from 'framer-motion';
import { HomeHero } from '../types';

export const HeroSection = ({ hero }: { hero: HomeHero }) => (
    <div className="relative w-full h-[320px] rounded-3xl overflow-hidden mb-10 group shadow-2xl">
        <img src={hero.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 max-w-2xl">
            <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-2"
            >
                {hero.subtitle}
            </motion.p>
            <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            >
                {hero.title}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-gray-300 text-lg mb-6 line-clamp-2"
            >
                {hero.description}
            </motion.p>
            <motion.button 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
            >
                {hero.action.label}
            </motion.button>
        </div>
    </div>
);
