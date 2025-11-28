
import React, { useState, useEffect, useRef } from 'react';
import { vfs } from '../services/virtualFileSystem';
import { VFSProject, FileNode, SystemProtocol } from '../types';
import { systemBus } from '../services/systemBus';
import { 
    Box, LayoutTemplate, RefreshCcw, FolderOpen, 
    Terminal as TerminalIcon, Play, Database, Server, Globe, 
    File, FileCode, FileJson, ChevronRight, ChevronDown, 
    Plus, Trash2, Save, X, Download, HardDrive, Cpu 
} from 'lucide-react';

// Access to Babel from the global scope (injected in index.html)
declare const Babel: any;

const DynamicWorkspace: React.FC = () => {
    // --- STATE ---
    const [activeProject, setActiveProject] = useState<VFSProject | null>(null);
    const [projects, setProjects] = useState<VFSProject[]>([]);
    
    // IDE State
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
    
    // View State
    const [activeTab, setActiveTab] = useState<'CODE' | 'PREVIEW'>('CODE');
    
    // Terminal State
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [cwdId, setCwdId] = useState<string | null>(null);
    const [terminalInput, setTerminalInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyPointer, setHistoryPointer] = useState<number>(-1);
    
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const terminalInputRef = useRef<HTMLInputElement>(null);

    // Update Trigger
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);

    // Creation State
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectType, setNewProjectType] = useState<VFSProject['type']>('REACT');

    // Load Projects on Mount
    useEffect(() => {
        setProjects(vfs.getProjects());
    }, []);

    // Init Terminal & CWD when project activates
    useEffect(() => {
        if (activeProject) {
            setCwdId(activeProject.rootFolderId);
            setTerminalLines([
                `\x1b[1;36mSilhouette OS Kernel v4.2.0\x1b[0m`, 
                `Type \x1b[1;33mhelp\x1b[0m for available commands.`,
                `Mounted VFS: /mnt/${activeProject.name.toLowerCase().replace(/\s/g, '-')}`
            ]);
            // Auto expand root
            setExpandedFolders(new Set([activeProject.rootFolderId]));
        }
    }, [activeProject]);

    // Auto-scroll terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalLines]);

    // Load active file content into editor when switching
    const activeFileNode = activeFileId ? vfs.getNode(activeFileId) : null;

    // --- ACTIONS ---

    const handleCreateProject = () => {
        if (!newProjectName) return;
        const p = vfs.createProject(newProjectName, newProjectType);
        setProjects(vfs.getProjects());
        setActiveProject(p);
        setIsCreatingProject(false);
        setNewProjectName('');
    };

    const handleOpenFile = (file: FileNode) => {
        if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles([...openFiles, file]);
        }
        setActiveFileId(file.id);
        setActiveTab('CODE'); // Switch to code view
    };

    const handleCloseFile = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        const newOpen = openFiles.filter(f => f.id !== fileId);
        setOpenFiles(newOpen);
        if (activeFileId === fileId) {
            setActiveFileId(newOpen.length > 0 ? newOpen[newOpen.length - 1].id : null);
        }
    };

    const handleFileChange = (content: string) => {
        if (!activeFileId) return;
        vfs.updateFile(activeFileId, content);
        setUnsavedChanges(prev => new Set(prev).add(activeFileId));
    };

    const handleSave = () => {
        if (activeFileId) {
            setUnsavedChanges(prev => {
                const next = new Set(prev);
                next.delete(activeFileId);
                return next;
            });
            logTerminal(`\x1b[32m✔ Saved ${activeFileNode?.name}\x1b[0m`);
        }
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    };

    const handleDeleteProject = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if(confirm("Delete project permanently from VFS?")) {
            vfs.deleteProject(id);
            setProjects(vfs.getProjects());
            if (activeProject?.id === id) setActiveProject(null);
        }
    };

    const handleCreateFile = (folderId: string) => {
        const name = prompt("File Name (e.g. Component.tsx):");
        if (name) {
            vfs.createFile(folderId, name, "// New file");
            // Force re-render of tree
            toggleFolder(folderId); 
            toggleFolder(folderId); 
            forceUpdate();
        }
    };

    const logTerminal = (msg: string) => {
        setTerminalLines(prev => [...prev, msg]);
    };

    const handleDownload = () => {
        if (!activeProject) return;
        const data = JSON.stringify(vfs.getFileTree(activeProject.rootFolderId), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeProject.name}_vfs_dump.json`;
        a.click();
        logTerminal("> Project packed and downloaded.");
    };

    // --- TERMINAL LOGIC ---

    const getPathString = (nodeId: string): string => {
        if (!activeProject || nodeId === activeProject.rootFolderId) return '~';
        let parts = [];
        let curr = vfs.getNode(nodeId);
        while(curr && curr.id !== activeProject.rootFolderId) {
            parts.unshift(curr.name);
            if (curr.parentId) curr = vfs.getNode(curr.parentId);
            else break;
        }
        return '~/' + parts.join('/');
    };

    const resolvePathNode = (startNodeId: string, pathStr: string): FileNode | null => {
        if (!pathStr || pathStr === '.') return vfs.getNode(startNodeId) || null;
        if (pathStr === '~') return vfs.getNode(activeProject!.rootFolderId) || null;
        
        const parts = pathStr.split('/').filter(p => p !== '' && p !== '.');
        let currentId = startNodeId;
        
        // Handle absolute path starting with ~ or /
        if (pathStr.startsWith('~') || pathStr.startsWith('/')) {
            currentId = activeProject!.rootFolderId;
            if (pathStr.startsWith('~/')) parts.shift(); // Remove ~
        }

        for (const part of parts) {
            if (part === '..') {
                const node = vfs.getNode(currentId);
                if (node?.parentId) currentId = node.parentId;
            } else {
                const children = vfs.getFileTree(currentId);
                const match = children.find(c => c.name === part);
                if (match) currentId = match.id;
                else return null;
            }
        }
        return vfs.getNode(currentId) || null;
    };

    const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            executeCommand(terminalInput);
            setCommandHistory(prev => [...prev, terminalInput]);
            setHistoryPointer(-1);
            setTerminalInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newPtr = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
                setHistoryPointer(newPtr);
                setTerminalInput(commandHistory[newPtr]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyPointer !== -1) {
                const newPtr = Math.min(commandHistory.length - 1, historyPointer + 1);
                setHistoryPointer(newPtr);
                setTerminalInput(commandHistory[newPtr]);
            } else {
                setTerminalInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const args = terminalInput.split(' ');
            const partial = args.pop() || '';
            const children = vfs.getFileTree(cwdId!);
            const match = children.find(c => c.name.startsWith(partial));
            if (match) {
                args.push(match.name + (match.type === 'FOLDER' ? '/' : ''));
                setTerminalInput(args.join(' '));
            }
        }
    };

    const executeCommand = (fullCmd: string) => {
        if (!fullCmd.trim()) return;
        
        // Check for redirection >
        const redirectSplit = fullCmd.split('>');
        const cmdPart = redirectSplit[0].trim();
        const redirectFile = redirectSplit.length > 1 ? redirectSplit[1].trim() : null;

        logTerminal(`\x1b[1;32m➜\x1b[0m \x1b[1;36m${getPathString(cwdId!)}\x1b[0m $ ${fullCmd}`);

        const [cmd, ...args] = cmdPart.split(' ').filter(Boolean);

        try {
            // Helper to get output content
            let output = '';
            
            switch (cmd) {
                case 'help':
                    output = 'Commands: ls, cd, pwd, mkdir, touch, rm, cat, echo, cp, mv, clear, npm';
                    break;
                case 'clear':
                    setTerminalLines([]);
                    return;
                case 'pwd':
                    output = getPathString(cwdId!);
                    break;
                case 'ls':
                    const targetPath = args[0] || '.';
                    const targetNode = resolvePathNode(cwdId!, targetPath);
                    if (targetNode && targetNode.type === 'FOLDER') {
                        const children = vfs.getFileTree(targetNode.id);
                        if (children.length === 0) output = '(empty)';
                        else {
                            output = children.map(c => 
                                c.type === 'FOLDER' 
                                ? `\x1b[1;34m${c.name}/\x1b[0m` 
                                : c.name
                            ).join('   ');
                        }
                    } else {
                        output = `ls: cannot access '${targetPath}': No such file or directory`;
                    }
                    break;
                case 'cd':
                    const cdPath = args[0] || '~';
                    const cdNode = resolvePathNode(cwdId!, cdPath);
                    if (cdNode && cdNode.type === 'FOLDER') {
                        setCwdId(cdNode.id);
                        setExpandedFolders(prev => new Set(prev).add(cdNode.id));
                    } else {
                        output = `cd: no such file or directory: ${cdPath}`;
                    }
                    break;
                case 'mkdir':
                    if (args[0]) {
                        vfs.createFolder(cwdId!, args[0]);
                        output = `Created directory: ${args[0]}`;
                        forceUpdate();
                    } else output = 'usage: mkdir <name>';
                    break;
                case 'touch':
                    if (args[0]) {
                        vfs.createFile(cwdId!, args[0], '');
                        output = `Created file: ${args[0]}`;
                        forceUpdate();
                    } else output = 'usage: touch <name>';
                    break;
                case 'echo':
                    output = args.join(' ').replace(/"/g, '');
                    break;
                case 'cat':
                    if (args[0]) {
                        const fileNode = resolvePathNode(cwdId!, args[0]);
                        if (fileNode && fileNode.type === 'FILE') output = fileNode.content || '';
                        else output = `cat: ${args[0]}: No such file`;
                    } else output = 'usage: cat <file>';
                    break;
                case 'rm':
                    if (args[0]) {
                        const delNode = resolvePathNode(cwdId!, args[0]);
                        if (delNode) {
                            vfs.deleteNode(delNode.id);
                            output = `Removed: ${args[0]}`;
                            forceUpdate();
                        } else output = `rm: cannot remove '${args[0]}': No such file`;
                    } else output = 'usage: rm <file>';
                    break;
                case 'cp':
                    // Real Copy implementation
                    if (args.length === 2) {
                        const src = resolvePathNode(cwdId!, args[0]);
                        if (src && src.type === 'FILE') {
                             vfs.createFile(cwdId!, args[1], src.content);
                             output = `Copied ${src.name} to ${args[1]}`;
                             forceUpdate();
                        } else output = `cp: cannot stat '${args[0]}'`;
                    } else output = 'usage: cp <source> <dest>';
                    break;
                case 'mv':
                    // Rename simulation (delete + create)
                     if (args.length === 2) {
                        const src = resolvePathNode(cwdId!, args[0]);
                        if (src) {
                            // Cloning content then deleting old
                            const content = src.type === 'FILE' ? src.content : '';
                            if (src.type === 'FILE') vfs.createFile(cwdId!, args[1], content);
                            else vfs.createFolder(cwdId!, args[1]); // Simplified folder move
                            vfs.deleteNode(src.id);
                            output = `Renamed ${args[0]} -> ${args[1]}`;
                            forceUpdate();
                        } else output = `mv: cannot stat '${args[0]}'`;
                     } else output = 'usage: mv <source> <dest>';
                    break;
                case 'npm':
                    if (args[0] === 'install' || args[0] === 'i') {
                        const pkg = args[1] || 'packages';
                        logTerminal(`\x1b[32m[npm] Installing ${pkg}...\x1b[0m`);
                        // Real VFS interaction: Create node_modules if not exists
                        let nm = resolvePathNode(activeProject!.rootFolderId, 'node_modules');
                        if (!nm) {
                             nm = vfs.createFolder(activeProject!.rootFolderId, 'node_modules');
                        }
                        if (args[1] && nm) {
                            vfs.createFolder(nm.id, args[1]);
                        }
                        forceUpdate();
                        setTimeout(() => {
                            logTerminal(`\x1b[32m+ ${pkg}@1.0.0\x1b[0m`);
                            logTerminal(`added 1 package in 450ms`);
                        }, 500);
                        return; // Async log handled above
                    } else if (args[0] === 'start') {
                        setActiveTab('PREVIEW');
                        output = '> vite dev server running...';
                    }
                    break;
                case 'whoami':
                    output = 'root';
                    break;
                case 'date':
                    output = new Date().toString();
                    break;
                default:
                    output = `Command not found: ${cmd}`;
            }

            // Handle Redirection >
            if (redirectFile) {
                vfs.createFile(cwdId!, redirectFile, output);
                logTerminal(`Redirected output to ${redirectFile}`);
                forceUpdate();
            } else if (output) {
                logTerminal(output);
            }

        } catch (e: any) {
            logTerminal(`\x1b[31mError: ${e.message}\x1b[0m`);
        }
    };

    // --- COMPONENTS ---

    const FileTreeItem: React.FC<{ node: FileNode, depth: number }> = ({ node, depth }) => {
        const isExpanded = expandedFolders.has(node.id);
        const isFile = node.type === 'FILE';
        const Icon = isFile 
            ? (node.name.endsWith('tsx') ? FileCode : node.name.endsWith('json') ? FileJson : File)
            : (isExpanded ? FolderOpen : FolderOpen); // Can use closed folder icon

        return (
            <div>
                <div 
                    className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-slate-800 text-xs ${activeFileId === node.id ? 'bg-cyan-900/20 text-cyan-400' : 'text-slate-400'} transition-colors`}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => isFile ? handleOpenFile(node) : toggleFolder(node.id)}
                >
                    {!isFile && (
                        <span className="text-slate-600">
                            {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        </span>
                    )}
                    {isFile && <span className="w-2.5" />} {/* Spacer */}
                    <Icon size={14} className={node.type === 'FOLDER' ? 'text-yellow-500' : 'text-blue-400'} />
                    <span className="truncate">{node.name}</span>
                    
                    {!isFile && (
                        <button 
                            className="ml-auto opacity-0 hover:opacity-100 text-slate-500 hover:text-green-400"
                            onClick={(e) => { e.stopPropagation(); handleCreateFile(node.id); }}
                            title="New File"
                        >
                            <Plus size={10} />
                        </button>
                    )}
                </div>
                {/* Recursive Children */}
                {!isFile && isExpanded && (
                    vfs.getFileTree(node.id).map(child => (
                        <FileTreeItem key={child.id} node={child} depth={depth + 1} />
                    ))
                )}
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

    // --- RENDER: PROJECT SELECTOR ---
    if (!activeProject) {
        return (
            <div className="h-full flex flex-col gap-6 p-8 items-center justify-center animate-in fade-in zoom-in-95">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                        <HardDrive size={40} className="text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dynamic Workspace V2</h1>
                    <p className="text-slate-400 mt-2">Select a VFS Project to mount the file system.</p>
                </div>

                {isCreatingProject ? (
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 w-full max-w-md backdrop-blur-sm">
                        <h3 className="text-white font-bold mb-4">Initialize New Project</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Project Name</label>
                                <input 
                                    autoFocus
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-cyan-500"
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    placeholder="my-awesome-app"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Tech Stack</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setNewProjectType('REACT')}
                                        className={`p-2 rounded border text-xs font-bold ${newProjectType === 'REACT' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                    >
                                        React + Vite
                                    </button>
                                    <button 
                                        onClick={() => setNewProjectType('NODE')}
                                        className={`p-2 rounded border text-xs font-bold ${newProjectType === 'NODE' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                    >
                                        Node.js API
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsCreatingProject(false)} className="flex-1 py-2 text-xs text-slate-400 hover:text-white">Cancel</button>
                                <button onClick={handleCreateProject} disabled={!newProjectName} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs disabled:opacity-50">Create Project</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* New Project Card */}
                        <button 
                            onClick={() => setIsCreatingProject(true)}
                            className="h-32 rounded-xl border border-dashed border-slate-700 bg-slate-900/20 hover:bg-slate-900/50 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-2 group transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                                <Plus size={20} className="text-slate-400 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-slate-400 group-hover:text-white">Create New Project</span>
                        </button>

                        {/* Existing Projects */}
                        {projects.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => setActiveProject(p)}
                                className="h-32 rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer relative group transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-white font-bold truncate pr-4">{p.name}</h3>
                                        <button 
                                            onClick={(e) => handleDeleteProject(e, p.id)}
                                            className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                                        {p.type === 'REACT' ? <Globe size={10} /> : <Server size={10} />}
                                        {p.type} Application
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono">
                                    Last opened: {new Date(p.lastOpened).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER: WORKSPACE ---
    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in">
            {/* Toolbar */}
            <div className="glass-panel p-2 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3 px-2">
                    <button onClick={() => setActiveProject(null)} className="text-slate-500 hover:text-white transition-colors" title="Back to Projects">
                        <LayoutTemplate size={18} />
                    </button>
                    <div className="h-4 w-px bg-slate-700 mx-1"></div>
                    <div>
                        <h1 className="text-sm font-bold text-white flex items-center gap-2">
                            {activeProject.name}
                            {unsavedChanges.size > 0 && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Unsaved Changes"/>}
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1"><HardDrive size={10}/> VFS Mounted</span>
                            <span className="flex items-center gap-1"><Cpu size={10}/> 12ms Latency</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs border border-slate-700 transition-all">
                        <Download size={12} /> Pack & Export
                    </button>
                    <div className="flex bg-slate-900 rounded p-1 border border-slate-800">
                        <button onClick={() => setActiveTab('CODE')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'CODE' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}>
                            <FileCode size={12} className="inline mr-1"/> Code
                        </button>
                        <button onClick={() => setActiveTab('PREVIEW')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'PREVIEW' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}>
                            <Play size={12} className="inline mr-1"/> Run
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Workspace Area */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                
                {/* File Explorer */}
                <div className="w-56 glass-panel rounded-xl flex flex-col overflow-hidden border-r border-slate-800">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Explorer</span>
                        <div className="flex gap-1">
                            <button className="text-slate-500 hover:text-white" onClick={() => handleCreateFile(activeProject.rootFolderId)} title="New File"><Plus size={12}/></button>
                            <button className="text-slate-500 hover:text-white" onClick={() => toggleFolder(activeProject.rootFolderId)} title="Refresh"><RefreshCcw size={12}/></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {/* Recursive Tree */}
                        <FileTreeItem node={vfs.getNode(activeProject.rootFolderId)!} depth={0} />
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950">
                    
                    {/* Tab Bar */}
                    <div className="h-9 bg-slate-950 flex items-end px-2 gap-1 overflow-x-auto border-b border-slate-800 no-scrollbar">
                        {openFiles.map(file => (
                            <div 
                                key={file.id}
                                onClick={() => handleOpenFile(file)}
                                className={`
                                    group flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] 
                                    text-xs border-t-2 cursor-pointer select-none transition-colors
                                    ${activeFileId === file.id 
                                        ? 'bg-slate-900 text-cyan-400 border-cyan-500 rounded-t-md' 
                                        : 'bg-slate-950 text-slate-500 border-transparent hover:bg-slate-900/50 hover:text-slate-300'}
                                `}
                            >
                                <span className={`truncate flex-1 ${unsavedChanges.has(file.id) ? 'italic' : ''}`}>{file.name}</span>
                                {unsavedChanges.has(file.id) && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                                <button 
                                    onClick={(e) => handleCloseFile(e, file.id)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative flex flex-col overflow-hidden">
                        {activeTab === 'CODE' ? (
                            activeFileNode ? (
                                <div className="flex-1 relative flex overflow-hidden">
                                    {/* Line Numbers Gutter */}
                                    <div className="w-10 bg-slate-950 border-r border-slate-800 text-slate-600 text-xs font-mono text-right py-4 pr-2 select-none opacity-50 overflow-hidden">
                                        {(activeFileNode.content || '').split('\n').map((_, i) => (
                                            <div key={i} className="leading-6">{i + 1}</div>
                                        ))}
                                    </div>
                                    {/* Editor Textarea */}
                                    <textarea 
                                        className="flex-1 bg-slate-900/30 p-4 font-mono text-sm text-slate-300 resize-none outline-none leading-6 whitespace-pre overflow-auto custom-scrollbar"
                                        value={activeFileNode.content || ''}
                                        onChange={(e) => handleFileChange(e.target.value)}
                                        spellCheck={false}
                                        onKeyDown={(e) => {
                                            // Smart Indent simulation
                                            if (e.key === 'Tab') {
                                                e.preventDefault();
                                                const start = e.currentTarget.selectionStart;
                                                const end = e.currentTarget.selectionEnd;
                                                const value = e.currentTarget.value;
                                                e.currentTarget.value = value.substring(0, start) + "  " + value.substring(end);
                                                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                                            }
                                            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                                                e.preventDefault();
                                                handleSave();
                                            }
                                        }}
                                    />
                                    {/* Save FAB */}
                                    {unsavedChanges.has(activeFileId!) && (
                                        <button 
                                            onClick={handleSave}
                                            className="absolute bottom-6 right-6 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                                            title="Save (Ctrl+S)"
                                        >
                                            <Save size={18} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                    <FileCode size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm">Select a file from Explorer to edit.</p>
                                    <p className="text-xs text-slate-700 mt-2">Ctrl+S to save changes.</p>
                                </div>
                            )
                        ) : (
                            // PREVIEW MODE
                            <div className="flex-1 bg-white relative overflow-auto">
                                <div className="absolute top-0 left-0 right-0 bg-slate-100 border-b border-slate-300 px-2 py-1 flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                    </div>
                                    <div className="bg-white px-2 py-0.5 rounded text-[10px] text-slate-500 border border-slate-200 flex-1 text-center font-mono">
                                        http://localhost:3000
                                    </div>
                                </div>
                                <div className="pt-8 h-full">
                                    {/* If it's React, try to compile 'src/App.tsx' if it exists, otherwise find something else */}
                                    <RuntimeApp 
                                        code={
                                            // Naive logic: look for App.tsx first
                                            vfs.getFileTree(activeProject.rootFolderId)
                                                .flatMap(node => node.children ? vfs.getFileTree(node.id) : [node]) // Flatten one level
                                                .find(f => f.name === 'App.tsx')?.content 
                                            || activeFileNode?.content 
                                            || "// Open App.tsx to see preview"
                                        } 
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interactive Terminal Pane */}
                    <div 
                        className="h-48 bg-black border-t border-slate-800 p-2 overflow-y-auto custom-scrollbar font-mono text-xs flex flex-col" 
                        onClick={() => terminalInputRef.current?.focus()}
                    >
                         <div className="flex items-center gap-2 text-slate-500 mb-1 sticky top-0 bg-black py-1 border-b border-slate-800/50">
                             <TerminalIcon size={12} /> Console Output
                         </div>
                         {terminalLines.map((line, i) => {
                             // Simple ANSI color parsing for "Realness"
                             const parts = line.split(/(\x1b\[[0-9;]*m)/g);
                             return (
                                 <div key={i} className="whitespace-pre-wrap break-all leading-tight mb-0.5">
                                    {parts.map((part, idx) => {
                                        if (part.startsWith('\x1b')) return null; // skip codes for now or handle them
                                        // Simple heuristic styling based on codes
                                        let className = "text-slate-400";
                                        if (line.includes('[32m') && !part.startsWith('\x1b')) className = "text-green-400";
                                        if (line.includes('[31m') && !part.startsWith('\x1b')) className = "text-red-400";
                                        if (line.includes('[36m') && !part.startsWith('\x1b')) className = "text-cyan-400";
                                        if (line.includes('[33m') && !part.startsWith('\x1b')) className = "text-yellow-400";
                                        
                                        return <span key={idx} className={className}>{part}</span>
                                    })}
                                    {parts.length === 1 && <span className="text-slate-400">{line}</span>}
                                 </div>
                             );
                         })}
                         
                         <div className="flex items-center gap-2 text-slate-300 mt-1">
                            <span className="text-green-500 font-bold">➜</span>
                            <span className="text-cyan-400">{getPathString(cwdId!)}</span>
                            <span className="text-slate-500">$</span>
                            <input 
                                ref={terminalInputRef}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-800"
                                value={terminalInput}
                                onChange={e => setTerminalInput(e.target.value)}
                                onKeyDown={handleTerminalKeyDown}
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </div>
                        <div ref={terminalEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicWorkspace;
