import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Annotation } from '@/types';
import { MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnnotatedTextProps {
  text: string;
  annotations: Annotation[];
  isTeacher: boolean;
  onAddAnnotation?: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'authorId'>) => void;
  onDeleteAnnotation?: (id: string) => void;
  onEditAnnotation?: (id: string, comment: string) => void;
  taskId: 1 | 2;
}

export default function AnnotatedText({ 
  text, 
  annotations, 
  isTeacher, 
  onAddAnnotation, 
  onDeleteAnnotation,
  onEditAnnotation,
  taskId
}: AnnotatedTextProps) {
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const [comment, setComment] = useState('');
  const [editingAnon, setEditingAnon] = useState<Annotation | null>(null);
  const [activeAnonId, setActiveAnonId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isTeacher) return;
    
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // If we clicked outside and didn't select, clear active annotation
      if (!(e.target as HTMLElement).closest('.annotation-highlight')) {
        setActiveAnonId(null);
      }
      return;
    }

    const range = sel.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) return;

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;

    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setSelection({ start, end, text: range.toString() });
    setPopupPos({
      top: rect.bottom - containerRect.top + 10,
      left: rect.left - containerRect.left
    });
    setEditingAnon(null);
    setComment('');
    setShowPopup(true);
  };

  const handleAdd = () => {
    if (editingAnon && onEditAnnotation) {
      onEditAnnotation(editingAnon.id, comment.trim());
      setEditingAnon(null);
      setComment('');
      setShowPopup(false);
    } else if (selection && comment.trim() && onAddAnnotation) {
      onAddAnnotation({
        taskId,
        text: selection.text,
        startIndex: selection.start,
        endIndex: selection.end,
        comment: comment.trim()
      });
      setSelection(null);
      setComment('');
      setShowPopup(false);
    }
  };

  const handleEditClick = (anon: Annotation) => {
    setEditingAnon(anon);
    setComment(anon.comment);
    setSelection(null);
    setShowPopup(true);
    setActiveAnonId(null);
    
    // Position popup near the existing annotation
    const element = document.getElementById(`anon-${anon.id}`);
    if (element && containerRef.current) {
      const rect = element.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom - containerRect.top + 5,
        left: rect.left - containerRect.left
      });
    }
  };

  // Sort annotations by start index
  const sortedAnnotations = [...annotations]
    .filter(a => a.taskId === taskId)
    .sort((a, b) => a.startIndex - b.startIndex);

  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((anon, i) => {
      if (anon.startIndex > lastIndex) {
        elements.push(<span key={`text-${i}`}>{text.substring(lastIndex, anon.startIndex)}</span>);
      }

      elements.push(
        <span 
          id={`anon-${anon.id}`}
          key={`anon-${anon.id}`} 
          onClick={(e) => {
            e.stopPropagation();
            setActiveAnonId(activeAnonId === anon.id ? null : anon.id);
          }}
          className={cn(
            "annotation-highlight relative cursor-pointer border-b-2 transition-all duration-200",
            activeAnonId === anon.id 
              ? "bg-yellow-400/80 border-yellow-600 scale-[1.02] shadow-sm z-20" 
              : "bg-yellow-200/50 border-yellow-400 hover:bg-yellow-300/70"
          )}
        >
          {text.substring(anon.startIndex, anon.endIndex)}
          
          {/* Correction Note Popup */}
          {(activeAnonId === anon.id) && (
            <div 
              className="absolute left-0 top-full mt-2 w-64 p-4 bg-slate-800 text-white text-xs rounded-2xl z-50 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="font-bold text-blue-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  CORRECTION
                </span>
                <div className="flex items-center gap-2">
                  {isTeacher && (
                    <>
                      <button 
                        onClick={() => handleEditClick(anon)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDeleteAnnotation?.(anon.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setActiveAnonId(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap text-[13px]">{anon.comment}</p>
            </div>
          )}
        </span>
      );

      lastIndex = anon.endIndex;
    });

    if (lastIndex < text.length) {
      elements.push(<span key="text-last">{text.substring(lastIndex)}</span>);
    }

    return elements;
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="whitespace-pre-wrap leading-relaxed text-slate-700 text-lg font-serif min-h-[400px] pb-32"
      >
        {renderContent()}
      </div>

      {showPopup && isTeacher && (
        <div 
          className="absolute z-50 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 w-80 animate-in fade-in zoom-in"
          style={{ top: popupPos.top, left: popupPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {editingAnon ? 'Edit Correction' : 'Add Correction'}
            </h5>
            <button onClick={() => setShowPopup(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your feedback here..."
            className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPopup(false)}
              className="rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleAdd}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-xs"
            >
              {editingAnon ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
