

//離線資源
const CACHE_NAME = 'static-cache-offline';
const Res_offline = [
  './Images/off1.gif',
  './offline.html',
];


//install event
self.addEventListener('install', function (event) {
  console.log('Service Worker is installing.');

  //緩存
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] offline page');
      return cache.addAll(Res_offline);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  console.log('Finally active. Ready to start serving content!');
  //顯示通知
  self.registration.showNotification("State", {
    body: 'active ready'
  });
  //通知處理 https://developer.mozilla.org/en-US/docs/Web/API/Notification
  self.registration.getNotifications

  //清除舊快取
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  self.clients.claim();
});

self.addEventListener('push', function (event) {
  try {
    /*
    {"title":"title","body":"body","icon":"","tag":"1"}
     */
    let data = JSON.parse(event.data.text());

    var title = data.title;
    var body = data.body;
    var icon = data.icon;
    var tag = data.tag;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: icon,
        tag: tag
      })
    );
  }
  catch (e) {
    console.error(e);
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();
});


self.addEventListener('fetch', (event) => {
  console.log('[ServiceWorker] Fetch', event.request.url);

  if (event.request.url.indexOf("Images/off1.gif") != -1) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match(Res_offline[0]);
            });
        })
    );
  }
  else {
    if (event.request.mode !== 'navigate') {
      // Not a page navigation, bail.
      return;
    }
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match('./offline.html');
            });
        })
    );
  }
});