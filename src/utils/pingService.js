import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Gets local date string in YYYY-MM-DD format
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Executes a GET request (curl equivalent in browser) to all live portfolio URLs once per day.
 */
export async function executePortfolioPing(portfolioItems, triggeredBy = 'site_load_auto') {
  if (!portfolioItems || portfolioItems.length === 0) {
    return { success: false, message: 'No portfolio items found.' };
  }

  const getItemUrl = (item) => {
    const raw = item?.liveUrl || item?.url || item?.link || item?.githubUrl;
    if (raw && typeof raw === 'string' && raw.trim().startsWith('http')) {
      return raw.trim();
    }
    return null;
  };

  const itemsToPing = portfolioItems
    .map(item => ({ item, url: getItemUrl(item) }))
    .filter(x => x.url !== null);

  if (itemsToPing.length === 0) {
    return { success: false, message: 'No valid live webpage links found to ping.' };
  }

  // Execute curl/fetch to all URLs simultaneously
  const pingResults = await Promise.all(
    itemsToPing.map(async ({ item, url }) => {
      const startTime = performance.now();
      let status = 'Ping Sent (OK)';
      let isSuccess = true;

      try {
        // mode: 'no-cors' allows browser to dispatch GET request to external servers without CORS blocking execution
        await fetch(url, { mode: 'no-cors', cache: 'no-cache' });
      } catch (err) {
        status = `Failed (${err.message || 'Network Error'})`;
        isSuccess = false;
      }

      const durationMs = Math.round(performance.now() - startTime);

      return {
        title: item.title || 'Untitled Project',
        url: url,
        status: status,
        isSuccess: isSuccess,
        durationMs: durationMs,
        pingedAt: new Date().toISOString()
      };
    })
  );

  const todayStr = getTodayDateString();
  const logData = {
    dateKey: todayStr,
    createdAt: new Date().toISOString(),
    totalLinks: pingResults.length,
    triggeredBy: triggeredBy,
    logs: pingResults
  };

  const docRef = await addDoc(collection(db, 'ping_logs'), logData);

  // Update local cache flag
  try {
    localStorage.setItem('daily_ping_last_date', todayStr);
  } catch (e) {
    console.warn("LocalStorage notice:", e);
  }

  return { 
    success: true, 
    count: pingResults.length, 
    docId: docRef.id, 
    logs: pingResults,
    dateKey: todayStr
  };
}

/**
 * Checks if daily ping has already been executed today, and runs it if not.
 */
export async function checkAndRunDailyPing(portfolioItems) {
  const todayStr = getTodayDateString();

  // 1. Check local storage cache first
  try {
    const cachedDate = localStorage.getItem('daily_ping_last_date');
    if (cachedDate === todayStr) {
      return { skipped: true, reason: 'Already pinged today (localStorage cache)' };
    }
  } catch (e) {
    console.warn("LocalStorage check notice:", e);
  }

  // 2. Check Firestore ping_logs collection for today's dateKey
  try {
    const pingLogsRef = collection(db, 'ping_logs');
    const q = query(pingLogsRef, where('dateKey', '==', todayStr));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Record already exists in Firestore for today
      try {
        localStorage.setItem('daily_ping_last_date', todayStr);
      } catch (e) {}
      return { skipped: true, reason: 'Already pinged today (Firestore record exists)' };
    }

    // 3. Execute daily ping
    return await executePortfolioPing(portfolioItems, 'site_load_auto');
  } catch (err) {
    console.error("Daily ping execution error:", err);
    return { skipped: false, error: err.message };
  }
}
