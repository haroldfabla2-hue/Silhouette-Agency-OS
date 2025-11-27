
import { DynamicInterfaceState, DynamicComponentSchema } from "../types";
import { DEFAULT_API_CONFIG } from "../constants";

// --- DYNAMIC UI SERVICE ---
// Handles fetching and parsing Server-Driven UI schemas.

class DynamicUiService {
    private baseUrl = `http://localhost:${DEFAULT_API_CONFIG.port}/v1`;
    private apiKey = DEFAULT_API_CONFIG.apiKey;

    public async getInterfaceState(): Promise<DynamicInterfaceState | null> {
        try {
            // Only fetch if backend is available
            const res = await fetch(`${this.baseUrl}/ui/state`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            // Backend offline - use local fallback or null
        }
        return null;
    }

    // Generate a default Schema for testing
    public getMockSchema(): DynamicComponentSchema {
        return {
            id: 'mock-crm',
            type: 'CONTAINER',
            props: { layout: 'col' },
            children: [
                {
                    id: 'header',
                    type: 'CARD',
                    props: { title: 'AI GENERATED PREVIEW (Mock)' },
                    children: [
                        {
                            id: 'stats',
                            type: 'REACT_APPLICATION',
                            props: {},
                            code: `
                            export default function App() {
                                const [count, setCount] = React.useState(0);
                                return (
                                    <div className="p-4 bg-slate-800 rounded text-center">
                                        <h2 className="text-xl font-bold text-white mb-4">Hello World from Runtime Compiler</h2>
                                        <p className="text-slate-400 mb-4">This component was compiled in your browser.</p>
                                        <button 
                                            onClick={() => setCount(c => c + 1)}
                                            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500"
                                        >
                                            Count: {count}
                                        </button>
                                    </div>
                                )
                            }
                            `
                        }
                    ]
                }
            ]
        };
    }
}

export const dynamicUi = new DynamicUiService();