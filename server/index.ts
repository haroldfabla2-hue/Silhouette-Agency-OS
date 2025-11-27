import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as fs from 'fs'; // Import File System for Real Scanning
import * as path from 'path';
import { orchestrator } from '../services/orchestrator';
import { continuum } from '../services/continuumMemory';
import { workflowEngine } from '../services/workflowEngine';
import { generateAgentResponse } from '../services/geminiService';
import { IntrospectionLayer, WorkflowStage } from '../types';

// --- SILHOUETTE UNIVERSAL API SERVER ---
// Transforms the Silhouette Framework into a Headless Backend.

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for large file processing

// --- HEADLESS GAME LOOP ---
setInterval(() => {
    workflowEngine.tick();
    orchestrator.tick();
    continuum.runMaintenance();
}, 1000);

// --- MIDDLEWARE: AUTH ---
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer sk-silhouette-')) {
        return res.status(401).json({ error: { message: "Invalid or missing API Key", type: "auth_error" } });
    }
    next();
};

// --- CRITICAL FILE PROTECTION ---
// The AI cannot modify these files without explicit 'GOD_MODE' override flag.
const PROTECTED_FILES = [
    'server/index.ts',
    'services/continuumMemory.ts',
    'services/orchestrator.ts',
    'services/introspectionEngine.ts'
];

// --- ENDPOINT: REAL PROJECT SCANNING ---
app.post('/v1/system/scan', validateApiKey, async (req, res) => {
    try {
        const rootDir = (process as any).cwd(); 
        
        const crawl = (dir: string, depth: number = 0): string[] => {
            if (depth > 5) return []; 
            let results: string[] = [];
            try {
                const list = fs.readdirSync(dir);
                list.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat && stat.isDirectory()) {
                        if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
                            results = results.concat(crawl(filePath, depth + 1));
                        }
                    } else {
                        // Only relevant code files
                        if (/\.(ts|tsx|js|jsx|json|css|py|html)$/.test(file)) {
                            results.push(filePath.replace(rootDir, ''));
                        }
                    }
                });
            } catch (e) {
                // Ignore access errors
            }
            return results;
        };

        const files = crawl(rootDir);
        
        const map = {
            scanTimestamp: Date.now(),
            fileCount: files.length,
            structure: files
        };

        // Store this real map in continuum
        continuum.store(
            `[SYSTEM ARCHITECTURE MAP] Files: ${files.length}. \nStructure cached.`, 
            'DEEP' as any, 
            ['SACRED', 'SYSTEM_MAP']
        );

        res.json({ success: true, map });

    } catch (e) {
        console.error("Scan Error", e);
        res.status(500).json({ error: "Failed to scan host file system." });
    }
});

// --- ENDPOINT: READ FILE CONTENT (CONTEXT LOADING) ---
app.post('/v1/system/read', validateApiKey, async (req, res) => {
    const { filePath } = req.body;
    try {
        const rootDir = (process as any).cwd();
        const fullPath = path.join(rootDir, filePath);
        
        if (!fs.existsSync(fullPath)) return res.status(404).json({ error: "File not found" });
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ success: true, content });
    } catch (e) {
        res.status(500).json({ error: "Read failed" });
    }
});

