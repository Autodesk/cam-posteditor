"use strict";
// Copyright (c) 2020-2026 by Autodesk, Inc.
// Licensed under MIT. See LICENSE file in the project root.
//
// Where the extension keeps CNC files and machines. Nothing is stored in the extension folder, VS Code replaces it on
// every update.
//   <APPDATA>/Autodesk/Post Utility/CNC files/Custom       your CNC files (setting customCNCFolder)
//   <APPDATA>/Autodesk/Post Utility/Machines/Custom        your machines (setting customMachineFolder)
//   <APPDATA>/Autodesk/Post Utility/locations.json         read by "export cnc file to vs code.cps"
//   <LOCALAPPDATA>/Autodesk/Post Utility/Examples/...      the files that ship with the extension, copied at startup
//   <LOCALAPPDATA>/Autodesk/Post Utility/Online Library    downloaded machines
// Nothing in here may throw: a problem with a file must never stop the extension from starting.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseDir = getBaseDir;
exports.getCustomFolder = getCustomFolder;
exports.getUserFolders = getUserFolders;
exports.getExamplesDir = getExamplesDir;
exports.getOnlineLibraryDir = getOnlineLibraryDir;
exports.ensureUserFolders = ensureUserFolders;
exports.writeLocationsFile = writeLocationsFile;
exports.migrateLegacyFiles = migrateLegacyFiles;
exports.syncExamples = syncExamples;
exports.restoreExamples = restoreExamples;
exports.rememberDeletedExamples = rememberDeletedExamples;
exports.withLock = withLock;
exports.isGuarded = isGuarded;
exports.isUsablePath = isUsablePath;
exports.checkReachable = checkReachable;
exports.recheckAll = recheckAll;
exports.onReachabilityChange = onReachabilityChange;
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const os = require("os");
const config = require("./config");
const utils_1 = require("./utils");
const KINDS = {
    cnc: { setting: 'customCNCFolder', linked: 'customCNCLocations', dirName: 'CNC files' },
    machine: { setting: 'customMachineFolder', linked: 'customMachineLocations', dirName: 'Machines' },
};
const KIND_KEYS = Object.keys(KINDS);
const msg = (e) => (e && e.message ? e.message : String(e));
const lower = (s) => s.toLowerCase();
const isInside = (rel) => !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
// ── Locations ───────────────────────────────────────────────────
/** Folder for the files of the user (small, follows the user to other computers). */
function getBaseDir() {
    let root;
    if (process.platform === 'win32')
        root = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    else if (process.platform === 'darwin')
        root = path.join(os.homedir(), 'Library', 'Application Support');
    else
        root = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    return path.join(root, 'Autodesk', 'Post Utility');
}
/** Folder for what can be created again (the example files and the Online Library are large). */
function getLocalDir() {
    if (process.platform === 'win32')
        return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Autodesk', 'Post Utility');
    return getBaseDir();
}
/** The "Custom" folder for 'cnc' or 'machine' (setting, otherwise the default location). */
function getCustomFolder(kind) {
    const k = KINDS[kind];
    const fromSetting = config.get(k.setting);
    if (typeof fromSetting === 'string' && fromSetting.trim() && path.isAbsolute(fromSetting.trim()))
        return path.resolve(fromSetting.trim());
    return path.join(getBaseDir(), k.dirName, 'Custom');
}
/** Folders linked with "Add folder" (setting only). */
function getLinkedFolders(kind) {
    const linked = config.get(KINDS[kind].linked);
    return linked && Array.isArray(linked.folders) ? linked.folders.filter(f => typeof f === 'string') : [];
}
/** The Custom folder followed by all linked folders, without duplicates. */
function getUserFolders(kind) {
    const seen = new Set();
    const result = [];
    for (const f of [getCustomFolder(kind), ...getLinkedFolders(kind)]) {
        const key = lower(path.normalize(f));
        if (!seen.has(key)) {
            seen.add(key);
            result.push(f);
        }
    }
    return result;
}
/** The shipped files of the extension are kept here, the trees show them. */
function getExamplesDir(kind) {
    return path.join(getLocalDir(), 'Examples', KINDS[kind].dirName);
}
function getOnlineLibraryDir() {
    return path.join(getLocalDir(), 'Online Library');
}
function getStampFile() {
    return path.join(getLocalDir(), 'Examples', 'examples.json');
}
// ── Folders that may not be reachable ───────────────────────────
// A network share that is not reachable blocks every synchronous file call for 10 to 20 seconds (Windows then remembers
// the failure for a while). The extension host is shared with all other extensions, so nothing may wait for such a folder.
// Folders outside the user profile (another disk, a network share) are therefore checked first, in the background and with
// a time limit, and they are only used while that check succeeded (isUsablePath). The state is kept per volume
// (D:\ or \\server\share\) and checked again every 30 seconds by the trees.
const CHECK_TIMEOUT_MS = 3000;
const reachable = new Map(); // volume -> true / false, as far as it is known
const checking = new Map(); // volume -> Promise of the check that is running
const listeners = [];
const isWithin = (dir, p) => {
    const rel = path.relative(dir, p);
    return rel === '' || isInside(rel);
};
const volumeOf = (p) => path.parse(path.resolve(p)).root;
/** True for a path that may be on a network share or on a disk that is not there: everything outside the user profile and the temp folder. */
function isGuarded(p) {
    const abs = path.resolve(p);
    return !isWithin(os.homedir(), abs) && !isWithin(os.tmpdir(), abs);
}
function setReachable(volume, ok) {
    const key = lower(volume);
    const before = reachable.get(key);
    reachable.set(key, ok);
    if (before !== ok)
        for (const fn of listeners.slice()) {
            try {
                fn();
            }
            catch { /* ignore */ }
        }
}
/**
 * Checks in the background whether the volume of the path can be reached: resolves with false after 3 seconds at the latest.
 * The check itself may take longer (it keeps one thread busy until Windows gives up), a late success is still recorded.
 */
