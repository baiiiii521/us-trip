// IndexedDB：存照片和订单附件（文件比较大，不放 localStorage）。只存在本机。
const DB = 'hoops-files';
const STORE = 'files';

function open() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const s = req.result.createObjectStore(STORE, { keyPath: 'id' });
      s.createIndex('kind', 'kind');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode); const s = t.objectStore(STORE);
    const out = fn(s);
    t.oncomplete = () => resolve(out && 'result' in out ? out.result : out);
    t.onerror = () => reject(t.error);
  });
}

export const files = {
  put: (rec) => tx('readwrite', (s) => s.put(rec)),
  del: (id) => tx('readwrite', (s) => s.delete(id)),
  get: (id) => tx('readonly', (s) => s.get(id)),
  byKind: async (kind) => {
    try { return (await tx('readonly', (s) => s.index('kind').getAll(kind))) || []; } catch (e) { return []; }
  }
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
