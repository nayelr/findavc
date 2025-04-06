import { motion } from 'framer-motion';
import { VC } from '../lib/vcs';

interface VCResultsProps {
  vcs: VC[];
}

export function VCResults({ vcs }: VCResultsProps) {
  if (!vcs || vcs.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-8 space-y-4"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      <h2 
        className="text-2xl text-zinc-200 mb-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        your perfect vc matches
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {vcs.map((vc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.1 } 
            }}
            className="bg-zinc-800/30 border border-zinc-700/50 p-5 rounded-lg hover:bg-zinc-800/50 transition-colors"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <h3 className="text-xl text-zinc-200 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{vc["Investor name"]}</h3>
            
            <div className="space-y-2 text-zinc-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <div className="flex">
                <span className="text-zinc-400 w-32">location</span>
                <span>{vc["Global HQ"]}</span>
              </div>
              
              <div className="flex">
                <span className="text-zinc-400 w-32">check size</span>
                <span>{vc["First cheque minimum"]} - {vc["First cheque maximum"]}</span>
              </div>
              
              <div className="flex">
                <span className="text-zinc-400 w-32">stage</span>
                <span>{vc["Stage of investment"]}</span>
              </div>
              
              <div className="flex">
                <span className="text-zinc-400 w-32">investor type</span>
                <span>{vc["Investor type"]}</span>
              </div>
              
              <div className="mt-3">
                <a 
                  href={vc["Website"]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-200 transition-colors underline"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  visit website
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
