import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Landmark, Check, Star } from 'lucide-react';

interface PaydaySelectorModalProps {
  onSelect: (type: string) => void;
  isOpen: boolean;
}

const options = [
  { id: 'first', label: '1º día hábil', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'second', label: '2º día hábil', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'third', label: '3º día hábil', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'fourth', label: '4º día hábil', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'fifth', label: '5º día hábil', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'last', label: 'Último día hábil', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'bank', label: 'Cobro Bancario', icon: <Landmark className="w-4 h-4" />, extra: 'Anteúltimo día hábil' },
];

export function PaydaySelectorModal({ onSelect, isOpen }: PaydaySelectorModalProps) {
  const [selected, setSelected] = useState('fifth');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-secondary rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10"
        >
          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-yellow-600 dark:text-accent fill-accent/20" />
            </div>
            
            <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-3">
              ¡Bienvenido!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
              Para avisarte exactamente cuándo cobras, dinos qué día suele ser tu fecha de cobro.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                    selected === opt.id
                      ? 'bg-accent/10 border-accent ring-1 ring-accent text-gray-900 dark:text-white'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={selected === opt.id ? 'text-yellow-600 dark:text-accent' : ''}>
                      {opt.icon}
                    </span>
                    <span className="font-bold text-sm">{opt.label}</span>
                    {selected === opt.id && <Check className="w-4 h-4 ml-auto text-yellow-600 dark:text-accent" />}
                  </div>
                  {opt.extra && <span className="text-[10px] opacity-70 leading-tight">{opt.extra}</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => onSelect(selected)}
              className="w-full py-4 bg-gray-900 dark:bg-accent text-white dark:text-primary font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Confirmar y Empezar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
