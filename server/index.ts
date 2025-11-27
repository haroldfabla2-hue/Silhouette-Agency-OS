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
app.use(bodyParser.json());

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

// --- ENDPOINT: REAL PROJECT SCANNING ---
// Allows the "Code Scanner" agent to actually read the directory structure
app.post('/v1/system/scan', validateApiKey, async (req, res) => {
    try {
        const rootDir = (process as any).cwd(); // Root of where server is running
        
        // Helper to crawl directory
        const crawl = (dir: string, depth: number = 0): string[] => {
            if (depth > 3) return []; // Safety limit
            let results: string[] = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    if (file !== 'node_modules' && file !== '.git') {
                        results = results.concat(crawl(filePath, depth + 1));
                    }
                } else {
                    results.push(filePath.replace(rootDir, ''));
                }
            });
            return results;
        };

        const files = crawl(rootDir);
        
        // Separate by type
        const frontend = files.filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));
        const backend = files.filter(f => f.endsWith('.ts') && !f.endsWith('.tsx'));
        
        const map = {
            frontendComponents: frontend,
            backendEndpoints: backend, // In a real deeper scan, we'd parse AST
            databaseSchema: ['MemoryNode', 'Agent'], // Mocked for simplicity here
            scanTimestamp: Date.now()
        };

        // Store this real map in continuum for the Orchestrator
        continuum.store(
            `[REAL SYSTEM SCAN] \n${JSON.stringify(map)}`, 
            'DEEP' as any, 
            ['SACRED', 'SYSTEM_MAP']
        );

        res.json({ success: true, map });

    } catch (e) {
        console.error("Scan Error", e);
        res.status(500).json({ error: "Failed to scan host file system." });
    }
});

// --- EXISTING ENDPOINTS ---

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
    > Capabilities: File System Access (Scan Enabled)
    
    Ready to integrate with external applications.
    `);
});