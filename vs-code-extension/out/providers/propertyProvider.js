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
const fs = __importStar(require("fs"));
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
        this.engine.machineChangeHandler = () => this.onMachineChanged();
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
        void this.syncMachine(cache);
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
            const defaultVal = this.getEffectiveDefault(cache, key);
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
                cache = { defaults: (0, utils_1.deepClone)(data), changed: existing.changed, machine: existing.machine, machineOffered: existing.machineOffered };
            }
            else {
                // New or defaults changed: start from new defaults but re-apply any user overrides
                const newChanged = (0, utils_1.deepClone)(data);
                let machine;
                if (existing?.machine) {
                    const values = {};
                    for (const [k, v] of Object.entries(existing.machine.values)) {
                        if (!(k in newChanged.properties))
                            continue;
                        values[k] = v;
                        this.setPropertyValue({ changed: newChanged }, k, v);
                    }
                    machine = { file: existing.machine.file, values };
                }
                if (existing) {
                    for (const key of Object.keys(newChanged.properties)) {
                        if (!(key in existing.changed.properties))
                            continue;
                        const userVal = this.extractValue(existing.changed.properties[key]);
                        const oldDefault = this.getEffectiveDefault(existing, key);
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
                cache = { defaults: (0, utils_1.deepClone)(data), changed: newChanged, machine, machineOffered: existing?.machineOffered };
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
            const defaultValue = this.getEffectiveDefault(cache, key);
            const machineValues = cache.machine?.values;
            const isMachineControlled = !!machineValues && key in machineValues;
            if (value === undefined) {
                vscode.window.showErrorMessage(`Property '${key}' is invalid: no default value defined.`);
                continue;
            }
            const treeItem = new vscode.TreeItem(`${key} : ${value}`);
            // Mark modified properties with an icon
            if (String(value) !== String(defaultValue)) {
                treeItem.iconPath = this.getModifiedIcon();
            }
            else if (isMachineControlled) {
                treeItem.iconPath = this.getMachineDefaultIcon();
            }
            if (isMachineControlled) {
                treeItem.description = String(value) !== String(defaultValue) ? `machine default: ${defaultValue}` : 'machine default';
            }
            // Add tooltip from property definitions
            const def = defs[key];
            let tooltip = typeof def === 'object' && def !== null && def.description ? String(def.description) : '';
            if (isMachineControlled) {
                const note = `Default set by machine '${path.basename(cache.machine.file, path.extname(cache.machine.file))}': ${machineValues[key]}`;
                tooltip = tooltip ? `${tooltip}\n\n${note}` : note;
            }
            if (tooltip)
                treeItem.tooltip = tooltip;
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
    // ── Machine property defaults ───────────────────────────────────
    /** Default after machine overrides: used for the modified marker and for Reset. */
    getEffectiveDefault(cache, key) {
        const values = cache.machine?.values;
        if (values && key in values)
            return values[key];
        return this.extractValue(cache.defaults.properties[key]);
    }
    /** Reads post.default.properties from a .mch file; returns {} for missing/unparseable files (e.g. XML .machine). */
    readMachineProperties(machineFile) {
        try {
            const mch = JSON.parse(fs.readFileSync(machineFile, 'utf-8'));
            const props = mch?.post?.default?.properties;
            return props && typeof props === 'object' ? props : {};
        }
        catch {
            return {};
        }
    }
    coerceToDefaultType(value, cpsDefault) {
        if (typeof cpsDefault === 'number') {
            const n = Number(value);
            return isNaN(n) ? value : n;
        }
        if (typeof cpsDefault === 'string')
            return String(value);
        if (typeof cpsDefault === 'boolean' && typeof value === 'string') {
            if (value === 'true')
                return true;
            if (value === 'false')
                return false;
        }
        return value;
    }
    /** Machine-defined values limited to properties that exist in the current post. */
    collectMachineValues(cache, machineFile) {
        const values = {};
        for (const [key, raw] of Object.entries(this.readMachineProperties(machineFile))) {
            if (!(key in cache.changed.properties))
                continue;
            values[key] = this.coerceToDefaultType(raw, this.extractValue(cache.defaults.properties[key]));
        }
        return values;
    }
    /** Reverts properties still holding the machine default to the post default and drops machine control. */
    releaseMachineDefaults(cache) {
        if (!cache.machine)
            return;
        for (const [key, val] of Object.entries(cache.machine.values)) {
            if (key in cache.changed.properties && String(this.extractValue(cache.changed.properties[key])) === String(val)) {
                this.setPropertyValue(cache, key, this.extractValue(cache.defaults.properties[key]));
            }
        }
        delete cache.machine;
    }
    /** Brings the cache in line with the selected machine, asking before overwriting property values. Returns true if the cache changed. */
    async syncMachine(cache) {
        const machineFile = this.engine.machineFile;
        if (cache.machine && cache.machine.file !== machineFile) {
            this.releaseMachineDefaults(cache);
            cache.machineOffered = undefined;
            this._onDidChangeTreeData.fire();
        }
        if (!machineFile || cache.machineOffered === machineFile)
            return;
        cache.machineOffered = machineFile;
        const values = this.collectMachineValues(cache, machineFile);
        const keys = Object.keys(values);
        if (keys.length === 0)
            return;
        const differing = keys.filter(k => String(this.extractValue(cache.changed.properties[k])) !== String(values[k]));
        if (differing.length > 0) {
            const name = path.basename(machineFile, path.extname(machineFile));
            const defined = `${keys.length} post propert${keys.length === 1 ? 'y' : 'ies'}`;
            const changes = differing.length === keys.length
                ? ''
                : ` ${differing.length} of them ${differing.length === 1 ? 'has' : 'have'} a different value now.`;
            const answer = await vscode.window.showInformationMessage(`Machine '${name}' defines default values for ${defined}.${changes} Update the property defaults?`, 'Update', 'Not Now');
            if (answer !== 'Update')
                return;
        }
        // The user may have switched machines while the prompt was open
        if (this.engine.machineFile !== machineFile)
            return;
        cache.machine = { file: machineFile, values };
        for (const [key, val] of Object.entries(values))
            this.setPropertyValue(cache, key, val);
        this._onDidChangeTreeData.fire();
    }
    async onMachineChanged() {
        const cpsPath = this.engine.getCpsPath() || this.lastCpsPath;
        const cache = cpsPath ? this.engine.getPropertyCache(cpsPath) : undefined;
        if (!cache)
            return;
        cache.machineOffered = undefined;
        await this.syncMachine(cache);
    }
    async applyMachineDefaultsNow() {
        if (!this.engine.machineFile) {
            vscode.window.showInformationMessage('Select a machine first.');
            return;
        }
        const cpsPath = this.engine.getCpsPath() || this.lastCpsPath;
        const cache = cpsPath ? this.engine.getPropertyCache(cpsPath) : undefined;
        if (!cache) {
            vscode.window.showErrorMessage('Post processor properties not loaded.');
            return;
        }
        if (Object.keys(this.collectMachineValues(cache, this.engine.machineFile)).length === 0) {
            vscode.window.showInformationMessage('The selected machine does not define defaults for any properties of this post.');
            return;
        }
        cache.machineOffered = undefined;
        await this.syncMachine(cache);
        if (cache.machine)
            this.onPropertyChanged();
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
    getMachineDefaultIcon() {
        return this.context.asAbsolutePath(path.join('res', 'icons', 'machine-default.svg'));
    }
}
exports.PropertyProvider = PropertyProvider;
//# sourceMappingURL=propertyProvider.js.map