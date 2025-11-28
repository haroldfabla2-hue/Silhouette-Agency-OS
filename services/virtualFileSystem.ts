

import { FileNode, FileType, VFSProject, SystemProtocol } from "../types";
import { systemBus } from "./systemBus";

// --- VIRTUAL FILE SYSTEM (VFS) ---
// Emulates a physical SSD within the browser's LocalStorage.
// Supports hierarchical file structures, persistence, and CRUD operations.

class VirtualFileSystem {
    private projects: VFSProject[] = [];
    private fileNodes: Map<string, FileNode> = new Map();
    private readonly STORAGE_KEY_PROJECTS = 'silhouette_vfs_projects';
    private readonly STORAGE_KEY_NODES = 'silhouette_vfs_nodes';

    constructor() {
        this.loadFromStorage();
        if (this.projects.length === 0) {
            this.seedDemoProject();
        }
    }

    // --- PROJECT MANAGEMENT ---

    public getProjects(): VFSProject[] {
        return this.projects;
    }

    public createProject(name: string, type: VFSProject['type']): VFSProject {
        const rootId = crypto.randomUUID();
        const project: VFSProject = {
            id: crypto.randomUUID(),
            name,
            type,
            rootFolderId: rootId,
            createdAt: Date.now(),
            lastOpened: Date.now()
        };

        // Create Root Folder Node
        const rootNode: FileNode = {
            id: rootId,
            name: 'root',
            type: 'FOLDER',
            parentId: null,
            children: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.projects.push(project);
        this.fileNodes.set(rootId, rootNode);
        
        // Scaffold basic files based on template
        this.scaffoldProject(rootId, type);
        
        this.saveToStorage();
        
        // Notify System of Filesystem Change
        systemBus.emit(SystemProtocol.FILESYSTEM_UPDATE, { projectId: project.id, action: 'CREATE' }, 'VFS');
        
        return project;
    }

    public deleteProject(projectId: string) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            // Recursive delete of all nodes
            this.deleteNodeRecursively(project.rootFolderId);
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveToStorage();
            
            // Notify System
            systemBus.emit(SystemProtocol.FILESYSTEM_UPDATE, { projectId, action: 'DELETE' }, 'VFS');
        }
    }

    // --- FILE OPERATIONS ---

    public getFileTree(folderId: string): FileNode[] {
        const folder = this.fileNodes.get(folderId);
        if (!folder || !folder.children) return [];
        return folder.children
            .map(id => this.fileNodes.get(id)!)
            .filter(Boolean)
            .sort((a, b) => {
                // Folders first, then files
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'FOLDER' ? -1 : 1;
            });
    }

    public createFile(parentId: string, name: string, content: string = ''): FileNode {
        const fileId = crypto.randomUUID();
        const newNode: FileNode = {
            id: fileId,
            name,
            type: 'FILE',
            content,
            parentId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.fileNodes.set(fileId, newNode);
        this.attachToParent(parentId, fileId);
        this.saveToStorage();
        return newNode;
    }

    public createFolder(parentId: string, name: string): FileNode {
        const folderId = crypto.randomUUID();
        const newNode: FileNode = {
            id: folderId,
            name,
            type: 'FOLDER',
            parentId,
            children: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.fileNodes.set(folderId, newNode);
        this.attachToParent(parentId, folderId);
        this.saveToStorage();
        return newNode;
    }

    public updateFile(fileId: string, content: string) {
        const node = this.fileNodes.get(fileId);
        if (node && node.type === 'FILE') {
            node.content = content;
            node.updatedAt = Date.now();
            this.saveToStorage();
        }
    }

    public deleteNode(nodeId: string) {
        this.deleteNodeRecursively(nodeId);
        this.saveToStorage();
    }

    public getNode(nodeId: string): FileNode | undefined {
        return this.fileNodes.get(nodeId);
    }

    // --- INTERNALS ---

    private attachToParent(parentId: string, childId: string) {
        const parent = this.fileNodes.get(parentId);
        if (parent && parent.children) {
            parent.children.push(childId);
        }
    }

    private deleteNodeRecursively(nodeId: string) {
        const node = this.fileNodes.get(nodeId);
        if (!node) return;

        // If parent exists, remove reference from parent
        if (node.parentId) {
            const parent = this.fileNodes.get(node.parentId);
            if (parent && parent.children) {
                parent.children = parent.children.filter(id => id !== nodeId);
            }
        }

        // If folder, delete children first
        if (node.type === 'FOLDER' && node.children) {
            [...node.children].forEach(childId => this.deleteNodeRecursively(childId));
        }

        this.fileNodes.delete(nodeId);
    }

    private scaffoldProject(rootId: string, type: VFSProject['type']) {
        if (type === 'REACT') {
            this.createFile(rootId, 'package.json', JSON.stringify({ name: 'react-app', version: '1.0.0', dependencies: { react: '^18.0.0' } }, null, 2));
            this.createFile(rootId, 'index.html', '<!DOCTYPE html>\n<html>\n<body>\n  <div id="root"></div>\n</body>\n</html>');
            this.createFile(rootId, 'vite.config.ts', 'import { defineConfig } from "vite";\nexport default defineConfig({});');
            
            const srcId = this.createFolder(rootId, 'src').id;
            this.createFile(srcId, 'App.tsx', `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="p-4 bg-slate-900 text-white h-screen">\n      <h1 className="text-2xl font-bold">Hello Silhouette VFS</h1>\n      <p>This file is persisted in your Virtual SSD.</p>\n      <button onClick={() => setCount(c => c+1)} className="mt-4 px-4 py-2 bg-cyan-600 rounded">\n        Count: {count}\n      </button>\n    </div>\n  );\n}`);
            this.createFile(srcId, 'main.tsx', `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);`);
        } else if (type === 'NODE') {
             this.createFile(rootId, 'package.json', JSON.stringify({ name: 'node-api', main: 'index.js' }, null, 2));
             this.createFile(rootId, 'index.js', 'const express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => res.send("Hello World"));\n\napp.listen(3000);');
        }
    }

    private seedDemoProject() {
        this.createProject('Demo Dashboard', 'REACT');
    }

    private saveToStorage() {
        localStorage.setItem(this.STORAGE_KEY_PROJECTS, JSON.stringify(this.projects));
        // Convert Map to Array for storage
        localStorage.setItem(this.STORAGE_KEY_NODES, JSON.stringify(Array.from(this.fileNodes.entries())));
    }

    private loadFromStorage() {
        const p = localStorage.getItem(this.STORAGE_KEY_PROJECTS);
        const n = localStorage.getItem(this.STORAGE_KEY_NODES);
        
        if (p) this.projects = JSON.parse(p);
        if (n) {
            const entries = JSON.parse(n);
            this.fileNodes = new Map(entries);
        }
    }
}

export const vfs = new VirtualFileSystem();