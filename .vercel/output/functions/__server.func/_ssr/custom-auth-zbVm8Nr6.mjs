//#region node_modules/.nitro/vite/services/ssr/assets/custom-auth-zbVm8Nr6.js
async function login(username, password) {
	try {
		const res = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username,
				password
			})
		});
		if (!res.ok) {
			let msg = `Erro ${res.status}`;
			try {
				msg = (await res.json()).error || msg;
			} catch {
				msg = await res.text() || msg;
			}
			return {
				ok: false,
				error: msg
			};
		}
		const data = await res.json();
		return {
			ok: true,
			token: data.token,
			user: data.user
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Erro de conexão"
		};
	}
}
var TOKEN_KEY = "custom_auth_token";
var USER_KEY = "custom_auth_user";
function storeToken(token, user) {
	if (typeof window === "undefined") return;
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearToken() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}
function getStoredToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
}
function getStoredUser() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(USER_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed.username || !parsed.role) return null;
		return parsed;
	} catch {
		return null;
	}
}
/**
* Retorna headers com Authorization Bearer para chamadas autenticadas.
*/
function authHeaders(headers) {
	const token = getStoredToken();
	return {
		"Content-Type": "application/json",
		...token ? { Authorization: `Bearer ${token}` } : {},
		...headers
	};
}
/**
* Wrapper do fetch que inclui o token automaticamente para URLs da própria API.
*/
async function authFetch(url, options) {
	const headers = authHeaders(options?.headers);
	if (options?.body instanceof FormData) delete headers["Content-Type"];
	return fetch(url, {
		...options,
		headers
	});
}
//#endregion
export { login as a, getStoredUser as i, clearToken as n, storeToken as o, getStoredToken as r, authFetch as t };
