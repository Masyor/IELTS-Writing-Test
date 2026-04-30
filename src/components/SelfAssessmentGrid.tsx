import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface SelfAssessmentGridProps {
  onSave: (scores: Record<string, number>) => void;
  initialScores: Record<string, number>;
  criteria: any[];
}

export default function SelfAssessmentGrid({ onSave, initialScores, criteria }: SelfAssessmentGridProps) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores || {});

  useEffect(() => {
    setScores(initialScores || {});
  }, [initialScores]);

  const handleSelect = (criteriaId: string, score: number) => {
    const updated = { ...scores, [criteriaId]: score };
    setScores(updated);
    onSave(updated);
  };

  const isComplete = criteria && Object.keys(scores).length === criteria.length;

  const calculateBand = () => {
    if (!criteria) return "0.0";
    const values = Object.values(scores);
    if (values.length < criteria.length) return "0.0";
    const avg = values.reduce((a, b) => a + b, 0) / criteria.length;
    return (Math.round(avg * 2) / 2).toFixed(1);
  };

  const scoreLevels = [9, 8, 7, 6, 5, 4];

  if (!criteria) return null;

  return (
    <div className="space-y-12 pb-32">
      {criteria.map((c) => (
        <div key={c.id} className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">
              {c.label}
            </h4>
            {scores[c.id] !== undefined && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Selected: Band {scores[c.id]}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {scoreLevels.map((score) => {
              const description = (c.scores as any)[score];
              if (!description) return null;
              
              return (
                <button
                  key={score}
                  onClick={() => handleSelect(c.id, score)}
                  className={cn(
                    "relative flex items-center gap-6 p-4 rounded-xl border text-left transition-all duration-200 group min-h-[72px]",
                    scores[c.id] === score 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg z-10" 
                      : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-12 text-center text-3xl font-black",
                    scores[c.id] === score ? "text-white" : "text-slate-300 group-hover:text-blue-500"
                  )}>
                    {score}
                  </div>
                  <div className="flex-grow">
                    <p className={cn(
                      "text-xs leading-relaxed font-medium pr-8",
                      scores[c.id] === score ? "text-blue-50" : "text-slate-500"
                    )}>
                      {description}
                    </p>
                  </div>
                  {scores[c.id] === score && (
                    <div className="absolute right-4 w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Floating Summary Bar */}
      <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] z-50">
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between animate-in slide-in-from-bottom-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Estimated Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{isComplete ? calculateBand() : '--'}</span>
              <span className="text-sm font-bold text-slate-500">IELTS Band</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-300 mb-1">
              Progress: {Object.keys(scores).length}/{criteria.length}
            </p>
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(Object.keys(scores).length / criteria.length) * 100}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
