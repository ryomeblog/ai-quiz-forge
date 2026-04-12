// Capacitor は runtime で window に注入される。Web ビルド時には静的 import しない。
function getCapacitorRuntime() {
  if (typeof window === "undefined") return null;
  return window.Capacitor || null;
}

export async function httpRequest({ url, method = "POST", headers = {}, body, timeoutMs = 120000 }) {
  const cap = getCapacitorRuntime();
  const isNative = cap?.isNativePlatform?.() === true;

  if (isNative && cap?.Plugins?.CapacitorHttp) {
    const res = await cap.Plugins.CapacitorHttp.request({
      url,
      method,
      headers,
      data: body,
      connectTimeout: timeoutMs,
      readTimeout: timeoutMs,
    });
    return { status: res.status, data: res.data };
  }

  // 1st: fetch を試す
  try {
    return await fetchRequest({ url, method, headers, body, timeoutMs });
  } catch (err) {
    console.warn("[httpClient] fetch 失敗、XMLHttpRequest にフォールバック", err);
  }
  // 2nd: XMLHttpRequest にフォールバック（多くのブラウザ拡張は XHR をフックしていない）
  return xhrRequest({ url, method, headers, body, timeoutMs });
}

async function fetchRequest({ url, method, headers, body, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await readResponseText(res);
    return { status: res.status, data: parseMaybeJson(text) };
  } finally {
    clearTimeout(timer);
  }
}

function xhrRequest({ url, method, headers, body, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.timeout = timeoutMs;
    xhr.responseType = "text";
    const allHeaders = { "Content-Type": "application/json", ...headers };
    for (const [k, v] of Object.entries(allHeaders)) {
      try {
        xhr.setRequestHeader(k, v);
      } catch (e) {
        console.warn("[httpClient] setRequestHeader skipped:", k, e?.message);
      }
    }
    xhr.onload = () => {
      const text = xhr.responseText ?? "";
      resolve({ status: xhr.status, data: parseMaybeJson(text) });
    };
    xhr.onerror = () => reject(new Error("XHR ネットワークエラー"));
    xhr.ontimeout = () => reject(new Error("XHR タイムアウト"));
    xhr.onabort = () => reject(new Error("XHR 中断"));
    xhr.send(body ? JSON.stringify(body) : null);
  });
}

function parseMaybeJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ブラウザ拡張が Response.text() をフックするケース向けの多段フォールバック。
async function readResponseText(res) {
  // 1st: arrayBuffer + TextDecoder
  try {
    const buf = await res.clone().arrayBuffer();
    return new TextDecoder("utf-8").decode(buf);
  } catch (err1) {
    console.warn("[httpClient] arrayBuffer 失敗", err1?.message);
  }
  // 2nd: 通常の text()
  try {
    return await res.text();
  } catch (err2) {
    console.warn("[httpClient] text() 失敗", err2?.message);
  }
  // 3rd: ReadableStream を直接読む
  const reader = res.body?.getReader?.();
  if (!reader) throw new Error("response.body が取得できません");
  const chunks = [];
  let total = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder("utf-8").decode(all);
}