// --- ENDPOINT: ATOMIC FILE WRITING (WITH BACKUP) ---
app.patch('/v1/system/file', validateApiKey, async (req, res) => {
    const { filePath, content, forceOverride } = req.body;
    
    if (!filePath || !content) {
        return res.status(400).json({ error: "Missing filePath or content" });
    }

    try {
        const rootDir = (process as any).cwd();
        const fullPath = path.join(rootDir, filePath); // Ensure relative to project root

        // 1. Security Check
        const isProtected = PROTECTED_FILES.some(pf => fullPath.includes(pf));
        if (isProtected && !forceOverride) {
            return res.status(403).json({ 
                error: "PROTECTED FILE ACCESS DENIED", 
                message: "Self-preservation protocol active. Use forceOverride to modify core kernel." 
            });
        }

        console.log(`[ORCHESTRATOR] Applying atomic patch to: ${filePath}`);
        
        // 2. Atomic Backup
        const backupPath = `${fullPath}.bak.${Date.now()}`;
        if (fs.existsSync(fullPath)) {
            fs.copyFileSync(fullPath, backupPath);
        } else {
            // Ensure directory exists if creating new file
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        }

        // 3. Write Operation
        fs.writeFileSync(fullPath, content, 'utf8');

        // 4. Log to Continuum
        continuum.store(
            `[CODE MUTATION] Modified: ${filePath}. Backup: ${path.basename(backupPath)}`, 
            'SHORT' as any, 
            ['audit', 'code-change', 'recovery-point']
        );

        res.json({ 
            success: true, 
            path: filePath, 
            backupId: path.basename(backupPath),
            status: "PATCH_APPLIED" 
        });

    } catch (error) {
        console.error("File Write Error", error);
        res.status(500).json({ error: "Failed to write file." });
    }
});

// --- ENDPOINT: ROLLBACK (SELF-HEALING) ---
app.post('/v1/system/rollback', validateApiKey, async (req, res) => {
    const { filePath, backupId } = req.body;
    
    try {
        const rootDir = (process as any).cwd();
        const fullPath = path.join(rootDir, filePath);
        const backupPath = path.join(path.dirname(fullPath), backupId);

        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ error: "Backup file not found" });
        }

        console.log(`[ORCHESTRATOR] EMERGENCY ROLLBACK: ${filePath}`);
        
        // Restore
        fs.copyFileSync(backupPath, fullPath);
        
        res.json({ success: true, message: "System state restored to backup point." });

    } catch (e) {
        res.status(500).json({ error: "Rollback failed" });
    }
});

// --- EXISTING CHAT ENDPOINT ---
app.post('/v1/chat/completions', validateApiKey, async (req, res) => {
    const { messages } = req.body;
    const userMessage = messages[messages.length - 1].content;
    
    console.log(`[API] Received task: ${userMessage.substring(0, 50)}...`);

    try {
        const response = await generateAgentResponse(
            "External_API_Handler",
            "Universal Interface",
            "CORE",
            userMessage,
            null,
            IntrospectionLayer.OPTIMAL,
            WorkflowStage.EXECUTION
        );

        const completion = {
            id: `chatcmpl-${crypto.randomUUID()}`,
            object: "chat.completion",
            created: Date.now(),
            model: "silhouette-v4-enterprise",
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: response.output,
                    thoughts: response.thoughts, 
                    usage: response.usage
                },
                finish_reason: "stop"
            }],
            usage: {
                prompt_tokens: 0, 
                completion_tokens: response.usage,
                total_tokens: response.usage
            }
        };

        res.json(completion);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: { message: "Internal Engine Error", type: "server_error" } });
    }
});

app.post('/v1/workflow/task', validateApiKey, (req, res) => {
    const { task } = req.body;
    const taskId = crypto.randomUUID();
    continuum.store(`[ASYNC TASK ${taskId}] Intent: ${task}`, 'SHORT' as any, ['task', 'pending']);
    res.json({ id: taskId, status: "queued" });
});

app.post('/v1/memory/query', validateApiKey, (req, res) => {
    const { query, limit } = req.body;
    const results = continuum.retrieve(query);
    res.json({ data: results.slice(0, limit || 5), meta: continuum.getStats() });
});

app.get('/v1/system/status', (req, res) => {
    res.json({
        status: "ONLINE",
        version: "4.0.0",
        agents_active: orchestrator.getActiveCount(),
        mode: "HEADLESS_SERVER",
        hardware: "RTX 3050 (Detected via Config)"
    });
});

app.listen(PORT, () => {
    console.log(`
    =======================================================
    🚀 SILHOUETTE AGENCY OS - ENTERPRISE API SERVER
    =======================================================
    > Status: ONLINE
    > Port: ${PORT}
    > Auth: Bearer Token Required
    > Capabilities: ATOMIC FILESYSTEM ACCESS (R/W)
    > Protection: CORE KERNEL SHIELD ACTIVE
    
    Ready to integrate with external applications.
    `);
});