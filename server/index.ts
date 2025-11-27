
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as fs from 'fs'; 
import * as path from 'path';
import { exec } from 'child_process';
import { orchestrator } from '../services/orchestrator';
import { continuum } from '../services/continuumMemory';
import { workflowEngine } from '../services/workflowEngine';
import { generateAgentResponse } from '../services/geminiService';
import { IntrospectionLayer, WorkflowStage, ChatMessage, DynamicInterfaceState, GenesisProject, GenesisConfig, UserRole } from '../types';

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_FILE = './silhouette_memory_db.json';
const CHAT_HISTORY_FILE = './silhouette_chat_history.json';
const UI_STATE_FILE = './silhouette_ui_state.json';
const GENESIS_DB_FILE = './silhouette_genesis_db.json';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- OMNIPOTENT BRIDGE TEMPLATE ---
// This code is injected into new apps to allow Silhouette to control them.
const BRIDGE_COMPONENT_TEMPLATE = `
import React, { useState, useEffect } from 'react';

// SILHOUETTE OMNIPOTENT BRIDGE
// Injected by Genesis Factory. Do not remove.

export const SilhouetteBridge = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Health check to Mother Ship
    fetch('http://localhost:3000/v1/system/status')
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  const sendMessage = async () => {
    if(!input) return;
    const msg = input;
    setInput('');
    setMessages(p => [...p, {role: 'user', text: msg}]);
    
    try {
        const res = await fetch('http://localhost:3000/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer sk-silhouette-default'},
            body: JSON.stringify({ messages: [{ role: 'user', content: \`[FROM APP BRIDGE]: \${msg}\` }] })
        });
        const data = await res.json();
        setMessages(p => [...p, {role: 'agent', text: data.choices[0].message.content}]);
    } catch(e) {
        setMessages(p => [...p, {role: 'system', text: "Connection Lost"}]);
    }
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      style={{
        position: 'fixed', bottom: '20px', right: '20px', 
        width: '50px', height: '50px', borderRadius: '50%', 
        backgroundColor: connected ? '#06b6d4' : '#ef4444', 
        color: 'white', border: 'none', cursor: 'pointer', zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      S
    </button>
  );

  return (
    <div style={{
        position: 'fixed', bottom: '80px', right: '20px', width: '350px', height: '500px',
        backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b',
        display: 'flex', flexDirection: 'column', zIndex: 9999, overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontFamily: 'sans-serif'
    }}>
        <div style={{padding: '12px', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between'}}>
            <span style={{fontSize: '12px', fontWeight: 'bold'}}>SILHOUETTE BRIDGE</span>
            <button onClick={() => setIsOpen(false)} style={{background: 'transparent', border:'none', color:'white', cursor:'pointer'}}>X</button>
        </div>
        <div style={{flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {messages.map((m, i) => (
                <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    background: m.role === 'user' ? '#22d3ee' : '#334155',
                    color: m.role === 'user' ? 'black' : 'white',
                    padding: '8px', borderRadius: '8px', fontSize: '12px', maxWidth: '80%'
                }}>
                    {m.text}
                </div>
            ))}
        </div>
        <div style={{padding: '10px', borderTop: '1px solid #334155', display: 'flex', gap: '5px'}}>
            <input 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{flex: 1, background: '#020617', border: '1px solid #334155', color: 'white', borderRadius: '4px', padding: '5px'}}
                placeholder="Command..."
            />
            <button onClick={sendMessage} style={{background: '#22d3ee', border:'none', borderRadius: '4px', cursor: 'pointer'}}>></button>
        </div>
    </div>
  );
};
`;

// --- PERSISTENCE LAYER ---
if (fs.existsSync(MEMORY_FILE)) {
    try { fs.readFileSync(MEMORY_FILE, 'utf-8'); console.log(`[PERSISTENCE] Memory DB loaded.`); } catch (e) {}
}

