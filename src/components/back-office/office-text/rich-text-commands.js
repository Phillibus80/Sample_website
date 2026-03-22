const MAX_INDENT_LEVEL = 3;

/**
 * Returns the current selection range if it falls inside the editor element.
 *
 * @param {HTMLElement} editorEl
 * @return {Range|null}
 */
const getEditorRange = (editorEl) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!editorEl.contains(range.commonAncestorContainer)) return null;
    return range;
};

/**
 * Restores focus and selection to a range inside the editor.
 *
 * @param {HTMLElement} editorEl
 * @param {Range} range
 */
const restoreSelection = (editorEl, range) => {
    editorEl.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

/**
 * Finds the nearest ancestor element with the given tag name, stopping at the editor root.
 *
 * @param {Node} node
 * @param {string} tagName
 * @param {HTMLElement} stopAt
 * @return {HTMLElement|null}
 */
const findAncestorTag = (node, tagName, stopAt) => {
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current !== stopAt) {
        if (current.tagName?.toLowerCase() === tagName) return current;
        current = current.parentElement;
    }
    return null;
};

/**
 * Unwraps an element — replaces it with its children in place.
 *
 * @param {HTMLElement} el
 */
const unwrap = (el) => {
    const parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
};

/**
 * Toggles inline formatting (bold/italic/underline) on the current selection.
 * Pure Selection/Range — no execCommand.
 *
 * @param {HTMLElement} editorEl
 * @param {'strong'|'em'|'u'} tagName
 */
export const toggleInline = (editorEl, tagName) => {
    const range = getEditorRange(editorEl);
    if (!range || range.collapsed) return;

    const existing = findAncestorTag(range.commonAncestorContainer, tagName, editorEl);
    if (existing) {
        unwrap(existing);
        editorEl.focus();
        return;
    }

    const wrapper = document.createElement(tagName);
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);

    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    restoreSelection(editorEl, newRange);
};

/**
 * Finds the block-level container (div, p, h3, h4, li, blockquote) for a node.
 *
 * @param {Node} node
 * @param {HTMLElement} editorEl
 * @return {HTMLElement}
 */
const getBlockContainer = (node, editorEl) => {
    const blockTags = ['div', 'p', 'h3', 'h4', 'li', 'blockquote'];
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current !== editorEl) {
        if (blockTags.includes(current.tagName?.toLowerCase())) return current;
        current = current.parentElement;
    }
    return editorEl;
};

/**
 * Toggles a block-level tag (h3 for heading, h4 for subheading) on the
 * current line. If the line already is that tag, reverts to a plain div.
 *
 * @param {HTMLElement} editorEl
 * @param {'h3'|'h4'} tagName
 */
export const toggleBlock = (editorEl, tagName) => {
    const range = getEditorRange(editorEl);
    if (!range) return;

    const block = getBlockContainer(range.startContainer, editorEl);
    if (block === editorEl) return;

    const currentTag = block.tagName.toLowerCase();
    const newTag = currentTag === tagName ? 'div' : tagName;
    const replacement = document.createElement(newTag);
    while (block.firstChild) replacement.appendChild(block.firstChild);
    block.parentNode.replaceChild(replacement, block);

    const newRange = document.createRange();
    newRange.selectNodeContents(replacement);
    newRange.collapse(false);
    restoreSelection(editorEl, newRange);
};

/**
 * Toggles the current line into/out of a list (ul or ol).
 *
 * @param {HTMLElement} editorEl
 * @param {'ul'|'ol'} listTag
 */
export const toggleList = (editorEl, listTag) => {
    const range = getEditorRange(editorEl);
    if (!range) return;

    const li = findAncestorTag(range.startContainer, 'li', editorEl);
    if (li) {
        // Already in a list — unwrap this item back to a div
        const list = li.parentElement;
        const div = document.createElement('div');
        while (li.firstChild) div.appendChild(li.firstChild);
        list.parentNode.insertBefore(div, list.nextSibling);
        li.remove();
        if (!list.children.length) list.remove();

        const newRange = document.createRange();
        newRange.selectNodeContents(div);
        newRange.collapse(false);
        restoreSelection(editorEl, newRange);
        return;
    }

    const block = getBlockContainer(range.startContainer, editorEl);
    if (block === editorEl) return;

    const list = document.createElement(listTag);
    const item = document.createElement('li');
    while (block.firstChild) item.appendChild(block.firstChild);
    list.appendChild(item);
    block.parentNode.replaceChild(list, block);

    const newRange = document.createRange();
    newRange.selectNodeContents(item);
    newRange.collapse(false);
    restoreSelection(editorEl, newRange);
};

/**
 * Counts how many blockquote ancestors a node has (indent depth).
 *
 * @param {Node} node
 * @param {HTMLElement} editorEl
 * @return {number}
 */
const getIndentDepth = (node, editorEl) => {
    let depth = 0;
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current !== editorEl) {
        if (current.tagName?.toLowerCase() === 'blockquote') depth++;
        current = current.parentElement;
    }
    return depth;
};

/**
 * Adds one level of indentation (wraps current block in blockquote).
 * Capped at 3 levels.
 *
 * @param {HTMLElement} editorEl
 */
export const indent = (editorEl) => {
    const range = getEditorRange(editorEl);
    if (!range) return;

    if (getIndentDepth(range.startContainer, editorEl) >= MAX_INDENT_LEVEL) return;

    const block = getBlockContainer(range.startContainer, editorEl);
    if (block === editorEl) return;

    const bq = document.createElement('blockquote');
    block.parentNode.insertBefore(bq, block);
    bq.appendChild(block);

    const newRange = document.createRange();
    newRange.selectNodeContents(block);
    newRange.collapse(false);
    restoreSelection(editorEl, newRange);
};

/**
 * Removes one level of indentation (unwraps nearest blockquote ancestor).
 * No-op if already at level 0.
 *
 * @param {HTMLElement} editorEl
 */
export const outdent = (editorEl) => {
    const range = getEditorRange(editorEl);
    if (!range) return;

    const bq = findAncestorTag(range.startContainer, 'blockquote', editorEl);
    if (!bq) return;

    unwrap(bq);
    editorEl.focus();
};

/**
 * Inserts a link at the current selection/cursor position.
 * If text is selected, wraps it; otherwise inserts the link text.
 *
 * @param {HTMLElement} editorEl
 * @param {string} url - already validated by caller
 * @param {string} text
 * @param {Range} [savedRange] - optional pre-saved range (for modal workflow)
 */
export const insertLink = (editorEl, url, text, savedRange) => {
    editorEl.focus();
    let range = savedRange;
    if (!range) {
        range = getEditorRange(editorEl);
    }
    if (!range) {
        // No selection — insert at end of editor
        range = document.createRange();
        range.selectNodeContents(editorEl);
        range.collapse(false);
    }

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.textContent = text || url;

    range.deleteContents();
    range.insertNode(anchor);

    const newRange = document.createRange();
    newRange.setStartAfter(anchor);
    newRange.collapse(true);
    restoreSelection(editorEl, newRange);
};

/**
 * Inserts plain text at the cursor (used by paste handler).
 *
 * @param {HTMLElement} editorEl
 * @param {string} text
 */
export const insertPlainText = (editorEl, text) => {
    const range = getEditorRange(editorEl);
    if (!range) return;
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    restoreSelection(editorEl, range);
};
