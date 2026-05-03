import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertTriangle, Menu as MenuIcon } from 'lucide-react';
import database from '../../data/database.json';

interface VoiceDashboardProps {
  user: any;
  onNavigate: (screen: string) => void;
  onLogUpdate: (log: any) => void;
}

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

interface AnalysisResult {
  detectedText: string;
  intent: string;
  action: string;
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
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
          setPermissionGranted(false);
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'aborted') {
          setError(null);
        } else {
          setError(`Error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        if (status === 'listening') {
          setStatus('idle');
        }
      };
    } else {
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = async (text: string) => {
    setStatus('processing');
    const lowerText = text.toLowerCase();

    // 1. Check for wake word
    if (!lowerText.includes('hello ira')) {
      setAnalysis({
        detectedText: text,
        intent: 'NO_WAKE_WORD',
        action: 'Wake word missing',
        response: 'Please say "Hello Ira" first'
      });
      setStatus('idle');
      return;
    }

    const command = lowerText.replace('hello ira', '').trim();
    
    let recognizedIntent = 'UNKNOWN';
    let source = 'Local Fallback';
    let backendResponse = '';

    // 2. Try fetching the intent from the Gemini Backend
    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: command })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.intent && data.intent !== 'UNKNOWN') {
          recognizedIntent = data.intent;
          source = 'Gemini AI';
          backendResponse = data.response || '';
        }
      }
    } catch (err) {
      console.error('Backend connection failed:', err);
    }

    // 3. If Gemini failed or returned UNKNOWN, use local regex
    if (recognizedIntent === 'UNKNOWN') {
      source = 'Local Regex';
      if (command.includes('locate') || command.includes('find') || command.includes('where')) recognizedIntent = 'LOCATE_ITEM';
      else if (command.includes('delay') || command.includes('delayed')) recognizedIntent = 'DELAY_UPDATE';
      else if (command.includes('spill') || command.includes('hazard') || command.includes('danger')) recognizedIntent = 'REPORT_HAZARD';
      else if (command.includes('status') || command.includes('shipment')) recognizedIntent = 'SHIPMENT_STATUS';
      else if (command.includes('inventory') || command.includes('stock')) recognizedIntent = 'INVENTORY_CHECK';
    }

    // 4. Execute the Intent locally to bypass generic "Got it!" responses
    const result = executeAction(recognizedIntent, command, source, backendResponse);

    setAnalysis(result);

    // 5. Log it
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user.name,
      role: user.role,
      action: result.intent,
      details: result.response,
      voiceInput: text
    };
    onLogUpdate(log);

    speak(result.response);
  };

  // NEW: Execution Pipeline
  const executeAction = (intent: string, command: string, source: string, backendResponse: string): AnalysisResult => {
    // If Gemini gave us a detailed response, keep it. If it's short, lazy, or empty, we override it.
    const isLazyResponse = !backendResponse || backendResponse.length < 15 || backendResponse.toLowerCase().includes('got it');
    const actionText = `${source} → ${intent}`;

    switch (intent) {
      case 'LOCATE_ITEM': {
        const itemMatch = command.match(/\b([A-Z]\d+)\b/i);
        if (itemMatch) {
          const itemCode = itemMatch[1].toUpperCase();
          const item = database.inventory.find(i => i.item === itemCode);
          return {
            detectedText: command,
            intent,
            action: `${actionText} (DB Lookup)`,
            response: item ? `Item ${itemCode} is located at ${item.location}.` : `I couldn't find item ${itemCode} in the inventory database.`
          };
        }
        return { detectedText: command, intent, action: actionText, response: isLazyResponse ? "Which item would you like me to locate?" : backendResponse };
      }
      case 'DELAY_UPDATE': {
        return { detectedText: command, intent, action: actionText, response: isLazyResponse ? "Delay recorded. The manager has been notified." : backendResponse };
      }
      case 'REPORT_HAZARD': {
        const location = command.includes('dock') ? 'dock area' : command.includes('bay') ? 'bay' : 'warehouse';
        return { detectedText: command, intent, action: actionText, response: isLazyResponse ? `Hazard reported at the ${location}. Safety team alerted.` : backendResponse };
      }
      case 'SHIPMENT_STATUS': {
        const shipment = database.shipments[0];
        return { detectedText: command, intent, action: actionText, response: isLazyResponse ? `Shipment ${shipment.id} is currently ${shipment.status.replace('_', ' ')}.` : backendResponse };
      }
      case 'INVENTORY_CHECK': {
        const lowStock = database.inventory.filter(i => i.status !== 'available').length;
        return { detectedText: command, intent, action: actionText, response: isLazyResponse ? `There are ${lowStock} items currently requiring attention.` : backendResponse };
      }
      default:
        return {
          detectedText: command,
          intent: 'UNKNOWN',
          action: 'No matching pattern',
          response: "I didn't quite catch that. Try saying 'locate item A12' or 'report a hazard'."
        };
    }
  };

  const speak = (text: string) => {
    setStatus('speaking');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      synthRef.current = new SpeechSynthesisUtterance(text);
      synthRef.current.rate = 0.9;
      synthRef.current.pitch = 1;
      synthRef.current.onend = () => {
        setStatus('idle');
      };
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
      return true;
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use voice commands.');
      setPermissionGranted(false);
      return false;
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    if (!permissionGranted) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      setStatus('listening');
      setTranscript('');
      setAnalysis(null);
      setError(null);
      recognitionRef.current.start();
    } catch (err: any) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition. Please try again.');
      setStatus('idle');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus('idle');
    }
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'listening': 
        return 'border-primary bg-primary/10 shadow-[0_0_40px_-10px_var(--primary)] scale-[1.02]';
      case 'processing': 
        return 'border-chart-4 bg-chart-4/10 shadow-[0_0_30px_-10px_var(--chart-4)] animate-pulse';
      case 'speaking': 
        return 'border-chart-5 bg-chart-5/10 shadow-[0_0_30px_-10px_var(--chart-5)]';
      default: 
        return 'border-border bg-muted/30 hover:border-border/80';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Tap to activate';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground transition-colors duration-500">
      
      {/* Matte Glass Header */}
      <div className="matte-glass sticky top-0 z-10 px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">IRA Logistics</h1>
          <p className="text-sm text-muted-foreground font-medium">{user.name} • <span className="capitalize">{user.role}</span></p>
        </div>
        <button
          onClick={() => onNavigate('menu')}
          className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300 active:scale-90"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-auto animate-in fade-in duration-500">
        
        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-destructive-foreground text-sm font-medium">{error}</p>
                {!permissionGranted && (
                  <button
                    onClick={requestMicrophonePermission}
                    className="mt-4 bg-destructive text-destructive-foreground hover:scale-105 active:scale-95 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-300"
                  >
                    Grant Access
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Voice Interface Area */}
        <div className={`matte-glass rounded-3xl p-8 border-2 transition-all duration-500 ease-out flex flex-col items-center ${getStatusClasses()}`}>
          <div className="mb-6 w-full max-w-xs">
            <div className="bg-background rounded-2xl px-5 py-3 border border-border shadow-sm text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Wake Word</p>
              <p className="text-primary font-mono font-bold text-lg">"Hello Ira"</p>
            </div>
          </div>

          <button
            onClick={status === 'listening' ? stopListening : startListening}
            disabled={status === 'processing' || status === 'speaking'}
            className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
              status === 'listening'
                ? 'bg-primary text-primary-foreground scale-110 shadow-[0_0_30px_0_var(--primary)]'
                : 'bg-background border-2 border-border text-foreground hover:border-primary hover:text-primary hover:scale-105 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {status === 'listening' ? (
              <Mic className="w-16 h-16 animate-pulse" />
            ) : (
              <MicOff className="w-16 h-16 opacity-70" />
            )}
          </button>

          <p className="mt-6 text-xl font-medium text-foreground transition-all duration-300">
            {getStatusText()}
          </p>

          {permissionGranted && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full animate-in fade-in duration-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Mic Ready</span>
            </div>
          )}

          {/* Real-time Transcript */}
          {transcript && (
            <div className="mt-6 w-full bg-background/50 rounded-2xl p-5 border border-border backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-300">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Detected Speech</p>
              <p className="text-foreground font-medium text-lg leading-relaxed">{transcript}</p>
            </div>
          )}
        </div>

        {/* Analysis & Output Area */}
        {analysis && (
          <div className="space-y-4 animate-in slide-in-from-bottom-6 fade-in duration-500 ease-out">
            <div className="matte-glass rounded-3xl p-6 border border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-chart-5"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-chart-5 shadow-[0_0_10px_var(--chart-5)]"></div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Analyzer Panel</h3>
              </div>

              <div className="grid gap-4">
                <div className="bg-background rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Intent</p>
                  <span className="inline-block bg-primary/20 text-primary-foreground px-2.5 py-1 rounded-md text-sm font-mono font-bold">
                    {analysis.intent}
                  </span>
                </div>

                <div className="bg-background rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Action Flow</p>
                  <p className="text-sm text-foreground font-medium leading-relaxed">{analysis.action}</p>
                </div>
              </div>
            </div>

            <div className="matte-glass rounded-3xl p-6 border border-border relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">System Output</h3>
                </div>
                <Volume2 className={`w-5 h-5 ${status === 'speaking' ? 'text-emerald-400 animate-pulse' : 'text-muted-foreground'}`} />
              </div>

              <p className="text-foreground text-xl font-medium leading-snug">{analysis.response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}