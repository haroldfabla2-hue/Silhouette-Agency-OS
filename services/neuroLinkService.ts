
import { NeuroLinkNode, NeuroLinkStatus, SystemProtocol } from "../types";
import { systemBus } from "./systemBus";

// --- NEURO-LINK SERVICE V1.0 ---
// The connection layer of the Hive Mind.
// Manages real-time WebSocket tunnels to deployed child applications.

export class NeuroLinkService {
    private nodes: Map<string, NeuroLinkNode> = new Map();
    private socketSimulationInterval: any;

    constructor() {
        this.startDiscovery();
    }

    public registerNode(projectId: string, url: string) {
        if (this.nodes.has(projectId)) return;

        const node: NeuroLinkNode = {
            id: `neuro-${crypto.randomUUID().substring(0,8)}`,
            projectId,
            url,
            status: NeuroLinkStatus.HANDSHAKE,
            latency: 0,
            lastHeartbeat: Date.now(),
            resources: { cpu: 0, memory: 0 }
        };

        this.nodes.set(projectId, node);
        systemBus.emit(SystemProtocol.NEURO_LINK_HANDSHAKE, { projectId, status: 'INIT' });

        // Simulate WebSocket Handshake
        setTimeout(() => {
            node.status = NeuroLinkStatus.CONNECTED;
            systemBus.emit(SystemProtocol.HIVE_MIND_SYNC, { projectId, message: 'Neuro-Link Tunnel Established' });
        }, 2000);
    }

    public getNodes(): NeuroLinkNode[] {
        return Array.from(this.nodes.values());
    }

    public sendRPC(projectId: string, method: string, payload: any) {
        const node = this.nodes.get(projectId);
        if (!node || node.status !== NeuroLinkStatus.CONNECTED) {
            console.warn(`[NEURO-LINK] Cannot send RPC to ${projectId}: Node not connected.`);
            return;
        }
        
        console.log(`[NEURO-LINK] RPC >>> ${node.url} [${method}]`, payload);
        // In V2, this would be: this.socket.send(JSON.stringify({ method, payload }));
    }

    // Returns the SDK code to be injected into child apps
    public getSDKCode(projectId: string): string {
        return `
// --- SILHOUETTE NEURO-LINK SDK v2.0 ---
// Injected by Genesis Factory. Bypasses local styles via Shadow DOM.

(function() {
    console.log("[NEURO-LINK] Initializing Ghost Shell...");
    const PROJECT_ID = "${projectId}";
    const SERVER_URL = "wss://silhouette-central.internal"; // WebSocket Endpoint

    // 1. Create Shadow Host (The Invisible Container)
    const host = document.createElement('div');
    host.id = 'silhouette-neuro-root';
    host.style.position = 'fixed';
    host.style.zIndex = '999999';
    host.style.top = '0';
    host.style.right = '0';
    host.style.pointerEvents = 'none'; // Passthrough until active
    document.body.appendChild(host);

    // 2. Attach Shadow DOM (Style Isolation)
    const shadow = host.attachShadow({ mode: 'open' });

    // 3. Inject "Ghost Shell" UI
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.padding = '10px';
    container.style.background = 'rgba(15, 23, 42, 0.9)';
    container.style.backdropFilter = 'blur(10px)';
    container.style.border = '1px solid #06b6d4';
    container.style.borderRadius = '8px';
    container.style.color = '#fff';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '12px';
    container.style.boxShadow = '0 0 20px rgba(6,182,212,0.3)';
    container.style.pointerEvents = 'auto';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';

    container.innerHTML = \`
        <div style="width:8px;height:8px;background:#22d3ee;border-radius:50%;animation:pulse 2s infinite"></div>
        <span>SILHOUETTE LINK: ACTIVE</span>
    \`;

    const style = document.createElement('style');
    style.textContent = \`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    \`;

    shadow.appendChild(style);
    shadow.appendChild(container);

    // 4. WebSocket Simulation
    setInterval(() => {
        // Send Telemetry
        const perf = window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
        console.debug("[NEURO-LINK] Sending heartbeat... Mem: " + (perf / 1024 / 1024).toFixed(2) + "MB");
    }, 5000);

})();
        `;
    }

    private startDiscovery() {
        this.socketSimulationInterval = setInterval(() => {
            this.nodes.forEach(node => {
                if (node.status === NeuroLinkStatus.CONNECTED) {
                    // Fluctuate telemetry
                    node.latency = 10 + Math.random() * 20;
                    node.resources.cpu = 10 + Math.random() * 40;
                    node.resources.memory = 200 + Math.random() * 100;
                    node.lastHeartbeat = Date.now();
                }
            });
        }, 1000);
    }
}

export const neuroLink = new NeuroLinkService();
