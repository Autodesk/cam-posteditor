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
exports.delay = delay;
exports.execFileAsync = execFileAsync;
exports.fileExists = fileExists;
exports.ensureDir = ensureDir;
exports.removeFilesInFolder = removeFilesInFolder;
exports.copyFolderSync = copyFolderSync;
exports.getFilesFromDirRecursive = getFilesFromDirRecursive;
exports.getHash = getHash;
exports.showOutputFile = showOutputFile;
exports.deepClone = deepClone;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
const crypto = __importStar(require("crypto"));
const vscode = __importStar(require("vscode"));
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function execFileAsync(file, args, options) {
    return new Promise((resolve, reject) => {
        cp.execFile(file, args, options, (err, stdout, stderr) => {
            if (err) {
                const e = err;
                e.stdout = stdout?.toString() ?? '';
                e.stderr = stderr?.toString() ?? '';
                reject(err);
            }
            else {
                resolve({
                    stdout: stdout?.toString() ?? '',
                    stderr: stderr?.toString() ?? '',
                });
            }
        });
    });
}
function fileExists(filePath) {
    if (!filePath)
        return false;
    try {
        return fs.existsSync(filePath);
    }
    catch {
        return false;
    }
}
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
function removeFilesInFolder(dir) {
    if (!fileExists(dir))
        return;
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.lstatSync(full).isFile()) {
            fs.unlinkSync(full);
        }
        else {
            removeFilesInFolder(full);
        }
    }
}
function copyFolderSync(from, to) {
    ensureDir(to);
    for (const entry of fs.readdirSync(from)) {
        const src = path.join(from, entry);
        const dest = path.join(to, entry);
        if (fs.lstatSync(src).isFile()) {
            fs.copyFileSync(src, dest);
        }
        else {
            copyFolderSync(src, dest);
        }
    }
}
function getFilesFromDirRecursive(dir, extensions) {
    if (!fileExists(dir))
        return [];
    const result = [];
    const walk = (current) => {
        try {
            for (const d of fs.readdirSync(current, { withFileTypes: true })) {
                const full = path.join(current, d.name);
                if (d.isFile() && extensions.includes(path.extname(d.name).toLowerCase())) {
                    result.push(path.relative(dir, full));
                }
                else if (d.isDirectory()) {
                    walk(full);
                }
            }
        }
        catch { /* skip inaccessible directories */ }
    };
    walk(dir);
    return result;
}
function getHash(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}
async function showOutputFile(filePath, column) {
    const norm = (p) => path.normalize(p).toLowerCase();
    const targetNorm = norm(filePath);
    const uri = vscode.Uri.file(filePath);
    const existingEditor = vscode.window.visibleTextEditors.find(e => norm(e.document.uri.fsPath) === targetNorm);
    if (existingEditor) {
        const prevActive = vscode.window.activeTextEditor;
        await vscode.window.showTextDocument(existingEditor.document, { viewColumn: existingEditor.viewColumn, preserveFocus: false });
        await vscode.commands.executeCommand('workbench.action.files.revert');
        if (prevActive && prevActive !== existingEditor) {
            await vscode.window.showTextDocument(prevActive.document, { viewColumn: prevActive.viewColumn, preserveFocus: false });
        }
    }
    else {
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { viewColumn: column, preserveFocus: true, preview: false });
    }
}
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
//# sourceMappingURL=utils.js.map