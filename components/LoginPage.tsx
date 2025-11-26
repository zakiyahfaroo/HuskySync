import React from 'react';
import { GraduationCap, Users, CalendarPlus, ChevronRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'student' | 'rso') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-uw-purple to-uw-dark flex flex-col items-center justify-center p-4">
      
      <div className="text-center mb-12 animate-fade-in">
        <div className="bg-white/10 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
          <GraduationCap size={64} className="text-uw-gold" />
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight mb-2">HuskySync</h1>
        <p className="text-xl text-indigo-100 max-w-md mx-auto">
          The ultimate event hub for University of Washington students and RSOs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* Student Login Card */}
        <button 
          onClick={() => onLogin('student')}
          className="group relative bg-white rounded-2xl p-8 shadow-2xl hover:scale-105 transition-all duration-300 text-left overflow-hidden border-4 border-transparent hover:border-uw-gold"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={120} className="text-uw-purple" />
          </div>
          
          <div className="relative z-10">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-uw-purple group-hover:text-white transition-colors">
              <Users size={24} className="text-uw-purple group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I am a Student</h2>
            <p className="text-gray-600 mb-6">
              Find free food, merch, and connect with clubs. Compare events and build your schedule.
            </p>
            <div className="flex items-center text-uw-purple font-bold group-hover:gap-2 transition-all">
              Find Events <ChevronRight size={20} />
            </div>
          </div>
        </button>

        {/* RSO Login Card */}
        <button 
          onClick={() => onLogin('rso')}
          className="group relative bg-white rounded-2xl p-8 shadow-2xl hover:scale-105 transition-all duration-300 text-left overflow-hidden border-4 border-transparent hover:border-uw-gold"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarPlus size={120} className="text-uw-purple" />
          </div>
          
          <div className="relative z-10">
            <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-uw-purple group-hover:text-white transition-colors">
              <CalendarPlus size={24} className="text-uw-purple group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I am an RSO Lead</h2>
            <p className="text-gray-600 mb-6">
              Plan events, check for scheduling conflicts, and use AI to optimize your turnout.
            </p>
            <div className="flex items-center text-uw-purple font-bold group-hover:gap-2 transition-all">
              Plan an Event <ChevronRight size={20} />
            </div>
          </div>
        </button>

      </div>

      <div className="mt-12 text-white/50 text-sm">
        © {new Date().getFullYear()} HuskySync • University of Washington
      </div>
    </div>
  );
};

export default LoginPage;