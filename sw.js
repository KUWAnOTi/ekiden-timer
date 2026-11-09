// 駅伝タスキ計時：オフライン用 service worker
// 通信できるときは最新版を取りに行き、できないときは保存しておいた版を使う
const CACHE = "ekiden-timer-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const fromNet = fetch(req).then(res => {
    if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  });
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000));
  e.respondWith(
    Promise.race([fromNet, timeout]).catch(() =>
      caches.match(req, { ignoreSearch: true }).then(m => m || (req.mode === "navigate" ? caches.match("./index.html") : fromNet))
    )
  );
});