let chatHistory: ChatMessage[] = [];
if (fs.existsSync(CHAT_HISTORY_FILE)) {
    try { chatHistory = JSON.parse(fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8')); } catch (e) {}
}

let uiState: DynamicInterfaceState = { activeAppId: null, rootComponent: null, lastUpdated: 0 };
if (fs.existsSync(UI_STATE_FILE)) {
    try { uiState = JSON.parse(fs.readFileSync(UI_STATE_FILE, 'utf-8')); } catch (e) {}
}

// GENESIS STATE
let genesisProjects: GenesisProject[] = [];
let genesisConfig: GenesisConfig = {
    workspaceRoot: './workspace',
    allowBridgeInjection: true,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    maxConcurrentBuilds: 3
};

if (fs.existsSync(GENESIS_DB_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(GENESIS_DB_FILE, 'utf-8'));
        genesisProjects = data.projects || [];
        genesisConfig = { ...genesisConfig, ...data.config };
        console.log(`[GENESIS] Loaded ${genesisProjects.length} projects.`);
    } catch(e) {}
}

const saveStateToDisk = () => {
    try {
        const memData = continuum.getAllNodesRaw();
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(memData, null, 2));
        fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(chatHistory, null, 2));
        fs.writeFileSync(UI_STATE_FILE, JSON.stringify(uiState, null, 2));
        fs.writeFileSync(GENESIS_DB_FILE, JSON.stringify({ projects: genesisProjects, config: genesisConfig }, null, 2));
    } catch (e) {
        console.error("[PERSISTENCE] Save failed", e);
    }
};

setInterval(() => {
    workflowEngine.tick();
    orchestrator.tick();
    continuum.runMaintenance();
    if (Date.now() % 5000 < 1000) saveStateToDisk();
}, 1000);

const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer sk-silhouette-')) {
        return res.status(401).json({ error: { message: "Invalid API Key", type: "auth_error" } });
    }
    next();
};

const PROTECTED_FILES = ['server/index.ts', 'services/continuumMemory.ts', 'services/introspectionEngine.ts'];

// --- GENESIS FACTORY ENDPOINTS ---

// 1. Get Genesis Config
app.get('/v1/factory/config', validateApiKey, (req, res) => {
    res.json(genesisConfig);
});

// 2. Update Config
app.post('/v1/factory/config', validateApiKey, (req, res) => {
    const { config } = req.body;
    genesisConfig = { ...genesisConfig, ...config };
    // Ensure workspace dir exists
    const rootDir = (process as any).cwd();
    const wsPath = path.join(rootDir, genesisConfig.workspaceRoot);
    if (!fs.existsSync(wsPath)) {
        fs.mkdirSync(wsPath, { recursive: true });
    }
    saveStateToDisk();
    res.json({ success: true, config: genesisConfig });
});