function checkReachable(p) {
    if (!isGuarded(p))
        return Promise.resolve(true);
    const volume = volumeOf(p);
    const key = lower(volume);
    if (!checking.has(key)) {
        const check = fs.promises.stat(volume).then(() => true, () => false).then((ok) => {
            checking.delete(key);
            setReachable(volume, ok);
            return ok;
        });
        checking.set(key, check);
    }
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            setReachable(volume, false);
            resolve(false);
        }, CHECK_TIMEOUT_MS);
        checking.get(key).then((ok) => {
            clearTimeout(timer);
            resolve(ok);
        });
    });
}
/** Synchronous and without any file access: can this path be used now? Starts a check if nothing is known about its volume yet. */
function isUsablePath(p) {
    if (!isGuarded(p))
        return true;
    const known = reachable.get(lower(volumeOf(p)));
    if (known === undefined)
        void checkReachable(p);
    return known === true;
}
/** Checks all volumes again (the trees do this before they read their folders). */
function recheckAll() {
    return Promise.all([...reachable.keys()].map((k) => checkReachable(k))).then(() => undefined);
}
/** fn is called when a volume becomes reachable or is not reachable any more. Returns a function that removes it. */
function onReachabilityChange(fn) {
    listeners.push(fn);
    return () => {
        const i = listeners.indexOf(fn);
        if (i >= 0)
            listeners.splice(i, 1);
    };
}
/**
 * Creates the Custom folders and the folder of the Online Library. Folders that may be on another disk or share are
 * created in the background once they were found. Resolves when that is done, never rejects.
 */
