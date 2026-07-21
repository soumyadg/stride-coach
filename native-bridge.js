/* Strivon — native bridge.
   When running inside the Capacitor native shell, use native GPS / Bluetooth / Health.
   In a normal browser this whole module no-ops, so the web app is unaffected. */
(function () {
  var CAP = window.Capacitor;
  var isNative = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform());
  var P = (CAP && CAP.Plugins) || {};
  var platform = (CAP && CAP.getPlatform && CAP.getPlatform()) || 'web';
  var geoWatchId = null;

  function b64ToBytes(b64) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  var N = {
    available: isNative,
    platform: platform,

    // ---- GPS (native, high-accuracy, works with screen off if bg mode enabled) ----
    startGeo: function (onPos) {
      if (!isNative || !P.Geolocation) return false;
      var start = function () {
        P.Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 8000 }, function (pos) {
          if (pos && pos.coords) onPos(pos); // Capacitor position shape == web position shape
        }).then(function (id) { geoWatchId = id; }).catch(function () {});
      };
      P.Geolocation.checkPermissions()
        .then(function (s) { return (s.location === 'granted') ? null : P.Geolocation.requestPermissions(); })
        .catch(function () {})
        .then(start, start);
      return true; // native path taken
    },
    stopGeo: function () {
      try { if (geoWatchId && P.Geolocation) { P.Geolocation.clearWatch({ id: geoWatchId }); geoWatchId = null; } } catch (e) {}
    },

    // ---- Bluetooth heart-rate strap (native BLE — works on iOS, unlike Web Bluetooth) ----
    connectHR: async function (setHR) {
      var B = P.BluetoothLe;
      if (!isNative || !B) return false;
      var HR_SVC = '0000180d-0000-1000-8000-00805f9b34fb';
      var HR_CHR = '00002a37-0000-1000-8000-00805f9b34fb';
      try {
        await B.initialize({});
        var dev = await B.requestDevice({ services: [HR_SVC] });
        var deviceId = dev.deviceId;
        await B.connect({ deviceId: deviceId });
        if (B.addListener) {
          B.addListener('onNotification', function (ev) {
            try {
              var bytes = b64ToBytes(ev.value);
              var flags = bytes[0];
              var bpm = (flags & 1) ? (bytes[1] | (bytes[2] << 8)) : bytes[1];
              if (bpm) setHR(bpm, false);
            } catch (e) {}
          });
        }
        await B.startNotifications({ deviceId: deviceId, service: HR_SVC, characteristic: HR_CHR });
        return true;
      } catch (e) { return false; }
    },

    // ---- Local notifications (on-device training reminders — no backend needed) ----
    scheduleReminders: async function (list) {
      var LN = P.LocalNotifications;
      if (!isNative || !LN) return false;
      try {
        var perm = await LN.requestPermissions();
        if (perm.display !== 'granted') return false;
        var pending = await LN.getPending();
        if (pending && pending.notifications && pending.notifications.length) {
          await LN.cancel({ notifications: pending.notifications.map(function (n) { return { id: n.id }; }) }).catch(function () {});
        }
        await LN.schedule({
          notifications: list.map(function (n) {
            return { id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at) }, smallIcon: 'ic_launcher' };
          })
        });
        return true;
      } catch (e) { return false; }
    },
    notify: async function (list) {
      var LN = P.LocalNotifications;
      if (!isNative || !LN) return false;
      try {
        var perm = await LN.requestPermissions();
        if (perm.display !== 'granted') return false;
        await LN.schedule({
          notifications: list.map(function (n) {
            return { id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at) }, smallIcon: 'ic_launcher' };
          })
        });
        return true;
      } catch (e) { return false; }
    },
    cancelReminders: async function () {
      var LN = P.LocalNotifications;
      if (!isNative || !LN) return false;
      try {
        var pending = await LN.getPending();
        if (pending && pending.notifications && pending.notifications.length) {
          await LN.cancel({ notifications: pending.notifications.map(function (n) { return { id: n.id }; }) });
        }
        return true;
      } catch (e) { return false; }
    },

    // ---- Apple Health authorization (read side; workout-write is a follow-up plugin) ----
    requestHealth: async function () {
      var H = P.CapacitorHealthkit;
      if (platform !== 'ios' || !H) return false;
      try {
        await H.requestAuthorization({ all: [], read: ['workouts', 'heartRate', 'distanceWalkingRunning'], write: [] });
        return true;
      } catch (e) { return false; }
    }
  };

  window.StrideNative = N;
  if (isNative) console.log('[StrideNative] native bridge active on ' + platform);
})();
