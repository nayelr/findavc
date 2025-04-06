import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface LandingProps {
  onShowChat: () => void;
}

export function Landing({ onShowChat }: LandingProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen bg-zinc-900 flex flex-col items-center justify-center relative"
    >
      <h1 className="text-6xl md:text-8xl text-zinc-200 font-light tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        find your perfect vc.
      </h1>
      
      <motion.button
        onClick={onShowChat}
        className="absolute bottom-8 text-zinc-400 hover:text-zinc-200 transition-colors"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={32} />
      </motion.button>
    </motion.div>
  );
}