function ensureUserFolders() {
    const later = [];
    for (const dir of [getCustomFolder('cnc'), getCustomFolder('machine'), getOnlineLibraryDir()]) {
        if (isGuarded(dir)) {
            later.push(dir);
            continue;
        }
        try {
            (0, utils_1.ensureDir)(dir);
        }
        catch { /* not critical */ }
    }
    return Promise.all(later.map(async (dir) => {
        try {
            if (await checkReachable(dir))
                await fs.promises.mkdir(dir, { recursive: true });
        }
        catch { /* not critical */ }
    })).then(() => undefined);
}
// ── Writing files ───────────────────────────────────────────────
/** Writes through a temporary file, so that nobody (another window, a post, a killed VS Code) sees a half written file. */
function writeTextAtomic(file, text) {
    (0, utils_1.ensureDir)(path.dirname(file));
    const tmp = `${file}.${process.pid}.tmp`;
    try {
        fs.writeFileSync(tmp, text, 'utf-8');
        try {
            fs.chmodSync(file, 0o666); // a read-only target cannot be replaced
        }
        catch { /* does not exist */ }
        fs.renameSync(tmp, file);
    }
    catch (e) {
        try {
            fs.rmSync(tmp, { force: true });
        }
        catch { /* ignore */ }
        throw e;
    }
}
/** Writes the file unless it already has this content (ignoring what strip removes). Throws if the file cannot be written. */
function writeTextIfChanged(file, text, strip) {
    try {
        const same = strip ? (t) => t.replace(strip, '') : (t) => t;
        if (same(fs.readFileSync(file, 'utf-8')) === same(text))
            return;
    }
    catch { /* write it */ }
    writeTextAtomic(file, text);
}
/** Copies a file through a temporary file. The copy is writable even if the source is read-only. Throws on errors. */
function copyFileAtomic(src, dest) {
    const tmp = `${dest}.${process.pid}.${Date.now().toString(36)}.tmp`;
    try {
        fs.copyFileSync(src, tmp);
        fs.chmodSync(tmp, 0o666);
        try {
            fs.chmodSync(dest, 0o666); // a read-only target cannot be replaced
        }
        catch { /* does not exist */ }
        fs.renameSync(tmp, dest);
    }
    catch (e) {
        try {
            fs.rmSync(tmp, { force: true });
        }
        catch { /* ignore */ }
        throw e;
    }
}
function sameContent(a, b) {
    try {
        return fs.statSync(a).size === fs.statSync(b).size && fs.readFileSync(a).equals(fs.readFileSync(b));
    }
    catch {
        return false;
    }
}
function removeEmptyFolders(dir, stopAt) {
    try {
        for (let d = dir; isInside(path.relative(stopAt, d)) && fs.readdirSync(d).length === 0; d = path.dirname(d))
            fs.rmdirSync(d);
    }
    catch { /* ignore */ }
}
// ── Only one window at a time ───────────────────────────────────
/**
 * Runs fn unless another window (or another VS Code) is just doing the same: VS Code restores all windows at once after
 * an update, and they would copy the same files at the same time. Returns undefined if fn was not run.
 * A lock that is older than two minutes is left over from a killed process and is taken over.
 */
