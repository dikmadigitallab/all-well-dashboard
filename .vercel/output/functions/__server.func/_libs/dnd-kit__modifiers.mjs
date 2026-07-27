import "./@dnd-kit/core+[...].mjs";
//#region node_modules/@dnd-kit/modifiers/dist/modifiers.esm.js
function restrictToBoundingRect(transform, rect, boundingRect) {
	const value = { ...transform };
	if (rect.top + transform.y <= boundingRect.top) value.y = boundingRect.top - rect.top;
	else if (rect.bottom + transform.y >= boundingRect.top + boundingRect.height) value.y = boundingRect.top + boundingRect.height - rect.bottom;
	if (rect.left + transform.x <= boundingRect.left) value.x = boundingRect.left - rect.left;
	else if (rect.right + transform.x >= boundingRect.left + boundingRect.width) value.x = boundingRect.left + boundingRect.width - rect.right;
	return value;
}
var restrictToFirstScrollableAncestor = (_ref) => {
	let { draggingNodeRect, transform, scrollableAncestorRects } = _ref;
	const firstScrollableAncestorRect = scrollableAncestorRects[0];
	if (!draggingNodeRect || !firstScrollableAncestorRect) return transform;
	return restrictToBoundingRect(transform, draggingNodeRect, firstScrollableAncestorRect);
};
//#endregion
export { restrictToFirstScrollableAncestor as t };
