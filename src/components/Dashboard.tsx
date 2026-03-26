import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Zap, TrendingUp, Play, Plus, LogOut } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Fetch User Profile
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        setUserData(userDoc.data());

        // Fetch Recent Sessions
        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('completedAt', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        setRecentSessions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => signOut(auth);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading your dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar/Nav */}
      <nav className="bg-white border-b border-slate-100 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900">ZenFlow AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/session/new" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
              <Plus className="w-4 h-4" /> New Session
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {auth.currentUser?.displayName || 'Mindful Soul'}</h1>
          <p className="text-slate-500">You're on a {userData?.streak || 0} day streak. Keep it up!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Minutes', value: userData?.totalMinutes || 0, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
            { label: 'Current Streak', value: `${userData?.streak || 0} Days`, icon: Zap, color: 'bg-amber-50 text-amber-600' },
            { label: 'Mindfulness Score', value: '84%', icon: TrendingUp, color: 'bg-green-50 text-green-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
            <div className="space-y-4">
              {recentSessions.length > 0 ? recentSessions.map((session) => (
                <div key={session.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <Play className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{session.title}</h3>
                      <p className="text-sm text-slate-400">{new Date(session.completedAt.seconds * 1000).toLocaleDateString()} • {session.duration} mins</p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Details</button>
                </div>
              )) : (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 mb-6">No sessions yet. Start your first journey!</p>
                  <Link to="/session/new" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    <Plus className="w-5 h-5" /> Start Session
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Recommended</h2>
            <div className="space-y-4">
              {[
                { title: 'Morning Focus', duration: '10 min', type: 'Focus' },
                { title: 'Evening Wind-down', duration: '15 min', type: 'Sleep' },
                { title: 'Quick Reset', duration: '5 min', type: 'Stress' }
              ].map((rec, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">{rec.type}</span>
                    <span className="text-xs text-slate-400">{rec.duration}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-4">{rec.title}</h3>
                  <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all">Start Now</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