function withLock(fn) {
    const lock = path.join(getLocalDir(), 'update.lock');
    let locked = false;
    try {
        (0, utils_1.ensureDir)(getLocalDir());
        try {
            fs.mkdirSync(lock);
            locked = true;
        }
        catch (e) {
            if (e && e.code === 'EEXIST' && Date.now() - fs.statSync(lock).mtimeMs > 120000) {
                fs.rmdirSync(lock);
                fs.mkdirSync(lock);
                locked = true;
            }
        }
    }
    catch { /* cannot be locked: do not run */ }
    if (!locked)
        return undefined;
    try {
        return { value: fn() };
    }
    finally {
        try {
            fs.rmdirSync(lock);
        }
        catch { /* ignore */ }
    }
}
// ── locations.json ──────────────────────────────────────────────
/** Unique names for the post: "Custom" for the Custom folder, otherwise the name of the folder. */
function namedFolders(folders) {
    const used = new Set();
    return folders.map((p, i) => {
        const base = i === 0 ? 'Custom' : path.basename(p) || p;
        let name = base;
        for (let n = 2; used.has(lower(name)); n++)
            name = `${base} (${n})`;
        used.add(lower(name));
        return { name, path: p };
    });
}
/** Tells "export cnc file to vs code.cps" where the folders are. */
function writeLocationsFile() {
    try {
        const cnc = getUserFolders('cnc');
        const machine = getUserFolders('machine');
        const json = JSON.stringify({
            version: 1,
            updated: new Date().toISOString(),
            cncCustomFolder: cnc[0],
            machineCustomFolder: machine[0],
            cncFolders: namedFolders(cnc),
            machineFolders: namedFolders(machine),
        }, null, 2);
        writeTextIfChanged(path.join(getBaseDir(), 'locations.json'), json, /"updated": "[^"]*"/);
    }
    catch { /* not critical, the post then uses the default Custom folder */ }
}
// ── Folder walking ──────────────────────────────────────────────
/** 'dir', 'file' or undefined for an entry of readdirSync. Junctions and symbolic links count as what they point to. */
function entryKind(d, full) {
    if (d.isDirectory())
        return 'dir';
    if (d.isFile())
        return 'file';
    if (d.isSymbolicLink()) {
        try {
            const st = fs.statSync(full);
            return st.isDirectory() ? 'dir' : st.isFile() ? 'file' : undefined;
        }
        catch {
            return undefined; // dangling
        }
    }
    return undefined;
}
/** Entries of a folder. A folder that does not exist has none, any other error is reported in result.failed. */
function readFolder(dir, result) {
    try {
        return fs.readdirSync(dir, { withFileTypes: true });
    }
    catch (e) {
        if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')))
            result.failed.push(`${dir}: ${msg(e)}`);
        return [];
    }
}
/** Relative paths ('Milling/a.cnc') of all files below dir. Throws on errors. */
function walkFiles(dir, rel, out) {
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, d.name);
        const r = rel ? rel + '/' + d.name : d.name;
        const kind = entryKind(d, full);
        if (kind === 'dir')
            walkFiles(full, r, out);
        else if (kind === 'file')
            out.push(r);
    }
}
/** Names of the folders that ship with this version of the extension (Milling, Turning, ...). Throws on errors. */
function shippedFolderNames(root) {
    try {
        return fs.readdirSync(root, { withFileTypes: true })
            .filter(d => entryKind(d, path.join(root, d.name)) === 'dir' && !['custom', 'online library'].includes(lower(d.name)))
            .map(d => lower(d.name));
    }
    catch (e) {
        if (e && e.code === 'ENOENT')
            return [];
        throw e;
    }
}
/**
 * The files that ship with this version of the extension: the folders in res/<dirName> except Custom and Online Library.
 * Files in res/<dirName> itself and in Custom are not shipped, an older export post writes them there. Throws on errors.
 */
