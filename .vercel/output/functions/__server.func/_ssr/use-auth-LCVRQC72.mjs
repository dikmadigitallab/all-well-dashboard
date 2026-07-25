import { o as __toESM } from "../_runtime.mjs";
import { a as login, i as getStoredUser, n as clearToken, o as storeToken, r as getStoredToken } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-LCVRQC72.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthCtx = (0, import_react.createContext)(void 0);
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [role, setRole] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const savedUser = getStoredUser();
		const savedToken = getStoredToken();
		if (savedUser && savedToken) {
			setUser(savedUser);
			setRole(savedUser.role ?? "gestor");
		}
		setLoading(false);
	}, []);
	const signIn = async (username, password) => {
		const result = await login(username, password);
		if (!result.ok) return { error: result.error };
		storeToken(result.token, result.user);
		setUser(result.user);
		setRole(result.user.role ?? "gestor");
		return { error: null };
	};
	const signOut = async () => {
		clearToken();
		setUser(null);
		setRole(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthCtx.Provider, {
		value: {
			user,
			role,
			loading,
			isAdmin: role === "admin",
			signIn,
			signOut
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthCtx);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
//#endregion
export { useAuth as n, AuthProvider as t };