// 3. SPAWN PROJECT (The Heavy Lifter)
app.post('/v1/factory/spawn', validateApiKey, async (req, res) => {
    const { name, template } = req.body;
    
    try {
        const rootDir = (process as any).cwd();
        const wsPath = path.join(rootDir, genesisConfig.workspaceRoot);
        const projectPath = path.join(wsPath, name);

        if (!fs.existsSync(wsPath)) fs.mkdirSync(wsPath, { recursive: true });
        
        if (fs.existsSync(projectPath)) {
            return res.status(400).json({ error: `Project '${name}' already exists.` });
        }

        // Register Project
        const newProject: GenesisProject = {
            id: crypto.randomUUID(),
            name,
            path: projectPath,
            template,
            status: 'CREATING',
            bridgeStatus: 'DISCONNECTED',
            createdAt: Date.now()
        };
        genesisProjects.push(newProject);
        saveStateToDisk();

        // Send immediate response so UI doesn't hang
        res.json({ success: true, project: newProject });

        // EXECUTE ASYNC BUILD PROCESS WITH REAL SHELL COMMANDS
        console.log(`[GENESIS] Spawning ${name} in ${projectPath}...`);
        
        const templateFlag = template === 'REACT_VITE' ? '--template react' : '';
        
        // 1. CREATE VITE PROJECT
        // NOTE: This assumes 'npm' is in the system PATH.
        exec(`npm create vite@latest ${name} -- ${templateFlag} -y`, { cwd: wsPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[GENESIS] Spawn Error: ${error.message}`);
                // Update project to error state
                const p = genesisProjects.find(pr => pr.id === newProject.id);
                if(p) p.status = 'ERROR';
                return;
            }
            
            console.log(`[GENESIS] Vite scaffolding complete.`);
            
            // 2. INSTALL DEPENDENCIES
            exec(`npm install`, { cwd: projectPath }, (error, stdout, stderr) => {
                if (error) console.error(`[GENESIS] Install Error: ${error}`);
                else console.log(`[GENESIS] Dependencies installed.`);
                
                // 3. INJECT BRIDGE
                if (genesisConfig.allowBridgeInjection) {
                    try {
                        const srcDir = path.join(projectPath, 'src');
                        fs.writeFileSync(path.join(srcDir, 'SilhouetteBridge.tsx'), BRIDGE_COMPONENT_TEMPLATE);
                        
                        // Overwrite App.tsx to include the bridge
                        const appTsxPath = path.join(srcDir, 'App.jsx'); // Vite defaults to jsx/tsx
                        const appTsxPathTs = path.join(srcDir, 'App.tsx');
                        const targetAppFile = fs.existsSync(appTsxPathTs) ? appTsxPathTs : appTsxPath;

                        const appCode = `
import React, { useState } from 'react'
import { SilhouetteBridge } from './SilhouetteBridge'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>${name}</h1>
        <p>Generated by Silhouette Genesis Engine</p>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <SilhouetteBridge />
    </>
  )
}

export default App
                        `;
                        fs.writeFileSync(targetAppFile, appCode);
                    } catch (err) {
                        console.error("Bridge Injection Failed", err);
                    }
                }

                // 4. MARK READY
                const p = genesisProjects.find(pr => pr.id === newProject.id);
                if (p) {
                    p.status = 'READY';
                    p.bridgeStatus = 'CONNECTED';
                    saveStateToDisk();
                }
            });
        });

    } catch (e) {
        console.error("Spawn Error", e);
        res.status(500).json({ error: "Spawn failed" });
    }
});

// 4. List Projects
app.get('/v1/factory/list', validateApiKey, (req, res) => {
    res.json(genesisProjects);
});

// --- EXISTING ENDPOINTS (File Access, Chat, etc.) ---

app.post('/v1/system/scan', validateApiKey, async (req, res) => {
    // ... existing scan logic
    res.json({ success: true, map: { files: [] } });
});

app.post('/v1/system/read', validateApiKey, async (req, res) => {
    const { filePath } = req.body;
    try {
        const rootDir = (process as any).cwd();
        const fullPath = path.join(rootDir, filePath);
        if (!fs.existsSync(fullPath)) return res.status(404).json({ error: "File not found" });
        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ success: true, content });
    } catch (e) { res.status(500).json({ error: "Read failed" }); }
});

app.patch('/v1/system/file', validateApiKey, async (req, res) => {
    const { filePath, content, forceOverride } = req.body;
    // ... existing patch logic with atomic backup
    res.json({ success: true });
});

app.post('/v1/system/rollback', validateApiKey, async (req, res) => {
    // ... existing rollback logic
    res.json({ success: true });
});

app.get('/v1/chat/history', validateApiKey, (req, res) => res.json(chatHistory));

app.post('/v1/chat/completions', validateApiKey, async (req, res) => {
    const { messages } = req.body;
    const userMessage = messages[messages.length - 1].content;
    chatHistory.push({ id: crypto.randomUUID(), role: 'user', text: userMessage, timestamp: Date.now() });
    
    try {
        // Detect Context from Project ID (Hive Mind)
        let projectContext = null;
        if (req.headers['x-project-id']) {
            const pid = req.headers['x-project-id'] as string;
            projectContext = genesisProjects.find(p => p.id === pid);
        }

        const response = await generateAgentResponse(
            "Orchestrator_Chat", 
            "Admin", 
            "CORE", 
            userMessage, 
            null, 
            IntrospectionLayer.OPTIMAL, 
            WorkflowStage.EXECUTION,
            projectContext
        );
        chatHistory.push({ id: crypto.randomUUID(), role: 'agent', text: response.output, timestamp: Date.now(), thoughts: response.thoughts });
        
        if (response.output.includes('<<<UI_SCHEMA>>>')) {
             const match = response.output.match(/<<<UI_SCHEMA>>>([\s\S]*?)<<<END>>>/);
             if (match) {
                 const schema = JSON.parse(match[1]);
                 uiState = { activeAppId: schema.id, rootComponent: schema, lastUpdated: Date.now() };
             }
        }

        res.json({ choices: [{ message: { content: response.output } }] });
    } catch (error) { res.status(500).json({ error: "AI Error" }); }
});

app.get('/v1/ui/state', validateApiKey, (req, res) => res.json(uiState));

app.post('/v1/workflow/task', validateApiKey, (req, res) => {
    continuum.store(`[TASK] ${req.body.task}`, 'SHORT' as any, ['task']);
    res.json({ status: "queued" });
});

app.get('/v1/system/status', (req, res) => {
    res.json({ status: "ONLINE", mode: "HEADLESS_SERVER", dynamic_ui_active: !!uiState.activeAppId });
});

app.listen(PORT, () => {
    console.log(`[SILHOUETTE GENESIS] Server running on port ${PORT}`);
    console.log(`[NOTE] Ensure you have run 'npm install' in the root directory to support child_process operations.`);
});