function listShipped(extensionPath, dirName) {
    const root = path.join(extensionPath, 'res', dirName);
    const out = [];
    try {
        for (const d of fs.readdirSync(root, { withFileTypes: true })) {
            const full = path.join(root, d.name);
            if (entryKind(d, full) === 'dir' && !['custom', 'online library'].includes(lower(d.name)))
                walkFiles(full, d.name, out);
        }
    }
    catch (e) {
        if (!(e && e.code === 'ENOENT'))
            throw e;
    }
    return out;
}
// ── Migration of files from earlier versions ────────────────────
/** Copies one file unless the destination exists. Never overwrites. */
function copyOne(src, dest, result) {
    try {
        if (fs.existsSync(dest))
            return;
        (0, utils_1.ensureDir)(path.dirname(dest));
        copyFileAtomic(src, dest);
        result.copied.push(dest);
    }
    catch (e) {
        result.failed.push(`${src}: ${msg(e)}`);
    }
}
/** Copies all files below 'from' that do not exist below 'to' yet and that isShipped does not claim. relPath is relative to the shipped folder. */
function copyMissing(from, to, result, isShipped, relPath) {
    for (const d of readFolder(from, result)) {
        const src = path.join(from, d.name);
        const kind = entryKind(d, src);
        if (kind === 'dir')
            copyMissing(src, path.join(to, d.name), result, isShipped, relPath + '/' + d.name);
        else if (kind === 'file' && !(isShipped && isShipped(relPath + '/' + d.name)))
            copyOne(src, path.join(to, d.name), result);
    }
}
/**
 * Copies user files from the places where earlier versions stored them:
 *  - Custom (and in older versions other folders that are not shipped, e.g. Connections_testing) go to the Custom folder,
 *  - files that users added to a shipped folder (Milling, ...) go to the same folder in Examples (not what the new version ships),
 *  - loose files go to the Custom folder.
 * Existing files are never overwritten. Nothing is thrown, every problem is collected in result.failed.
 * @param full also read the other installed versions of the extension and the backups that 5.0.x made in %TEMP% (only
 *             needed once). Without it only the extension folder itself is read, an older export post still writes there.
 * @param kinds 'cnc' and / or 'machine': the Custom folders to copy into (default both)
 */
function migrateLegacyFiles(extensionPath, full, kinds = KIND_KEYS) {
    const result = { copied: [], failed: [] };
    const workDir = path.join(os.tmpdir(), 'AutodeskPostUtility');
    const siblings = [];
    if (full) {
        try {
            const own = lower(path.basename(extensionPath));
            for (const d of fs.readdirSync(path.dirname(extensionPath), { withFileTypes: true })) {
                if (d.isDirectory() && lower(d.name) !== own && lower(d.name).startsWith('autodesk.hsm-post-processor'))
                    siblings.push(path.join(path.dirname(extensionPath), d.name, 'res'));
            }
        }
        catch { /* nothing to migrate from */ }
    }
    for (const kind of kinds) {
        const dirName = KINDS[kind].dirName;
        const custom = getCustomFolder(kind);
        const examples = getExamplesDir(kind);
        const currentRoot = path.join(extensionPath, 'res', dirName);
        let shippedNames;
        try {
            shippedNames = new Set(shippedFolderNames(currentRoot));
        }
        catch (e) {
            result.failed.push(`${currentRoot}: ${msg(e)}`); // without it shipped and user files cannot be told apart
            continue;
        }
        const roots = [currentRoot];
        if (full) {
            roots.push(path.join(workDir, kind === 'cnc' ? 'CNCFilesBackup' : 'MachinesBackup'));
            roots.push(...siblings.map(s => path.join(s, dirName)));
        }
        for (const root of roots) {
            for (const d of readFolder(root, result)) {
                const from = path.join(root, d.name);
                const kindOfEntry = entryKind(d, from);
                if (kindOfEntry === 'file') {
                    copyOne(from, path.join(custom, d.name), result);
                }
                else if (kindOfEntry === 'dir' && lower(d.name) !== 'online library') {
                    if (lower(d.name) === 'custom')
                        copyMissing(from, custom, result, undefined, d.name);
                    else if (root === currentRoot)
                        continue; // the folders of this version of the extension ship with it
                    else if (!shippedNames.has(lower(d.name)))
                        copyMissing(from, path.join(custom, d.name), result, undefined, d.name);
                    else
                        copyMissing(from, path.join(examples, d.name), result, (rel) => fs.existsSync(path.join(currentRoot, ...rel.split('/'))), d.name);
                }
            }
        }
        if (full) {
            // flat copies written by version 5.0.0 - 5.0.3
            copyMissing(path.join(workDir, kind === 'cnc' ? 'CustomCNCFiles' : 'CustomMachineFiles'), custom, result, undefined, '');
        }
    }
    return result;
}
// ── Examples ────────────────────────────────────────────────────
// examples.json (in the Examples folder) remembers which release of the extension has been synchronised, which files it
// shipped (with the hash of their content) and which of them the user deleted.
const isRelativeFile = (s) => typeof s === 'string' && s !== '' && !s.includes('..') && !path.isAbsolute(s) && !/^[a-zA-Z]:/.test(s);
const fileList = (x) => (Array.isArray(x) ? x.filter(isRelativeFile) : []);
const hashFile = (f) => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
/** {relative path: hash}. A list of paths (older format) has no hashes. */
function fileMap(x) {
    const map = {};
    if (Array.isArray(x))
        for (const f of fileList(x))
            map[f] = '';
    else if (x && typeof x === 'object')
        for (const [f, h] of Object.entries(x))
            if (isRelativeFile(f))
                map[f] = typeof h === 'string' ? h : '';
    return map;
}
function emptyStamp() {
    const stamp = { version: undefined, build: undefined, files: {}, deleted: {} };
    for (const k of KIND_KEYS) {
        stamp.files[KINDS[k].dirName] = {};
        stamp.deleted[KINDS[k].dirName] = [];
    }
    return stamp;
}
/**
 * Reads examples.json, whatever it contains. ok is false if it exists but cannot be read now (another program has it open):
 * nothing may be decided then. A damaged file counts as not there.
 */
