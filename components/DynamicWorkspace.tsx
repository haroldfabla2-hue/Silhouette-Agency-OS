
import React, { useState, useEffect, useRef } from 'react';
import { dynamicUi } from '../services/dynamicUiService';
import { DynamicComponentSchema } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, LineChart, Line } from 'recharts';
import * as Lucide from 'lucide-react';
import { Box, LayoutTemplate, Activity, DollarSign, Users, RefreshCcw, AlertTriangle } from 'lucide-react';

// Access to Babel from the global scope (injected in index.html)
declare const Babel: any;

const DynamicWorkspace: React.FC = () => {
    const [schema, setSchema] = useState<DynamicComponentSchema | null>(null);
    const [loading, setLoading] = useState(true);
    const [compilerError, setCompilerError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchema = async () => {
            const state = await dynamicUi.getInterfaceState();
            if (state && state.rootComponent) {
                setSchema(state.rootComponent);
            } else {
                setSchema(dynamicUi.getMockSchema()); // Fallback for demo
            }
            setLoading(false);
        };
        fetchSchema();
    }, []);

    // RUNTIME COMPILER COMPONENT
    const RuntimeApp: React.FC<{ code: string }> = ({ code }) => {
        const [Component, setComponent] = useState<React.FC | null>(null);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
            try {
                // 1. SANITIZE CODE (CRITICAL FIX)
                // The browser 'new Function' cannot handle ES6 modules (import/export).
                // We must strip them manually before passing to Babel/Execution.
                
                let cleanCode = code
                    // Remove import statements entirely (deps are injected via scope)
                    .replace(/^import\s+.*$/gm, '') 
                    // Convert 'export default function App' to 'function App'
                    .replace(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/g, 'function $1')
                    // Remove 'export default App' at the end
                    .replace(/export\s+default\s+([a-zA-Z0-9_]+);?/g, '');

                // 2. Transpile JSX to JS using Babel Standalone
                const transpiled = Babel.transform(cleanCode, {
                    presets: ['react']
                }).code;

                // 3. Prepare Scope
                // Inject React, Recharts, and Lucide into the execution scope
                const scope = {
                    React,
                    ...React, // Inject useState, useEffect etc directly
                    ...Lucide,
                    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, LineChart, Line
                };

                const args = Object.keys(scope);
                const values = Object.values(scope);

                // 4. Secure Evaluation
                // We wrap the code and explicitly look for 'App' to return it.
                const func = new Function(...args, `
                    ${transpiled}
                    // Return the component named 'App' if it exists
                    return typeof App !== 'undefined' ? App : (() => React.createElement('div', {style:{color:'red'}}, 'Error: Component must be named "App"'));
                `);

                const GeneratedComponent = func(...values);
                setComponent(() => GeneratedComponent);
                setError(null);

            } catch (e: any) {
                console.error("Compilation Error:", e);
                setError(e.message);
            }
        }, [code]);

        if (error) return (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-300 font-mono text-xs">
                <h3 className="font-bold flex items-center gap-2"><AlertTriangle size={14}/> COMPILATION ERROR</h3>
                <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
            </div>
        );

        if (!Component) return <div className="text-xs text-slate-500">Compiling Holographic Matrix...</div>;

        return (
            <div className="w-full h-full p-6 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                <Component />
            </div>
        );
    };

    // RECURSIVE RENDERER
    const renderComponent = (comp: DynamicComponentSchema) => {
        switch (comp.type) {
            case 'REACT_APPLICATION':
                return comp.code ? <RuntimeApp key={comp.id} code={comp.code} /> : null;

            case 'CONTAINER':
                return (
                    <div key={comp.id} className={`flex gap-6 ${comp.props.layout === 'row' ? 'flex-row' : 'flex-col'}`}>
                        {comp.children?.map(renderComponent)}
                    </div>
                );
            
            case 'GRID':
                return (
                    <div key={comp.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {comp.children?.map(renderComponent)}
                    </div>
                );

            case 'CARD':
                return (
                    <div key={comp.id} className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col gap-4">
                        {comp.props.title && <h3 className="text-lg font-bold text-white">{comp.props.title}</h3>}
                        {comp.children?.map(renderComponent)}
                    </div>
                );

            case 'METRIC':
                const Icon = comp.props.icon === 'dollar' ? DollarSign : Users;
                return (
                    <div key={comp.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">{comp.props.title}</p>
                            <p className={`text-2xl font-bold text-${comp.props.color || 'white'}-400`}>
                                {comp.props.value}
                            </p>
                        </div>
                        <div className={`p-2 rounded bg-${comp.props.color || 'slate'}-900/30 text-${comp.props.color || 'slate'}-400`}>
                            <Activity size={20} />
                        </div>
                    </div>
                );

            case 'CHART':
                const data = comp.props.data || [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
                return (
                    <div key={comp.id} className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                />
                                <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) return <div className="p-8 text-center text-cyan-500 animate-pulse">Initializing Holographic Core...</div>;

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-xl flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <LayoutTemplate className="text-purple-400" /> Dynamic Workspace
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Server-Driven UI Engine & Runtime Compiler.
                    </p>
                </div>
                <button onClick={() => window.location.reload()} className="p-2 bg-slate-800 rounded hover:bg-slate-700">
                    <RefreshCcw size={16} className="text-slate-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {schema ? renderComponent(schema) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500 opacity-50">
                        <Box size={48} className="mb-4" />
                        <p>No active interface loaded from Continuum.</p>
                        <p className="text-xs mt-2">Ask the Orchestrator to "Generate a Dashboard".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DynamicWorkspace;
