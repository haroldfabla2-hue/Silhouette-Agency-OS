
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
import { neuroLink } from '../services/neuroLinkService';
import { IntrospectionLayer, WorkflowStage, ChatMessage, DynamicInterfaceState, GenesisProject, GenesisConfig, UserRole } from '../types';

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_FILE = './silhouette_memory_db.json';
const CHAT_HISTORY_FILE = './silhouette_chat_history.json';
const UI_STATE_FILE = './silhouette_ui_state.json';
const GENESIS_DB_FILE = './silhouette_genesis_db.json';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

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

app.get('/v1/factory/config', validateApiKey, (req, res) => {
    res.json(genesisConfig);
});

app.post('/v1/factory/config', validateApiKey, (req, res) => {
    const { config } = req.body;
    genesisConfig = { ...genesisConfig, ...config };
    const rootDir = (process as any).cwd();
    const wsPath = path.join(rootDir, genesisConfig.workspaceRoot);
    if (!fs.existsSync(wsPath)) {
        fs.mkdirSync(wsPath, { recursive: true });
    }
    saveStateToDisk();
    res.json({ success: true, config: genesisConfig });
});

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

        res.json({ success: true, project: newProject });

        console.log(`[GENESIS] Spawning ${name} in ${projectPath}...`);
        
        const templateFlag = template === 'REACT_VITE' ? '--template react' : '';
        
        // 1. SCAFFOLD
        exec(`npm create vite@latest ${name} -- ${templateFlag} -y`, { cwd: wsPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[GENESIS] Spawn Error: ${error.message}`);
                const p = genesisProjects.find(pr => pr.id === newProject.id);
                if(p) p.status = 'ERROR';
                return;
            }
            
            // 2. INSTALL
            exec(`npm install`, { cwd: projectPath }, (error, stdout, stderr) => {
                // 3. INJECT NEURO-LINK SDK
                if (genesisConfig.allowBridgeInjection) {
                    try {
                        // The Neuro-Link SDK Logic
                        const sdkCode = neuroLink.getSDKCode(name.toLowerCase());
                        
                        // Inject into index.html for auto-boot
                        const indexPath = path.join(projectPath, 'index.html');
                        if (fs.existsSync(indexPath)) {
                            let indexHtml = fs.readFileSync(indexPath, 'utf-8');
                            indexHtml = indexHtml.replace('</body>', `<script>${sdkCode}</script></body>`);
                            fs.writeFileSync(indexPath, indexHtml);
                        }
                    } catch (err) {
                        console.error("SDK Injection Failed", err);
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

app.get('/v1/factory/list', validateApiKey, (req, res) => {
    res.json(genesisProjects);
});

// --- STANDARD ENDPOINTS ---

app.post('/v1/system/scan', validateApiKey, async (req, res) => {
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

app.get('/v1/chat/history', validateApiKey, (req, res) => res.json(chatHistory));

app.post('/v1/chat/completions', validateApiKey, async (req, res) => {
    const { messages } = req.body;
    const userMessage = messages[messages.length - 1].content;
    chatHistory.push({ id: crypto.randomUUID(), role: 'user', text: userMessage, timestamp: Date.now() });
    
    try {
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

app.get('/v1/system/status', (req, res) => {
    res.json({ status: "ONLINE", mode: "HIVE_MIND_SERVER", nodes: neuroLink.getNodes().length });
});

app.listen(PORT, () => {
    console.log(`[SILHOUETTE HIVE MIND] Server running on port ${PORT}`);
});