function readStamp() {
    let text;
    try {
        text = fs.readFileSync(getStampFile(), 'utf-8');
    }
    catch (e) {
        return e && e.code === 'ENOENT' ? { ok: true, stamp: emptyStamp() } : { ok: false };
    }
    const stamp = emptyStamp();
    try {
        const raw = JSON.parse(text);
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            if (typeof raw.version === 'string')
                stamp.version = raw.version;
            if (typeof raw.build === 'string')
                stamp.build = raw.build;
            for (const k of KIND_KEYS) {
                const d = KINDS[k].dirName;
                stamp.files[d] = fileMap(raw.files && raw.files[d]);
                stamp.deleted[d] = fileList(raw.deleted && raw.deleted[d]);
            }
        }
    }
    catch { /* damaged */ }
    return { ok: true, stamp };
}
function writeStamp(stamp) {
    writeTextIfChanged(getStampFile(), JSON.stringify({ version: stamp.version, build: stamp.build, files: stamp.files, deleted: stamp.deleted }));
}
function compareVersions(a, b) {
    const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
    const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const d = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (d)
            return d;
    }
    return 0;
}
/**
 * Makes the Examples folder match the files that ship with this version of the extension: new files are copied, files
 * that an earlier version shipped and this one does not are removed. Changed files are only replaced when the release
 * changes, at every other start only missing files are restored, so an edit is not reset when VS Code starts. Files that
 * the user deleted are not restored. Files that the user added are never touched.
 * Does nothing if a newer version of the extension (e.g. in another VS Code) has synchronised the folder, or if the
 * extension folder cannot be read completely (then nothing is removed). When a file could not be copied the release is
 * not recorded, so the next start tries again.
 * @param options.force replace changed files too
 * @param options.forgetDeleted restore files that the user deleted
 * @returns copied and failed files and skipped ('newer', 'unreadable') if nothing was done
 */
