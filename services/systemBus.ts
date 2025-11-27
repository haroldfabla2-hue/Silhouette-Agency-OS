
import { ProtocolEvent, SystemProtocol } from "../types";

// --- SYSTEM BUS V1.0 ---
// The Central Nervous System for Silhouette.
// Enables Event-Driven Architecture for Protocols and Real-Time Updates.

type EventHandler = (event: ProtocolEvent) => void;

class SystemBus {
    private listeners: Record<string, EventHandler[]> = {};
    private eventLog: ProtocolEvent[] = [];

    constructor() {
        console.log("[SYSTEM BUS] Nervous System Initialized.");
    }

    public subscribe(protocol: SystemProtocol, handler: EventHandler) {
        if (!this.listeners[protocol]) {
            this.listeners[protocol] = [];
        }
        this.listeners[protocol].push(handler);
        
        // Return unsubscribe function
        return () => {
            this.listeners[protocol] = this.listeners[protocol].filter(h => h !== handler);
        };
    }

    public emit(protocol: SystemProtocol, payload: any, initiator: string = 'SYSTEM') {
        const event: ProtocolEvent = {
            type: protocol,
            payload,
            timestamp: Date.now(),
            initiator
        };

        // Log for terminal
        this.eventLog.push(event);
        if (this.eventLog.length > 100) this.eventLog.shift();

        console.log(`[BUS] Emitting ${protocol} from ${initiator}`, payload);

        if (this.listeners[protocol]) {
            this.listeners[protocol].forEach(handler => {
                try {
                    handler(event);
                } catch (e) {
                    console.error(`[BUS] Error in handler for ${protocol}`, e);
                }
            });
        }
    }

    public getRecentEvents(): ProtocolEvent[] {
        return this.eventLog;
    }
}

export const systemBus = new SystemBus();
