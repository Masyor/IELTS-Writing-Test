import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Clock, 
  ChevronRight, 
  UserCircle, 
  Trophy,
  History,
  LayoutDashboard,
  LogOut,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { dbService } from '@/lib/firebase';
import { Submission, TestPack, TestMode, SubmissionStatus } from '@/types';
import testPacksData from '@/testPacks.json';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DashboardProps {
  user: any;
  onStartTest: (pack: TestPack, mode: TestMode) => void;
  onResumeTest: (submission: Submission) => void;
  onViewReview: (submission: Submission) => void;
  onOpenTeacher: () => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onStartTest, onResumeTest, onViewReview, onOpenTeacher, onLogout }: DashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<TestPack | null>(null);
  const [selectedMode, setSelectedMode] = useState<TestMode>(TestMode.BOTH);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinStatus, setJoinStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchProfile = async () => {
    // Fetch user profile for classes
    if (dbService.getUser) {
       const profile = await dbService.getUser(user.uid);
       setUserProfile(profile);
       if (profile?.activeClassCodes?.length > 0 && !selectedClass) {
         setSelectedClass(profile.activeClassCodes[0]);
       }
    } else {
      // Fallback for mock
      const mockStore = JSON.parse(localStorage.getItem('ielts_mock_store') || '{}');
      const profile = mockStore[`user_${user.uid}`] || { activeClassCodes: [] };
      setUserProfile(profile);
      if (profile.activeClassCodes?.length > 0 && !selectedClass) {
        setSelectedClass(profile.activeClassCodes[0]);
      }
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      const data = await dbService.getSubmissions(user.uid);
      setSubmissions(data as Submission[]);
      await fetchProfile();
      setLoading(false);
    };
    fetchSubmissions();
  }, [user.uid]);

  const handleJoinClass = async () => {
    if (!classCode.trim()) return;
    setJoining(true);
    setJoinStatus(null);
    try {
      await dbService.joinClass(user.uid, classCode.trim().toUpperCase());
      await fetchProfile();
      const data = await dbService.getSubmissions(user.uid);
      setSubmissions(data as Submission[]);
      setClassCode('');
      setJoinStatus({ type: 'success', message: 'Successfully joined class!' });
      setTimeout(() => {
        setIsJoinDialogOpen(false);
        setJoinStatus(null);
      }, 1500);
    } catch (error: any) {
      setJoinStatus({ type: 'error', message: error.message || 'Failed to join class' });
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dbService.deleteSubmission(id);
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  const ongoingTests = submissions.filter(s => s.status === SubmissionStatus.IN_PROGRESS);
  const completedTests = submissions.filter(s => s.status === SubmissionStatus.SUBMITTED);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pt-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user.displayName}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-blue-200 text-blue-600 bg-blue-50 font-semibold gap-2 rounded-xl hover:bg-blue-100" />}>
              <Plus className="w-4 h-4" />
              Join Class
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Join a Class</DialogTitle>
                <DialogDescription>
                  Enter the 7-character code provided by your teacher.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Class Code</Label>
                    <input
                      id="code"
                      value={classCode}
                      onChange={(e) => {
                        setClassCode(e.target.value.toUpperCase());
                        if (joinStatus) setJoinStatus(null);
                      }}
                      placeholder="E.g. XJ92KL1"
                      className="w-full px-4 py-3 border rounded-xl font-mono text-center text-2xl uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                      maxLength={7}
                      autoFocus
                    />
                    <p className="text-[10px] text-slate-400 text-center">
                      Must be exactly 7 characters (e.g. {Math.random().toString(36).substring(2, 9).toUpperCase()})
                    </p>
                  </div>
                  {joinStatus && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-1",
                      joinStatus.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}>
                      {joinStatus.message}
                    </div>
                  )}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-lg font-bold"
                    onClick={handleJoinClass}
                    disabled={joining || classCode.length < 7}
                  >
                    {joining ? 'Joining...' : 'Join Class'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {user.email === 'matt.longthorne@gmail.com' && (
            <Button variant="outline" onClick={onOpenTeacher} className="border-slate-800 text-slate-800 font-semibold gap-2 rounded-xl">
              <UserCircle className="w-4 h-4" />
              Teacher Portal
            </Button>
          )}
          <Button variant="ghost" onClick={onLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white shadow-sm">
            <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.email}</span>
          </div>
        </div>
      </header>

      <Tabs defaultValue="available" className="space-y-8">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="available" className="data-[state=active]:bg-white">Available Packs</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-white">My Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(testPacksData as TestPack[]).map((pack) => (
              <Card key={pack.id} className="group hover:shadow-xl transition-all duration-300 border-none bg-white shadow-md overflow-hidden flex flex-col">
                <div className="h-2 bg-slate-800"></div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-slate-800 transition-colors">{pack.title}</CardTitle>
                  <CardDescription>Academic Training</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>2 Tasks (Report + Essay)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>60 Minutes total</span>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Dialog>
                    <DialogTrigger render={<Button className="w-full bg-slate-800 hover:bg-slate-700 h-11 text-base font-medium rounded-xl group-hover:translate-y-[-2px] transition-transform shadow-lg" />}>
                      Start Mock Test
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Configure Test Session</DialogTitle>
                        <DialogDescription>
                          Choose which part of the test you'd like to attempt. 
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {userProfile?.activeClassCodes?.length > 0 && (
                          <div className="space-y-2">
                            <Label>Assign to Class</Label>
                            <select 
                              className="w-full border rounded-xl p-3 bg-white"
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                            >
                              <option value="">No Class (Private)</option>
                              {userProfile.activeClassCodes.map((code: string) => (
                                <option key={code} value={code}>Class {code}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <RadioGroup 
                          defaultValue={TestMode.BOTH} 
                          onValueChange={(v) => setSelectedMode(v as TestMode)}
                          className="gap-4"
                        >
                          <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer">
                            <RadioGroupItem value={TestMode.BOTH} id="both" />
                            <Label htmlFor="both" className="flex-1 cursor-pointer">
                              <p className="font-semibold">Full Test (Task 1 & 2)</p>
                              <p className="text-xs text-slate-500">60 Minutes countdown</p>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer">
                            <RadioGroupItem value={TestMode.TASK1} id="task1" />
                            <Label htmlFor="task1" className="flex-1 cursor-pointer">
                              <p className="font-semibold">Task 1 Only</p>
                              <p className="text-xs text-slate-500">20 Minutes countdown</p>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer">
                            <RadioGroupItem value={TestMode.TASK2} id="task2" />
                            <Label htmlFor="task2" className="flex-1 cursor-pointer">
                              <p className="font-semibold">Task 2 Only</p>
                              <p className="text-xs text-slate-500">40 Minutes countdown</p>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <Button 
                        onClick={() => {
                          const packWithClass = { ...pack, classCode: selectedClass };
                          onStartTest(packWithClass as any, selectedMode);
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 h-12 rounded-xl text-lg font-bold"
                      >
                        Launch Test
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-12">
            {ongoingTests.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  In Progress
                </h3>
                <div className="grid gap-4">
                  {ongoingTests.map(sub => (
                    <Card key={sub.id} className="border-l-4 border-l-amber-500 shadow-sm">
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-50 rounded-xl">
                            <Clock className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {testPacksData.find(p => p.id === sub.testPackId)?.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              Started {format(new Date(sub.startedAt), 'MMM d, h:mm a')} • {sub.mode.replace('task', 'Task ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" />}>
                              <Trash2 className="w-4 h-4" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete ongoing test?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove your progress for this practice session. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(sub.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-lg">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button 
                            onClick={() => onResumeTest(sub)}
                            className="bg-amber-600 hover:bg-amber-700 rounded-xl"
                          >
                            Resume Session
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Previous Submissions
              </h3>
              {loading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-xl" />)}
                </div>
              ) : completedTests.length > 0 ? (
                <div className="grid gap-4">
                  {completedTests.map(sub => (
                    <Card key={sub.id} className="hover:border-slate-300 transition-colors shadow-sm">
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-50 rounded-xl">
                            <FileText className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-2">
                              {testPacksData.find(p => p.id === sub.testPackId)?.title}
                              {!!sub.teacherReviewedAt && (!sub.studentLastViewedAt || new Date(sub.teacherReviewedAt) > new Date(sub.studentLastViewedAt)) && (
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" title="New teacher feedback" />
                              )}
                            </p>
                            <p className="text-sm text-slate-500">
                              Submitted {format(new Date(sub.submittedAt || sub.startedAt), 'MMM d, yyyy')} • {sub.mode.replace('task', 'Task ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!!sub.teacherReviewedAt && (!sub.studentLastViewedAt || new Date(sub.teacherReviewedAt) > new Date(sub.studentLastViewedAt)) && (
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                              New Feedback
                            </span>
                          )}
                          {sub.selfAssessment && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                              <Trophy className="w-3 h-3" />
                              Self-Assessed
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={() => onViewReview(sub)}
                            className="rounded-xl border-slate-200"
                          >
                            View Results
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger render={
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            } />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete practice history?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this completed test from your practice history.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(sub.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-lg">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No completed tests yet</p>
                  <p className="text-sm text-slate-400">Your practice history will appear here once you submit a test.</p>
                </div>
              )}
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