function syncExamples(extensionPath, version, options = {}) {
    const result = { copied: [], failed: [], skipped: undefined };
    try {
        const read = readStamp();
        if (!read.ok) {
            result.skipped = 'unreadable';
            return result;
        }
        const stamp = read.stamp;
        if (stamp.version && version && compareVersions(stamp.version, version) > 0) {
            result.skipped = 'newer';
            return result;
        }
        if (options.forgetDeleted)
            for (const d of Object.keys(stamp.deleted))
                stamp.deleted[d] = [];
        const lists = {};
        const hash = crypto.createHash('md5');
        let complete = true;
        for (const kind of KIND_KEYS) {
            const dirName = KINDS[kind].dirName;
            try {
                lists[kind] = listShipped(extensionPath, dirName);
                for (const rel of lists[kind])
                    hash.update(rel + ':' + fs.statSync(path.join(extensionPath, 'res', dirName, ...rel.split('/'))).size + ';');
            }
            catch (e) {
                complete = false;
                result.failed.push(`${path.join(extensionPath, 'res', dirName)}: ${msg(e)}`);
            }
        }
        const build = hash.digest('hex'); // tells two builds of the same version apart
        const sameRelease = complete && !options.force && stamp.version === version && stamp.build === build;
        const files = {};
        for (const kind of KIND_KEYS) {
            const dirName = KINDS[kind].dirName;
            const list = lists[kind];
            const known = stamp.files[dirName];
            files[dirName] = known;
            if (!list || list.length === 0)
                continue; // could not be listed (or is empty): keep what is known and change nothing
            const target = getExamplesDir(kind);
            try {
                (0, utils_1.ensureDir)(target);
            }
            catch (e) {
                result.failed.push(`${target}: ${msg(e)}`);
                continue;
            }
            const gone = new Set(stamp.deleted[dirName].map(lower));
            const next = {};
            for (const rel of list) {
                const src = path.join(extensionPath, 'res', dirName, ...rel.split('/'));
                const dest = path.join(target, ...rel.split('/'));
                try {
                    next[rel] = sameRelease && known[rel] !== undefined ? known[rel] : hashFile(src);
                    if (gone.has(lower(rel)))
                        continue;
                    if (fs.existsSync(dest) && (sameRelease || sameContent(src, dest)))
                        continue;
                    (0, utils_1.ensureDir)(path.dirname(dest));
                    copyFileAtomic(src, dest);
                    result.copied.push(dest);
                }
                catch (e) {
                    next[rel] = next[rel] ?? known[rel] ?? '';
                    result.failed.push(`${src}: ${msg(e)}`);
                }
            }
            // Files that an earlier version shipped and this one does not. Only if the user did not change them.
            const keep = new Set(list.map(lower));
            for (const [rel, hash] of Object.entries(known)) {
                if (keep.has(lower(rel)))
                    continue;
                const old = path.join(target, ...rel.split('/'));
                try {
                    if (hash && fs.existsSync(old) && hashFile(old) === hash) {
                        fs.chmodSync(old, 0o666);
                        fs.unlinkSync(old);
                        removeEmptyFolders(path.dirname(old), target);
                    }
                }
                catch { /* ignore */ }
            }
            files[dirName] = next;
        }
        const failed = result.failed.length > 0;
        writeStamp({ version: failed ? stamp.version : version, build: failed ? stamp.build : build, files, deleted: stamp.deleted });
    }
    catch (e) {
        result.failed.push(msg(e));
    }
    return result;
}
/** Restores the shipped example files that the user deleted, and with resetEdited the ones that the user changed. */
function restoreExamples(extensionPath, version, resetEdited) {
    return syncExamples(extensionPath, version, { force: resetEdited, forgetDeleted: true });
}
/**
 * Call after the user deleted a file or folder in the Examples folder: the shipped files in it are not restored by the
 * next synchronisation.
 */
function rememberDeletedExamples(deletedPath) {
    try {
        const read = readStamp();
        if (!read.ok)
            return;
        let changed = false;
        for (const kind of KIND_KEYS) {
            const dirName = KINDS[kind].dirName;
            const rel = path.relative(getExamplesDir(kind), deletedPath);
            if (!isInside(rel))
                continue;
            const key = lower(rel.split(path.sep).join('/'));
            const hits = Object.keys(read.stamp.files[dirName]).filter(f => lower(f) === key || lower(f).startsWith(key + '/'));
            if (hits.length === 0)
                continue;
            const gone = new Set(read.stamp.deleted[dirName].map(lower));
            for (const h of hits)
                gone.add(lower(h));
            read.stamp.deleted[dirName] = [...gone];
            changed = true;
        }
        if (changed)
            writeStamp(read.stamp);
    }
    catch { /* not critical */ }
}
//# sourceMappingURL=userLibrary.js.map
