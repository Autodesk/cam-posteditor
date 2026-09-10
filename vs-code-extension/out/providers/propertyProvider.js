"use strict";
// Copyright (c) 2020-2026 by Autodesk, Inc.
// Licensed under MIT. See LICENSE file in the project root.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const config = __importStar(require("../config"));
const utils_1 = require("../utils");
class PropertyProvider {
    constructor(context, engine) {
        this.context = context;
        this.engine = engine;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.interrogating = false;
        this.lastCpsPath = '';
        this.filterText = '';
        vscode.window.onDidChangeActiveTextEditor(() => this.refresh());
        vscode.workspace.onDidSaveTextDocument(() => this.onDocumentSaved());
        vscode.workspace.onDidCloseTextDocument(doc => {
            if (doc.fileName === this.lastCpsPath)
                this.lastCpsPath = '';
            this.engine.clearPropertyCache(doc.fileName);
        });
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    async refreshTree() {
        const cpsPath = this.engine.getCpsPath();
        if (cpsPath) {
            this.engine.clearPropertyCache(cpsPath);
        }
        this._onDidChangeTreeData.fire();
    }
    setFilter(text) {
        this.filterText = (text || '').trim().toLowerCase();
        this._onDidChangeTreeData.fire();
    }
    clearFilter() {
        if (this.filterText) {
            this.filterText = '';
            this._onDidChangeTreeData.fire();
        }
    }
    getFilter() {
        return this.filterText;
    }
    _itemMatchesFilter(item) {
        if (!this.filterText)
            return true;
        const label = (item.label ?? '').toString().toLowerCase();
        const normalize = s => s.replace(/[\s\-_]+/g, '');
        const labelNorm = normalize(label);
        const tokens = this.filterText.split(/\s+/).filter(Boolean);
        return tokens.every(tok => {
            const tokNorm = normalize(tok);
            return label.includes(tok) || (tokNorm.length > 0 && labelNorm.includes(tokNorm));
        });
    }
    async getChildren(element) {
        const editor = vscode.window.activeTextEditor;
        const activeIsCps = editor && editor.document.fileName.toUpperCase().endsWith('.CPS');
        const cpsPath = activeIsCps ? editor.document.fileName : (this.lastCpsPath || '');
        if (!cpsPath)
            return [];
        if (activeIsCps)
            this.lastCpsPath = cpsPath;
        let cache = this.engine.getPropertyCache(cpsPath);
        if (!cache) {
            if (!activeIsCps)
                return [];
            cache = await this.interrogateAndCache(cpsPath);
            if (!cache)
                return [];
        }
        const groupByGroup = config.get('showPropertiesByGroup') === true;
        if (element && typeof element === 'object' && '_group' in element) {
            let items = this.buildItems(cache, element._group);
            if (this.filterText)
                items = items.filter(it => this._itemMatchesFilter(it));
            if (config.get('sortPropertiesAlphabetically')) {
                items.sort((a, b) => (a.label?.toString() ?? '').localeCompare(b.label?.toString() ?? ''));
            }
            return items;
        }
        if (groupByGroup) {
            let groupNames = this.getGroupNames(cache);
            if (this.filterText) {
                groupNames = groupNames.filter(gn => this.buildItems(cache, gn).some(it => this._itemMatchesFilter(it)));
            }
            return groupNames.map(name => ({ _group: name }));
        }
        let items = this.buildItems(cache);
        if (this.filterText)
            items = items.filter(it => this._itemMatchesFilter(it));
        if (config.get('sortPropertiesAlphabetically')) {
            items.sort((a, b) => (a.label?.toString() ?? '').localeCompare(b.label?.toString() ?? ''));
        }
        return items;
    }
    getTreeItem(element) {
        if (element && typeof element === 'object' && '_group' in element) {
            const item = new vscode.TreeItem(element._group, vscode.TreeItemCollapsibleState.Expanded);
            item.contextValue = 'propertyGroup';
            return item;
        }
        return element;
    }
    getGroupNames(cache) {
        const defs = cache.changed.propertyDefinitions ?? cache.changed.properties;
        const names = new Set();
        for (const key of Object.keys(cache.changed.properties)) {
            const def = defs[key];
            const g = def && typeof def === 'object' && def.group != null ? String(def.group) : 'Other';
            names.add(g);
        }
        return Array.from(names).sort((a, b) => (a === 'Other' ? 1 : a.localeCompare(b === 'Other' ? '\uffff' : b)));
    }
    async getOrActivateCpsPath() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.toUpperCase().endsWith('.CPS')) {
            this.lastCpsPath = activeEditor.document.fileName;
            return activeEditor.document.fileName;
        }
        const cpsPath = this.lastCpsPath || '';
        if (!cpsPath)
            return '';
        const norm = (p) => path.normalize(p).toLowerCase();
        const existing = vscode.window.visibleTextEditors.find(e => norm(e.document.uri.fsPath) === norm(cpsPath));
        try {
            await vscode.window.showTextDocument(existing ? existing.document.uri : vscode.Uri.file(cpsPath), {
                preserveFocus: false,
                preview: false,
                viewColumn: existing?.viewColumn ?? vscode.ViewColumn.One,
            });
            return cpsPath;
        }
        catch {
            return '';
        }
    }
    // ── Property change handling ────────────────────────────────────
    async changeProperty(element, reset) {
        const cpsPath = await this.getOrActivateCpsPath();
        if (!cpsPath)
            return;
        const cache = this.engine.getPropertyCache(cpsPath);
        if (!cache) {
            vscode.window.showErrorMessage('Post processor properties not loaded.');
            return;
        }
        const label = element.label?.toString() ?? '';
        const parts = label.replace(/\s/g, '').split(':');
        const key = parts[0];
        const currentValue = parts.slice(1).join(':');
        if (reset) {
            const defaultVal = this.extractValue(cache.defaults.properties[key]);
            this.setPropertyValue(cache, key, defaultVal);
            vscode.window.setStatusBarMessage(`Reset of property '${key}' was successful`, 5000);
            this.onPropertyChanged();
            return;
        }
        // Determine if this is an enum property
        const defs = cache.changed.propertyDefinitions ?? cache.changed.properties;
        const def = defs[key];
        const enumValues = [];
        if (def && typeof def === 'object' && def.type === 'enum' && def.values) {
            for (const v of def.values) {
                if (typeof v === 'object' && v !== null && 'id' in v) {
                    enumValues.push(v);
                }
                else {
                    enumValues.push({ id: String(v), title: String(v) });
                }
            }
        }
        const isBoolean = currentValue === 'true' || currentValue === 'false';
        if (isBoolean || enumValues.length > 1) {
            let items;
            if (enumValues.length > 1) {
                items = enumValues.map(e => ({ label: e.id, description: `(${e.title})` }));
            }
            else {
                items = [{ label: 'true' }, { label: 'false' }];
            }
            const opts = {
                placeHolder: `'${key}' (current: '${currentValue}')`,
            };
            const selected = await vscode.window.showQuickPick(items, opts);
            if (!selected)
                return;
            const option = selected.label;
            const value = enumValues.length > 1 ? option : JSON.parse(option);
            this.setPropertyValue(cache, key, value);
            vscode.window.setStatusBarMessage(`Property '${key}' changed to '${option}'`, 5000);
            this.onPropertyChanged();
        }
        else {
            const input = await vscode.window.showInputBox({
                placeHolder: `Value for property (current: '${currentValue}')`,
            });
            if (input === undefined || input === '')
                return;
            const value = isNaN(Number(input)) ? input : parseFloat(input);
            this.setPropertyValue(cache, key, value);
            vscode.window.setStatusBarMessage(`Property '${key}' changed to '${input}'`, 5000);
            this.onPropertyChanged();
        }
    }
    // ── Private helpers ─────────────────────────────────────────────
    async interrogateAndCache(cpsPath) {
        if (this.interrogating)
            return this.engine.getPropertyCache(cpsPath);
        this.interrogating = true;
        try {
            const data = await this.engine.interrogatePost(cpsPath);
            if (!data)
                return undefined;
            const existing = this.engine.getPropertyCache(cpsPath);
            let cache;
            if (existing && this.defaultsMatch(existing.defaults, data)) {
                // Defaults unchanged: preserve user modifications
                cache = { defaults: (0, utils_1.deepClone)(data), changed: existing.changed };
            }
            else {
                // New or defaults changed: start from new defaults but re-apply any user overrides
                const newChanged = (0, utils_1.deepClone)(data);
                if (existing) {
                    for (const key of Object.keys(newChanged.properties)) {
                        if (!(key in existing.changed.properties))
                            continue;
                        const userVal = this.extractValue(existing.changed.properties[key]);
                        const oldDefault = this.extractValue(existing.defaults.properties[key]);
                        // Only re-apply if the user had actually overridden this property
                        if (userVal === undefined || String(userVal) === String(oldDefault))
                            continue;
                        const np = newChanged.properties[key];
                        if (typeof np === 'object' && np !== null && 'value' in np)
                            np.value = userVal;
                        else
                            newChanged.properties[key] = userVal;
                    }
                }
                cache = { defaults: (0, utils_1.deepClone)(data), changed: newChanged };
            }
            this.engine.setPropertyCache(cpsPath, cache);
            return cache;
        }
        finally {
            this.interrogating = false;
        }
    }
    defaultsMatch(a, b) {
        return JSON.stringify(a.properties) === JSON.stringify(b.properties);
    }
    buildItems(cache, groupName) {
        const items = [];
        const props = cache.changed.properties;
        const defaults = cache.defaults.properties;
        const defs = cache.changed.propertyDefinitions ?? cache.changed.properties;
        for (const key of Object.keys(props)) {
            if (groupName !== undefined) {
                const def = defs[key];
                const g = def && typeof def === 'object' && def.group != null ? String(def.group) : 'Other';
                if (g !== groupName)
                    continue;
            }
            const value = this.extractValue(props[key]);
            const defaultValue = this.extractValue(defaults[key]);
            if (value === undefined) {
                vscode.window.showErrorMessage(`Property '${key}' is invalid: no default value defined.`);
                continue;
            }
            const treeItem = new vscode.TreeItem(`${key} : ${value}`);
            // Mark modified properties with an icon
            if (String(value) !== String(defaultValue)) {
                treeItem.iconPath = this.getModifiedIcon();
            }
            // Add tooltip from property definitions
            const def = defs[key];
            if (typeof def === 'object' && def !== null && def.description) {
                treeItem.tooltip = def.description;
            }
            treeItem.contextValue = 'property';
            treeItem.command = {
                command: 'autodesk.post.directSelect',
                title: '',
                arguments: [`${key} : ${value}`],
            };
            items.push(treeItem);
        }
        return items;
    }
    extractValue(prop) {
        if (typeof prop === 'object' && prop !== null && 'value' in prop) {
            return prop.value;
        }
        return prop;
    }
    setPropertyValue(cache, key, value) {
        const prop = cache.changed.properties[key];
        if (typeof prop === 'object' && prop !== null && 'value' in prop) {
            prop.value = value;
        }
        else {
            cache.changed.properties[key] = value;
        }
    }
    onPropertyChanged() {
        this._onDidChangeTreeData.fire();
        if (config.get('postOnPropertyChange')) {
            vscode.commands.executeCommand('autodesk.post.postProcess');
        }
    }
    async onDocumentSaved() {
        const cpsPath = this.engine.getCpsPath();
        if (!cpsPath)
            return;
        // Re-interrogate to detect property definition changes
        await this.interrogateAndCache(cpsPath);
        this._onDidChangeTreeData.fire();
    }
    getModifiedIcon() {
        return this.context.asAbsolutePath(path.join('res', 'icons', 'status-modified.svg'));
    }
}
exports.PropertyProvider = PropertyProvider;
//# sourceMappingURL=propertyProvider.js.map