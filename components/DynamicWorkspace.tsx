

import React, { useState, useEffect } from 'react';
import { dynamicUi } from '../services/dynamicUiService';
import { DynamicComponentSchema, SystemProtocol } from '../types';
import { systemBus } from '../services/systemBus';
import { Box, LayoutTemplate, RefreshCcw, FolderOpen, Terminal as TerminalIcon, Play, Database, Server, Globe } from 'lucide-react';

// Access to Babel from the global scope (injected in index.html)
declare const Babel: any;

const DynamicWorkspace: React.FC = () => {
    const [schema, setSchema] = useState<DynamicComponentSchema | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'CODE' | 'PREVIEW' | 'TERMINAL'>('CODE');
    const [fileTree, setFileTree] = useState<any>({
        'src': {
            'App.tsx': '// Code loaded from WebContainer...',
            'main.tsx': 'import React from "react";...',
            'components': {
                'Button.tsx': 'export const Button = ...'
            }
        },
        'package.json': '{\n  "name": "holodeck-app",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}'
    });

    const refreshSchema = async () => {
        const state = await dynamicUi.getInterfaceState();
        if (state && state.rootComponent) {
            setSchema(state.rootComponent);
            // Simulate file tree update from schema
            if (state.rootComponent.props.files) {
                 setFileTree(state.rootComponent.props.files);
            }
        } else {
            setSchema(dynamicUi.getMockSchema());
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshSchema();

        // Listen for Local Core Genesis Updates
        const unsub = systemBus.subscribe(SystemProtocol.GENESIS_UPDATE, (event) => {
            console.log("[WORKSPACE] Received Genesis Update", event);
            refreshSchema();
            // Force switch to preview to show the magic
            setActiveTab('PREVIEW');
        });

        return () => unsub();
    }, []);

    // Simulated WebContainer Terminal
    const WebContainerTerminal: React.FC = () => {
        const [lines, setLines] = useState<string[]>([
            '> [WebContainer] Booting kernel...',
            '> [WebContainer] Mounting file system...',
            '> [PGlite] Initializing PostgreSQL WASM...',
            '> [PGlite] Database ready at postgres://localhost:5432/db',
            '> [System] Installing dependencies (npm install)...',
            '> [System] added 142 packages in 800ms',
            '> [System] Starting dev server...',
            '> [Ready] Server listening on http://localhost:5173'
        ]);

        return (
            <div className="h-48 bg-black border-t border-slate-800 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                {lines.map((l, i) => (
                    <div key={i} className={l.includes('Error') ? 'text-red-500' : l.includes('Ready') ? 'text-green-400' : l.includes('PGlite') ? 'text-blue-400' : 'text-slate-400'}>
                        {l}
                    </div>
                ))}
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-cyan-500">➜</span>
                    <span className="text-slate-500">~/project</span>
                    <div className="w-2 h-4 bg-slate-500 animate-pulse"></div>
                </div>
            </div>
        );
    };

    // RUNTIME COMPILER (Legacy Support for React Preview)
    const RuntimeApp: React.FC<{ code: string }> = ({ code }) => {
        const [Component, setComponent] = useState<React.FC | null>(null);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
            if (!code) return;
            try {
                let cleanCode = code
                    .replace(/^import\s+.*$/gm, '') 
                    .replace(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/g, 'function $1')
                    .replace(/export\s+default\s+([a-zA-Z0-9_]+);?/g, '');

                const transpiled = Babel.transform(cleanCode, { presets: ['react'] }).code;
                
                const func = new Function('React', 'Recharts', 'Lucide', `
                    ${transpiled}
                    return typeof App !== 'undefined' ? App : (() => React.createElement('div', {}, 'Error: No App component'));
                `);
                
                // Inject Recharts and Lucide globals for the generated code
                // Note: In a real app we'd pass the actual libraries
                const GeneratedComponent = func(React, {}, {});
                setComponent(() => GeneratedComponent);
                setError(null);
            } catch (e: any) {
                console.error("Compilation Error:", e);
                setError(e.message);
            }
        }, [code]);

        if (error) return <div className="text-red-500 text-xs p-4 border border-red-900 bg-red-900/10 rounded m-4">Compilation Error: {error}</div>;
        if (!Component) return <div className="text-xs text-slate-500 p-4">Compiling Hologram...</div>;
        return <div className="w-full h-full bg-white text-black p-4 overflow-auto"><Component /></div>;
    };

    const renderFileTree = (tree: any, depth = 0) => {
        return Object.entries(tree).map(([name, content]) => (
            <div key={name} style={{ paddingLeft: depth * 12 }}>
                <div className="flex items-center gap-2 py-1 hover:bg-slate-800 cursor-pointer text-xs text-slate-400 hover:text-cyan-400">
                    {typeof content === 'string' ? <div className="w-4 h-4 bg-slate-700 rounded-sm" /> : <FolderOpen size={14} className="text-yellow-500" />}
                    <span>{name}</span>
                </div>
                {typeof content !== 'string' && renderFileTree(content, depth + 1)}
            </div>
        ));
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
                <h2 className="text-lg font-bold text-white">Booting WebContainer...</h2>
                <p className="text-xs text-slate-500 font-mono">Mounting Node.js File System</p>
                <p className="text-xs text-slate-500 font-mono">Initializing PGlite (WASM)</p>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Toolbar */}
            <div className="glass-panel p-3 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-green-500/10 p-2 rounded text-green-400">
                        <LayoutTemplate size={18} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">Dynamic Workspace V2</h1>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1"><Server size={10}/> Node.js Active</span>
                            <span className="flex items-center gap-1"><Database size={10}/> PGlite Ready</span>
                        </div>
                    </div>
                </div>
                <div className="flex bg-slate-900 rounded p-1">
                    <button onClick={() => setActiveTab('CODE')} className={`px-3 py-1 rounded text-xs ${activeTab === 'CODE' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>Code</button>
                    <button onClick={() => setActiveTab('PREVIEW')} className={`px-3 py-1 rounded text-xs ${activeTab === 'PREVIEW' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>Preview</button>
                </div>
            </div>

            {/* IDE Main Area */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* File Tree */}
                <div className="w-48 glass-panel rounded-xl p-3 overflow-y-auto hidden md:block">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Explorer</h3>
                    <div className="space-y-1">
                        {renderFileTree(fileTree)}
                    </div>
                </div>

                {/* Editor/Preview Area */}
                <div className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden relative">
                    {/* Fake Tabs */}
                    <div className="h-8 bg-slate-950 border-b border-slate-800 flex items-center px-2">
                        <div className="px-3 py-1 bg-slate-800 text-xs text-cyan-400 border-t-2 border-cyan-500">App.tsx</div>
                        <div className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-900">package.json</div>
                    </div>
                    
                    <div className="flex-1 relative bg-slate-900/50 overflow-hidden">
                        {activeTab === 'CODE' ? (
                            <textarea 
                                className="w-full h-full bg-transparent p-4 font-mono text-sm text-slate-300 resize-none outline-none"
                                value={schema?.code || "// No code loaded"}
                                readOnly
                            />
                        ) : (
                            <div className="w-full h-full bg-white relative">
                                <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded z-10 font-mono">
                                    localhost:5173
                                </div>
                                <RuntimeApp code={schema?.code || ""} />
                            </div>
                        )}
                        
                        {/* Overlay Controls */}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-105">
                                <Play size={12} /> Hot Reload
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-105">
                                <Globe size={12} /> Deploy to Coolify
                            </button>
                        </div>
                    </div>

                    <WebContainerTerminal />
                </div>
            </div>
        </div>
    );
};

export default DynamicWorkspace;