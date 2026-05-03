import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertTriangle, Menu as MenuIcon, RefreshCw } from 'lucide-react';

interface VoiceDashboardProps {
  user: any;
  onNavigate: (screen: string) => void;
  onLogUpdate: (log: any) => void;
}

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

interface AnalysisResult {
  intent: string;
  response: string;
}

export function VoiceDashboard({ user, onNavigate, onLogUpdate }: VoiceDashboardProps) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setError(null);
        processVoiceCommand(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus('idle');
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow it in your browser settings.');
          setPermissionGranted(false);
        } else {
          setError(`Error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        if (status === 'listening') setStatus('idle');
      };
    } else {
      setError('Speech recognition not supported in this browser.');
    }

    return () => recognitionRef.current?.stop();
  }, []);

  const processVoiceCommand = async (text: string) => {
    setStatus('processing');
    const lowerText = text.toLowerCase();

    if (!lowerText.includes('hello ira')) {
      setAnalysis({ intent: 'NO_WAKE_WORD', response: 'Please say "Hello Ira" first.' });
      setStatus('idle');
      return;
    }

    const command = lowerText.replace('hello ira', '').trim();

    try {
      // Notice we are now sending the user's name and role to the backend!
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: command,
          user_name: user.name,
          user_role: user.role
        })
      });

      if (!res.ok) throw new Error('Backend error');

      const data = await res.json();
      
      setAnalysis({
        intent: data.intent,
        response: data.response
      });

      speak(data.response);

    } catch (err) {
      console.error('Backend connection failed:', err);
      const fallbackMsg = "I cannot reach the backend server right now. Is the FastAPI server running?";
      setAnalysis({ intent: 'OFFLINE', response: fallbackMsg });
      speak(fallbackMsg);
      setStatus('idle');
    }
  };

  const speak = (text: string) => {
    setStatus('speaking');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      synthRef.current = new SpeechSynthesisUtterance(text);
      synthRef.current.rate = 0.95;
      synthRef.current.onend = () => setStatus('idle');
      window.speechSynthesis.speak(synthRef.current);
    } else {
      setTimeout(() => setStatus('idle'), 1000);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied.');
    }
  };

  const startListening = async () => {
    if (!permissionGranted) await requestMicrophonePermission();
    if (permissionGranted && recognitionRef.current) {
      setStatus('listening');
      setTranscript('');
      setAnalysis(null);
      recognitionRef.current.start();
    }
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'listening': return 'border-primary bg-primary/10 shadow-[0_0_40px_-10px_var(--primary)] scale-[1.02]';
      case 'processing': return 'border-chart-4 bg-chart-4/10 shadow-[0_0_30px_-10px_var(--chart-4)] animate-pulse';
      case 'speaking': return 'border-chart-5 bg-chart-5/10 shadow-[0_0_30px_-10px_var(--chart-5)]';
      default: return 'border-border bg-muted/30 hover:border-border/80';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground transition-colors duration-500">
      
      {/* Matte Header */}
      <div className="matte-glass sticky top-0 z-10 px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">IRA Logistics</h1>
          <p className="text-sm text-muted-foreground font-medium">{user.name} • <span className="capitalize">{user.role}</span></p>
        </div>
        <button onClick={() => onNavigate('menu')} className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-all active:scale-90">
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-auto animate-in fade-in">
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 text-destructive-foreground font-medium flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Voice Interface */}
        <div className={`matte-glass rounded-3xl p-8 border-2 transition-all duration-500 flex flex-col items-center ${getStatusClasses()}`}>
          <div className="bg-background rounded-2xl px-5 py-3 border border-border text-center mb-6">
            <p className="text-xs text-muted-foreground uppercase font-bold">Wake Word</p>
            <p className="text-primary font-mono font-bold text-lg">"Hello Ira"</p>
          </div>

          <button
            onClick={status === 'listening' ? () => recognitionRef.current?.stop() : startListening}
            disabled={status === 'processing' || status === 'speaking'}
            className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
              status === 'listening' ? 'bg-primary text-primary-foreground scale-110 shadow-[0_0_30px_0_var(--primary)]' 
              : 'bg-background border-2 border-border hover:border-primary hover:text-primary hover:scale-105 active:scale-95'
            }`}
          >
            {status === 'listening' ? <Mic className="w-16 h-16 animate-pulse" /> : <MicOff className="w-16 h-16 opacity-70" />}
          </button>

          <p className="mt-6 text-xl font-medium">{status === 'listening' ? 'Listening...' : status === 'processing' ? 'Agent Thinking...' : status === 'speaking' ? 'Speaking...' : 'Tap to activate'}</p>

          {transcript && (
            <div className="mt-6 w-full bg-background/50 rounded-2xl p-5 border border-border backdrop-blur-sm animate-in slide-in-from-bottom-2">
              <p className="text-xs text-muted-foreground font-bold uppercase mb-2">Transcript</p>
              <p className="font-medium text-lg">{transcript}</p>
            </div>
          )}
        </div>

        {/* Output */}
        {analysis && (
          <div className="space-y-4 animate-in slide-in-from-bottom-6">
            <div className="matte-glass rounded-3xl p-6 border border-border relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
                  <h3 className="text-sm font-bold uppercase">Agent Response</h3>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-xs font-mono font-bold bg-primary/20 text-primary px-2 py-1 rounded-md">{analysis.intent}</span>
                  <Volume2 className={`w-5 h-5 ${status === 'speaking' ? 'text-emerald-400 animate-pulse' : 'text-muted-foreground'}`} />
                </div>
              </div>
              <p className="text-xl font-medium leading-snug">{analysis.response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}