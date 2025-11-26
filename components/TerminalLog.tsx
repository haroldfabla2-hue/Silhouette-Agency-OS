import React, { useEffect, useRef } from 'react';

interface TerminalLogProps {
  logs: string[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-[calc(100vh-2rem)] glass-panel rounded-xl p-0 flex flex-col font-mono text-sm overflow-hidden">
        <div className="bg-slate-900 p-2 border-b border-slate-700 flex items-center gap-2 px-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-slate-400 text-xs">silhouette_core_daemon — bash — 80x24</span>
        </div>
        <div className="flex-1 bg-black p-4 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
                <div key={i} className="break-all">
                    <span className="text-slate-500 select-none mr-2">{new Date().toLocaleTimeString()}</span>
                    <span className={
                        log.includes('[ERROR]') ? 'text-red-500' :
                        log.includes('[INTROSPECTION]') ? 'text-purple-400' :
                        log.includes('[SYSTEM]') ? 'text-cyan-400' :
                        'text-green-400'
                    }>{log}</span>
                </div>
            ))}
            <div ref={endRef} />
            <div className="animate-pulse text-cyan-500">_</div>
        </div>
    </div>
  );
};

export default TerminalLog;