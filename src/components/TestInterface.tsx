import React, { useState, useEffect, useRef } from 'react';
import { 
  Submission, 
  TestPack, 
  TestMode, 
  SubmissionStatus 
} from '@/types';
import { useTimer } from '@/hooks/useTimer';
import { dbService } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  LogOut,
  Clock,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TestInterfaceProps {
  submission: Submission;
  pack: TestPack;
  onFinish: (submission: Submission) => void;
}

export default function TestInterface({ submission, pack, onFinish }: TestInterfaceProps) {
  const [activeTask, setActiveTask] = useState<number>(
    submission.mode === TestMode.TASK2 ? 2 : 1
  );
  const [task1Text, setTask1Text] = useState(submission.task1Response);
  const [task2Text, setTask2Text] = useState(submission.task2Response);
  const [hideTimer, setHideTimer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showTimeUp, setShowTimeUp] = useState(false);
  
  const timer = useTimer(submission.timeLeft, () => {
    setShowTimeUp(true);
  });
  const timerRef = useRef(timer);

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  // Start timer on mount
  useEffect(() => {
    timer.start();
  }, []);

  // Word count calculation
  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const saveToDb = async () => {
    setIsSaving(true);
    try {
      await dbService.updateSubmission(submission.id, {
        task1Response: task1Text,
        task2Response: task2Text,
        task1WordCount: getWordCount(task1Text),
        task2WordCount: getWordCount(task2Text),
        timeLeft: timerRef.current.timeLeft
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save submission:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  // Autosave logic
  useEffect(() => {
    const interval = setInterval(() => {
      saveToDb();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [task1Text, task2Text, submission.id]);

  // Emergency save
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveToDb();
      e.preventDefault();
      e.returnValue = '';
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveToDb();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [task1Text, task2Text, submission.id]);

  const handleFinish = async () => {
    await saveToDb();
    const finalSubmission: Submission = {
      ...submission,
      task1Response: task1Text,
      task2Response: task2Text,
      task1WordCount: getWordCount(task1Text),
      task2WordCount: getWordCount(task2Text),
      timeLeft: timer.timeLeft,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date().toISOString()
    };
    await dbService.updateSubmission(submission.id, finalSubmission);
    onFinish(finalSubmission);
  };

  const currentText = activeTask === 1 ? task1Text : task2Text;
  const currentPrompt = activeTask === 1 ? pack.task1 : pack.task2;
  const wordCount = getWordCount(currentText);

  const formattedTime = timer.formatTime();

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F5] select-none overflow-hidden">
      {/* Time Up Dialog */}
      <AlertDialog open={showTimeUp} onOpenChange={setShowTimeUp}>
        <AlertDialogContent className="rounded-xl border-t-8 border-t-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-red-600 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Time is Up!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base">
              The allocated time for your writing test has ended. Please review your answers one last time and submit your work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Review One Last Time</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish} className="bg-[#41b883] hover:bg-[#349c6d] rounded-lg">
              Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Official IELTS Header */}
      <header className="h-[60px] bg-[#1a2b4b] text-white flex items-center justify-between px-6 shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
            IELTS Academic
          </div>
          <h2 className="text-sm font-semibold truncate max-w-[200px] md:max-w-none">
            {pack.title}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div 
            className={cn(
              "flex items-center gap-3 transition-opacity duration-300",
              hideTimer ? "opacity-0" : "opacity-100"
            )}
          >
            <Clock className="w-5 h-5 text-blue-300" />
            <span className={cn(
              "text-3xl font-mono tracking-tighter tabular-nums",
              timer.timeLeft < 300 ? "text-red-400 animate-pulse" : "text-white"
            )}>
              {formattedTime.formatted}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setHideTimer(!hideTimer)}
            className="text-white hover:bg-white/10 text-xs gap-2"
          >
            {hideTimer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {hideTimer ? 'Show' : 'Hide'} Time
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <div className={cn(
              "flex items-center gap-2 text-[10px] uppercase font-bold text-blue-300 transition-opacity",
              isSaving ? "opacity-100" : "opacity-0"
            )}>
              <Save className="w-3 h-3 animate-bounce" />
              Saving...
            </div>
            {lastSaved && (
              <div className="text-[9px] text-slate-400 font-medium">
                Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger render={<Button size="sm" className="bg-[#41b883] hover:bg-[#349c6d] text-white font-bold h-9 px-6 rounded shadow-md border-b-4 border-[#2d845b] active:border-b-0 transition-all" />}>
              FINISH
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Submit your test?</AlertDialogTitle>
                <AlertDialogDescription>
                  You still have {formattedTime.formatted} left. Once you submit, you can't go back and edit your answers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinish} className="bg-[#41b883] hover:bg-[#349c6d] rounded-lg">
                  Submit Answers
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Main Test Area */}
      <main className="flex-grow flex overflow-hidden">
        {/* Left Side: Question */}
        <div className="w-1/2 flex flex-col border-r border-slate-300 bg-white">
          <div className="h-[44px] bg-[#EBEBEB] border-b border-slate-300 flex items-center px-6 shrink-0">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" />
              Question Description
            </span>
          </div>
          <div className="flex-grow overflow-y-auto p-8 prose prose-slate prose-sm max-w-none">
            <h1 className="text-2xl font-bold border-b pb-4 mb-6 text-slate-800">
              Writing Task {activeTask}
            </h1>
            
            {"image" in currentPrompt && (currentPrompt as any).image && (
              <div className="mb-8 rounded-lg overflow-hidden border shadow-sm bg-slate-50 p-4">
                <img 
                  src={(currentPrompt as any).image} 
                  alt="Task Visualization" 
                  className="max-w-full h-auto mx-auto rounded"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            <div className="text-lg leading-relaxed text-slate-700 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
              <ReactMarkdown>{currentPrompt.prompt}</ReactMarkdown>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 italic text-slate-400 text-sm">
              <p>You should write at least {activeTask === 1 ? '150' : '250'} words for this task.</p>
              <p className="mt-2">Spent about {activeTask === 1 ? '20' : '40'} minutes on this part.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Answer Input */}
        <div className="w-1/2 flex flex-col bg-[#F9F9F9]">
          <div className="h-[44px] bg-[#EBEBEB] border-b border-slate-300 flex items-center justify-between px-6 shrink-0">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
              Type your answer here
            </span>
            <div className="bg-white border px-3 py-0.5 rounded shadow-inner text-[11px] font-mono font-bold text-slate-600">
              Words: <span className={cn(
                wordCount < (activeTask === 1 ? 150 : 250) ? "text-amber-600" : "text-green-600"
              )}>{wordCount}</span>
            </div>
          </div>
          <div className="flex-grow p-6 flex flex-col">
            <Textarea 
              value={activeTask === 1 ? task1Text : task2Text}
              onChange={(e) => activeTask === 1 ? setTask1Text(e.target.value) : setTask2Text(e.target.value)}
              placeholder="Start writing..."
              className="flex-grow resize-none border-none focus-visible:ring-0 text-lg leading-relaxed font-sans shadow-inner p-6 bg-white rounded-xl"
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>
      </main>

      {/* Footer: Task Selection */}
      <footer className="h-[56px] bg-[#E8E8E8] border-t border-slate-300 shrink-0 flex items-center justify-between px-6 z-10 shadow-inner">
        <div className="flex items-center gap-2">
          {submission.mode !== TestMode.TASK2 && (
            <button 
              onClick={() => setActiveTask(1)}
              className={cn(
                "h-[56px] px-8 text-sm font-bold border-r border-slate-300 transition-all",
                activeTask === 1 
                  ? "bg-white text-slate-800 shadow-sm border-t-4 border-t-blue-600 -mt-[4px]" 
                  : "text-slate-500 hover:bg-slate-200"
              )}
            >
              Task 1
            </button>
          )}
          {submission.mode !== TestMode.TASK1 && (
            <button 
              onClick={() => setActiveTask(2)}
              className={cn(
                "h-[56px] px-8 text-sm font-bold border-r border-slate-300 transition-all",
                activeTask === 2 
                  ? "bg-white text-slate-800 shadow-sm border-t-4 border-t-blue-600 -mt-[4px]" 
                  : "text-slate-500 hover:bg-slate-200"
              )}
            >
              Task 2
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:block">
            Candidate ID: {submission.userId.slice(0, 8)}
          </div>
        </div>
      </footer>
    </div>
  );
}
