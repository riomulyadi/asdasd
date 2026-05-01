/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Info, 
  Lock, 
  Unlock, 
  Copy, 
  RefreshCw,
  Search,
  Code2,
  Bug,
  ShieldIcon
} from 'lucide-react';

// Common XSS patterns to highlight in analysis
const PATTERNS = [
  { id: 'breakout', regex: /<\/script>|<\/textarea>|'|"|>/gi, label: 'Tag/Attribute Breakout', description: 'Attempts to close existing HTML tags or attributes to inject new ones.' },
  { id: 'handler', regex: /on\w+\s*=/gi, label: 'Event Handler Injection', description: 'Injects JavaScript via event attributes like onerror, onclick, etc.' },
  { id: 'template', regex: /\$\{\{.*\}\}/g, label: 'Template Injection', description: 'Tests for Client-Side Template Injection (CSTI) vulnerabilities.' },
  { id: 'script', regex: /<script/gi, label: 'Script Tag', description: 'Direct injection of <script> elements.' },
];

export default function App() {
  const [payload, setPayload] = useState('\'"></Script></textarea></head><img src=x onerror=prompt(document.domain)>${{121*121}}xss');
  const [isDangerMode, setIsDangerMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'analysis'>('preview');

  const analysis = useMemo(() => {
    return PATTERNS.map(p => ({
      ...p,
      matches: payload.match(p.regex) || []
    })).filter(p => p.matches.length > 0);
  }, [payload]);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
  };

  const resetPayload = () => {
    setPayload('\'"></Script></textarea></head><img src=x onerror=prompt(document.domain)>${{121*121}}xss');
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-lg">
            <ShieldIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SECURE PAYLOAD LAB</h1>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">v1.0.4 // security_sandbox</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'preview' ? 'border-[#141414]' : 'border-transparent opacity-40'}`}
          >
            LAB VIEW
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'analysis' ? 'border-[#141414]' : 'border-transparent opacity-40'}`}
          >
            ANALYSIS
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Input Section */}
        <div className="lg:col-span-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#141414] shadow-[4px_4px_0px_0px_#141414] overflow-hidden"
          >
            <div className="border-b border-[#141414] px-4 py-2 bg-[#141414] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal size={14} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Payload Input</span>
              </div>
              <div className="flex gap-4">
                <button onClick={handleCopy} className="hover:text-gray-300 transition-colors cursor-pointer" title="Copy to clipboard">
                  <Copy size={12} />
                </button>
                <button onClick={resetPayload} className="hover:text-gray-300 transition-colors cursor-pointer" title="Reset to default">
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>
            <textarea
              id="payload-input"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full h-32 p-4 font-mono text-sm resize-none focus:outline-none bg-white placeholder:opacity-30"
              placeholder="Inject payload here..."
            />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'preview' ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Safe View */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]/20">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-green-600" size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">React Protected (Standard)</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 rounded font-bold uppercase">SAFE</span>
                </div>
                <div className="bg-white border border-[#141414] p-8 aspect-video flex items-center justify-center relative overflow-auto group">
                   {/* This is the core magic of React: strings are automatically escaped */}
                   <div id="safe-output" className="text-center break-all">
                     {payload}
                   </div>
                   <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                     <p className="text-xs font-bold leading-relaxed">
                       React treats this as <span className="underline italic">plain text</span>. 
                       It automatically escapes all special characters (e.g., &lt; becomes &amp;lt;).
                     </p>
                   </div>
                </div>
                <div className="text-[10px] font-mono opacity-60 leading-tight">
                  RENDERED HTML SOURCE:<br/>
                  <code className="text-xs font-bold text-gray-800 break-all">
                    {`<div>${payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`}
                  </code>
                </div>
              </div>

              {/* Unsafe View */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#141414]/20">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={isDangerMode ? "text-red-600 animate-pulse" : "text-gray-400"} size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider underline decoration-red-500/50">dangerouslySetInnerHTML</h3>
                  </div>
                  <button 
                    onClick={() => setIsDangerMode(!isDangerMode)}
                    className={`flex items-center gap-2 px-3 py-1 rounded transition-all text-[10px] font-bold uppercase tracking-wider ${isDangerMode ? 'bg-red-600 text-white shadow-lg' : 'bg-[#141414] text-white opacity-40 hover:opacity-100'}`}
                  >
                    {isDangerMode ? <Unlock size={12} /> : <Lock size={12} />}
                    {isDangerMode ? 'DANGER ACTIVE' : 'ENABLE DANGER'}
                  </button>
                </div>
                <div className={`border transition-all duration-500 p-8 aspect-video flex items-center justify-center relative overflow-auto ${isDangerMode ? 'bg-red-50 border-red-600 border-2' : 'bg-gray-100 border-dashed border-[#141414]/30'}`}>
                  {!isDangerMode ? (
                    <div className="text-center space-y-3 p-4">
                      <Bug size={32} className="mx-auto text-gray-400 opacity-50" />
                      <div>
                        <p className="text-sm font-bold opacity-60 uppercase tracking-tight">Potentially<img src=x onerror=prompt(document.domain)>${{121*121}}xss Dangerous Rendering</p>
                        <p className="text-[10px] opacity-40 max-w-[200px] mx-auto">This bypasses React's security sanitization. Enable at your own risk.</p>
                      </div>
                    </div>
                  ) : (
                    // WARNING: This is intentional for demonstration purposes in a sandbox environment.
                    <div 
                      id="unsafe-output"
                      className="w-full text-center break-all"
                      dangerouslySetInnerHTML={{ __html: payload }} 
                    />
                  )}
                </div>
                <div className="bg-[#141414] text-white p-4 flex gap-4 items-start">
                  <Info className="flex-shrink-0 text-blue-400" size={16} />
                  <p className="text-[10px] leading-relaxed opacity-80">
                    <span className="font-bold text-blue-400 uppercase">Warning:</span> Using <code className="text-red-400">dangerouslySetInnerHTML</code> tells React to stop escaping. This allows the browser to parse the payload as actual HTML and execute scripts if present.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-12 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                    <Search size={14} /> Security Scan Report
                  </h3>
                  {analysis.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.map((item) => (
                        <div key={item.id} className="bg-white border border-[#141414] p-4 group hover:bg-[#141414] hover:text-white transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-tight px-2 py-0.5 bg-red-100 text-red-800 group-hover:bg-red-800 group-hover:text-white transition-all font-mono">
                              Detected: {item.label}
                            </span>
                            <span className="text-[10px] opacity-40 font-mono italic">
                              {item.matches.length} instance{item.matches.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs opacity-70 group-hover:opacity-100 mb-3">{item.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {item.matches.map((m, i) => (
                              <code key={i} className="text-[10px] bg-gray-100 px-1.5 py-0.5 text-red-600 font-bold border border-red-200 group-hover:bg-red-900/30 group-hover:border-red-700/50">
                                {m}
                              </code>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 p-8 text-center rounded-lg">
                      <ShieldCheck className="mx-auto text-green-600 mb-2" size={32} />
                      <p className="font-bold text-green-800">Clear Scan</p>
                      <p className="text-xs text-green-600">No common malicious patterns detected in the current payload string.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                    <Code2 size={14} /> Payload Breakdown
                  </h3>
                  <div className="bg-[#141414] text-[#E4E3E0] p-6 font-mono text-[11px] leading-relaxed relative overflow-hidden">
                    <div className="absolute top-2 right-2 border border-white/20 px-1.5 py-0.5 opacity-30 text-[9px]">DEBUG_MODE</div>
                    <ul className="space-y-4">
                      {payload.includes('Script') && (
                        <li>
                          <span className="text-red-400 font-bold">1. Breakout Sequence:</span><br/>
                          <span className="opacity-60">Tries to close open tags like &lt;textarea&gt; or &lt;head&gt; to start a new execution context.</span>
                        </li>
                      )}
                      {payload.includes('onerror') && (
                        <li>
                          <span className="text-red-400 font-bold">2. Event Handler:</span><br/>
                          <span className="opacity-60">Uses `onerror` on a broken `&lt;img&gt;` because browsers execute it immediately upon load failure.</span>
                        </li>
                      )}
                      {payload.includes('${') && (
                        <li>
                          <span className="text-red-400 font-bold">3. Interpolation:</span><br/>
                          <span className="opacity-60">Uses {'${{...}}'} to test if the template engine evaluates expressions (CSTI).</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-6 mt-12 border-t border-[#141414]/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-[0.15em] opacity-40">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             SYSTEMS SECURE // REACT AUTO-ESCAPE ACTIVE
          </div>
          <div className="text-center md:text-right">
            Always sanitize inputs on the server.<br/>
            Security is a continuous practice.
          </div>
        </div>
      </footer>
    </div>
  );
}
