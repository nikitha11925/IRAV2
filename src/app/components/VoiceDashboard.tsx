import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertTriangle } from 'lucide-react';
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

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: command })
      });

      if (!res.ok) throw new Error('Backend error');

      const data = await res.json();

      const result = {
        detectedText: command,
        intent: data.intent || 'UNKNOWN',
        action: `Gemini → ${data.intent}`,
        response: data.response || "Got it!"
      };

      setAnalysis(result);

      // Log it
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

    } catch (err) {
      console.error(err);
      const fallback = "Sorry, I'm having trouble connecting right now.";
      setAnalysis({
        detectedText: command,
        intent: 'ERROR',
        action: 'Connection failed',
        response: fallback
      });
      speak(fallback);
    }

    setStatus('idle');
  };

  const analyzeIntent = (command: string): AnalysisResult => {
    const detectedText = command;

    if (command.includes('locate') || command.includes('find') || command.includes('where')) {
      const itemMatch = command.match(/\b([A-Z]\d+)\b/i);
      if (itemMatch) {
        const itemCode = itemMatch[1].toUpperCase();
        const item = database.inventory.find(i => i.item === itemCode);
        if (item) {
          return {
            detectedText,
            intent: 'LOCATE_ITEM',
            action: `Fetch location for ${itemCode} from inventory database`,
            response: `${itemCode}. ${item.location}.`
          };
        }
        return {
          detectedText,
          intent: 'LOCATE_ITEM',
          action: `Search failed for ${itemCode}`,
          response: `Item ${itemCode} not found.`
        };
      }
    }

    if (command.includes('delay') || command.includes('delayed')) {
      const reason = command.includes('damage') ? 'damage' :
                    command.includes('traffic') ? 'traffic' :
                    command.includes('weather') ? 'weather' : 'unspecified';
      return {
        detectedText,
        intent: 'DELAY_UPDATE',
        action: `Log delay (${reason}) → Notify manager → Update shipment status`,
        response: `Delay recorded. Manager notified.`
      };
    }

    if (command.includes('spill') || command.includes('hazard') || command.includes('danger')) {
      const location = command.includes('dock') ? 'dock area' :
                      command.includes('bay') ? 'bay' :
                      command.includes('zone') ? 'zone' : 'warehouse';
      return {
        detectedText,
        intent: 'REPORT_HAZARD',
        action: `Create alert → Mark as high severity → Notify safety team`,
        response: `Hazard reported at ${location}. Safety team alerted.`
      };
    }

    if (command.includes('status') || command.includes('shipment')) {
      const shipment = database.shipments[0];
      return {
        detectedText,
        intent: 'SHIPMENT_STATUS',
        action: `Query shipment database → Retrieve latest status`,
        response: `Shipment ${shipment.id} is ${shipment.status}.`
      };
    }

    if (command.includes('inventory') || command.includes('stock')) {
      const lowStock = database.inventory.filter(i => i.status !== 'available').length;
      return {
        detectedText,
        intent: 'INVENTORY_CHECK',
        action: `Scan inventory → Check stock levels`,
        response: `${lowStock} items need attention.`
      };
    }

    return {
      detectedText,
      intent: 'UNKNOWN',
      action: 'No matching command pattern found',
      response: 'Command not recognized. Try: locate item, report hazard, or shipment status.'
    };
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

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'border-blue-500 bg-blue-500/20';
      case 'processing': return 'border-purple-500 bg-purple-500/20';
      case 'speaking': return 'border-green-500 bg-green-500/20';
      default: return 'border-slate-700 bg-slate-800';
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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-400">IRA Logistics</h1>
            <p className="text-sm text-slate-400">{user.name} • {user.role}</p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm">{error}</p>
                {!permissionGranted && (
                  <button
                    onClick={requestMicrophonePermission}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Grant Microphone Access
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`rounded-lg p-6 border-2 transition-all ${getStatusColor()}`}>
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <p className="text-sm text-slate-400 text-center mb-2">Wake Word</p>
              <div className="bg-slate-900 rounded-lg px-4 py-2 border border-slate-700">
                <p className="text-blue-400 font-mono">Say: "Hello Ira"</p>
              </div>
            </div>

            <button
              onClick={status === 'listening' ? stopListening : startListening}
              disabled={status === 'processing' || status === 'speaking'}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                status === 'listening'
                  ? 'bg-blue-600 hover:bg-blue-700 scale-110'
                  : 'bg-slate-800 hover:bg-slate-700'
              } disabled:opacity-50`}
            >
              {status === 'listening' ? (
                <Mic className="w-16 h-16 text-white" />
              ) : (
                <MicOff className="w-16 h-16 text-slate-400" />
              )}
            </button>

            <p className="mt-4 text-lg text-white">{getStatusText()}</p>

            {permissionGranted && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Microphone ready</span>
              </div>
            )}
          </div>

          {transcript && (
            <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Detected Speech:</p>
              <p className="text-white">{transcript}</p>
            </div>
          )}
        </div>

        {analysis && (
          <>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <h3 className="text-sm font-medium text-purple-400">Analyzer Panel</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Input:</p>
                  <p className="text-sm text-white font-mono">{analysis.detectedText}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Intent:</p>
                  <span className="inline-block bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                    {analysis.intent}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Action:</p>
                  <p className="text-sm text-slate-300">{analysis.action}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="text-sm font-medium text-green-400">Output</h3>
                </div>
                <Volume2 className="w-4 h-4 text-green-400" />
              </div>

              <p className="text-white text-lg">{analysis.response}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
