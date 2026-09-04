// Service for interacting with GitHub REST API
// Stores data securely under the user's GitHub account

// Helper to encode string to UTF-8 base64
export function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to decode UTF-8 base64 to string
export function base64ToUtf8(str) {
  const binary = atob(str.replace(/\s/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Verify GitHub Personal Access Token
export async function verifyGitHubToken(token) {
  if (!token) return { valid: false, error: 'Токен не указан' };
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) {
      if (res.status === 401) return { valid: false, error: 'Неверный токен или срок действия истек' };
      return { valid: false, error: `Ошибка GitHub API: ${res.status} ${res.statusText}` };
    }
    const user = await res.json();
    return { valid: true, user };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// Check repository access
export async function checkRepoAccess(token, owner, repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (res.status === 404) {
      return { exists: false, canWrite: false, error: 'Репозиторий не найден или нет прав доступа' };
    }
    if (!res.ok) {
      return { exists: false, canWrite: false, error: `Ошибка ${res.status}: ${res.statusText}` };
    }
    const data = await res.json();
    const canWrite = data.permissions ? (data.permissions.push || data.permissions.admin) : true;
    return { exists: true, canWrite, repoData: data };
  } catch (err) {
    return { exists: false, canWrite: false, error: err.message };
  }
}

// Fetch file from GitHub Repository
export async function fetchRepoFile(token, owner, repo, path) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main&t=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (res.status === 404) {
      // File does not exist yet (e.g. first run)
      return { exists: false, data: null, sha: null };
    }
    if (!res.ok) {
      throw new Error(`Ошибка загрузки (${res.status}): ${res.statusText}`);
    }
    const json = await res.json();
    const content = base64ToUtf8(json.content);
    const parsed = JSON.parse(content);
    return { exists: true, data: parsed, sha: json.sha };
  } catch (err) {
    throw err;
  }
}

// Save file to GitHub Repository
export async function saveRepoFile(token, owner, repo, path, dataObj, sha, commitMessage) {
  try {
    const contentStr = JSON.stringify(dataObj, null, 2);
    const base64Content = utf8ToBase64(contentStr);

    let finalMessage = commitMessage || `Update debet records [${new Date().toLocaleString('ru-RU')}]`;
    if (!finalMessage.includes('[skip ci]') && !finalMessage.includes('[ci skip]') && !finalMessage.includes('[skip actions]')) {
      finalMessage += ' [skip ci]';
    }

    const body = {
      message: finalMessage,
      content: base64Content,
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Ошибка сохранения (${res.status}): ${res.statusText}`);
    }

    const resJson = await res.json();
    return { success: true, sha: resJson.content.sha };
  } catch (err) {
    throw err;
  }
}
