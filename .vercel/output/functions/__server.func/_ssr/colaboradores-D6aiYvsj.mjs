//#region node_modules/.nitro/vite/services/ssr/assets/colaboradores-D6aiYvsj.js
var STATUS_LABEL = {
	em_dia: "Em dia",
	a_vencer: "A vencer",
	vencido: "Vencido",
	sem_exame: "Sem exame"
};
var STATUS_CLASSES = {
	em_dia: "bg-status-ok/20 text-status-ok-foreground border-status-ok/40",
	a_vencer: "bg-status-warn/25 text-status-warn-foreground border-status-warn/50",
	vencido: "bg-status-danger/20 text-status-danger border-status-danger/40",
	sem_exame: "bg-status-neutral/40 text-status-neutral-foreground border-status-neutral/60"
};
function statusBadge(s) {
	const st = s ?? "sem_exame";
	return {
		label: STATUS_LABEL[st],
		className: STATUS_CLASSES[st]
	};
}
function formatDate(d) {
	if (!d) return "—";
	const dt = new Date(d);
	if (Number.isNaN(dt.getTime())) return "—";
	return dt.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
function formatCPF(cpf) {
	if (!cpf) return "—";
	return cpf.replace(/\D/g, "").padStart(11, "0").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
//#endregion
export { statusBadge as i, formatCPF as n, formatDate as r, STATUS_LABEL as t };
