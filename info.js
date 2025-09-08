// tracker.js
(function() {
  // ---- FIREBASE SDK ----
  const scriptApp = document.createElement('script');
  scriptApp.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
  scriptApp.onload = () => {
    const scriptDB = document.createElement('script');
    scriptDB.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
    scriptDB.onload = initTracker;
    document.head.appendChild(scriptDB);
  };
  document.head.appendChild(scriptApp);

  // --- Device Info Helper ---
  function getDeviceInfo() {
    const ua = navigator.userAgent;

    // Device type
    const deviceType = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";

    // OS
    const os = navigator.platform || "Unknown";

    // Browser
    const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[0] || "Unknown";

    // Screen resolution
    const screenResolution = `${window.screen.width}x${window.screen.height}`;

    // Language
    const language = navigator.language || "Unknown";

    // Device model (Android/Apple)
    let deviceModel = "Unknown Device";
    const androidMatch = ua.match(/Android\s[\d.]+;\s([^)]+)\)/i);
    if (androidMatch) deviceModel = androidMatch[1].trim();
    else if (/iPhone/.test(ua)) deviceModel = "iPhone";
    else if (/iPad/.test(ua)) deviceModel = "iPad";

    return {
      deviceType,
      os,
      browser,
      screenResolution,
      language,
      deviceModel,
      userAgent: ua
    };
  }

  function initTracker() {
    const firebaseConfig = {
      apiKey: "AIzaSyDob9nbpu0Y9ebCmxwHBTCyFFCzSjgNFLs",
      authDomain: "confession-ies.firebaseapp.com",
      databaseURL: "https://confession-ies-default-rtdb.firebaseio.com",
      projectId: "confession-ies",
      storageBucket: "confession-ies.firebasestorage.app",
      messagingSenderId: "705171117795",
      appId: "1:705171117795:web:4aa165b3b071a0d6b197d6",
      measurementId: "G-9347YMJ01Z"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    const startTime = Date.now();
    const visitRef = db.ref('visits');

    // Persist visitor ID
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('visitorId', visitorId);
    }

    const commonData = getDeviceInfo();

    // Page open event
    visitRef.child(visitorId).push({
      type: 'page_open',
      time: new Date().toISOString(),
      ...commonData
    });

    // Time spent
    window.addEventListener('beforeunload', function() {
      const timeSpent = Date.now() - startTime;
      visitRef.child(visitorId).push({
        type: 'time_spent',
        time: new Date().toISOString(),
        milliseconds: timeSpent,
        ...commonData
      });
    });

    // Clicks
    document.addEventListener('click', function(e) {
      const target = e.target.tagName + (e.target.id ? '#' + e.target.id : '');
      visitRef.child(visitorId).push({
        type: 'click',
        time: new Date().toISOString(),
        element: target,
        ...commonData
      });
    });
  }
})();
