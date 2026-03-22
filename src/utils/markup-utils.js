import {createElement, Fragment} from 'react';

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];
const MAX_INDENT_LEVEL = 3;

/**
 * Validates a URL against the protocol whitelist.
 * Blocks javascript:, data:, vbscript: and other XSS vectors.
 *
 * @param {string} urlString
 * @return {boolean}
 */
export const isValidUrl = (urlString) => {
    if (!urlString || typeof urlString !== 'string') return false;
    try {
        const parsed = new URL(urlString);
        return ALLOWED_PROTOCOLS.includes(parsed.protocol);
    } catch {
        return false;
    }
};

/**
 * Escapes HTML special characters so user text cannot inject tags.
 *
 * @param {string} str
 * @return {string}
 */
const escapeHtml = (str) => {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * Parses inline markers (**bold**, *italic*, __underline__, [text](url))
 * within a single line of markup and returns an array of tokens.
 * Each token is {type, content, href?}.
 *
 * @param {string} line
 * @return {Array<{type: string, content: string, href?: string}>}
 */
const tokenizeInline = (line) => {
    const tokens = [];
    let remaining = line;

    while (remaining.length > 0) {
        // [text](url) - link
        const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
            tokens.push({type: 'link', content: linkMatch[1], href: linkMatch[2]});
            remaining = remaining.slice(linkMatch[0].length);
            continue;
        }
        // **bold**
        const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
            tokens.push({type: 'bold', content: boldMatch[1]});
            remaining = remaining.slice(boldMatch[0].length);
            continue;
        }
        // __underline__
        const underlineMatch = remaining.match(/^__([^_]+)__/);
        if (underlineMatch) {
            tokens.push({type: 'underline', content: underlineMatch[1]});
            remaining = remaining.slice(underlineMatch[0].length);
            continue;
        }
        // *italic* (single star, not followed by another star)
        const italicMatch = remaining.match(/^\*([^*]+)\*/);
        if (italicMatch) {
            tokens.push({type: 'italic', content: italicMatch[1]});
            remaining = remaining.slice(italicMatch[0].length);
            continue;
        }
        // Plain text up to the next potential marker
        const nextMarker = remaining.search(/[*_[]/);
        if (nextMarker === -1) {
            tokens.push({type: 'text', content: remaining});
            remaining = '';
        } else if (nextMarker === 0) {
            // Marker char that didn't match any pattern - treat as literal
            tokens.push({type: 'text', content: remaining[0]});
            remaining = remaining.slice(1);
        } else {
            tokens.push({type: 'text', content: remaining.slice(0, nextMarker)});
            remaining = remaining.slice(nextMarker);
        }
    }

    return tokens;
};

/**
 * Renders inline tokens to an HTML string.
 *
 * @param {Array} tokens
 * @return {string}
 */
const tokensToHtml = (tokens) => {
    return tokens.map(t => {
        const safe = escapeHtml(t.content);
        switch (t.type) {
            case 'bold': return `<strong>${safe}</strong>`;
            case 'italic': return `<em>${safe}</em>`;
            case 'underline': return `<u>${safe}</u>`;
            case 'link':
                return isValidUrl(t.href)
                    ? `<a href="${escapeHtml(t.href)}">${safe}</a>`
                    : safe;
            default: return safe;
        }
    }).join('');
};

/**
 * Renders inline tokens to React elements.
 *
 * @param {Array} tokens
 * @param {string} keyPrefix
 * @return {Array<React.ReactNode>}
 */
const tokensToReact = (tokens, keyPrefix) => {
    return tokens.map((t, i) => {
        const key = `${keyPrefix}-${i}`;
        switch (t.type) {
            case 'bold': return createElement('strong', {key}, t.content);
            case 'italic': return createElement('em', {key}, t.content);
            case 'underline': return createElement('u', {key}, t.content);
            case 'link':
                return isValidUrl(t.href)
                    ? createElement('a', {
                        key,
                        href: t.href,
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    }, t.content)
                    : t.content;
            default: return t.content;
        }
    });
};

/**
 * Parses a markup line and returns its block type + inline content.
 *
 * @param {string} line
 * @return {{type: string, content: string, level?: number}}
 */
const parseBlock = (line) => {
    // ### subheading (check before ## heading)
    if (line.startsWith('### ')) return {type: 'h4', content: line.slice(4)};
    if (line.startsWith('## ')) return {type: 'h3', content: line.slice(3)};
    // Indent: >, >>, >>> (count leading >)
    const indentMatch = line.match(/^(>{1,3})\s(.*)$/);
    if (indentMatch) {
        return {type: 'indent', level: indentMatch[1].length, content: indentMatch[2]};
    }
    if (line.startsWith('- ')) return {type: 'ul', content: line.slice(2)};
    if (/^\d+\.\s/.test(line)) return {type: 'ol', content: line.replace(/^\d+\.\s/, '')};
    return {type: 'p', content: line};
};

/**
 * Converts markup string to HTML for populating the contentEditable editor.
 *
 * @param {string} markup
 * @return {string}
 */
export const markupToHtml = (markup) => {
    if (!markup) return '';
    const lines = markup.split('\n');
    const html = [];
    let i = 0;

    while (i < lines.length) {
        const block = parseBlock(lines[i]);
        const inlineHtml = tokensToHtml(tokenizeInline(block.content));

        if (block.type === 'ul' || block.type === 'ol') {
            const listTag = block.type;
            const items = [];
            while (i < lines.length && parseBlock(lines[i]).type === listTag) {
                const itemBlock = parseBlock(lines[i]);
                items.push(`<li>${tokensToHtml(tokenizeInline(itemBlock.content))}</li>`);
                i++;
            }
            html.push(`<${listTag}>${items.join('')}</${listTag}>`);
            continue;
        }

        if (block.type === 'indent') {
            const level = Math.min(block.level, MAX_INDENT_LEVEL);
            const open = '<blockquote>'.repeat(level);
            const close = '</blockquote>'.repeat(level);
            html.push(`${open}${inlineHtml || '<br>'}${close}`);
        } else if (block.type === 'h3' || block.type === 'h4') {
            html.push(`<${block.type}>${inlineHtml}</${block.type}>`);
        } else {
            html.push(`<div>${inlineHtml || '<br>'}</div>`);
        }
        i++;
    }

    return html.join('');
};

/**
 * Converts markup string to React elements for public-site rendering.
 * Never uses dangerouslySetInnerHTML — all output is React-built.
 *
 * @param {string} markup
 * @return {React.ReactNode}
 */
export const markupToReact = (markup) => {
    if (!markup) return null;
    const lines = markup.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const block = parseBlock(lines[i]);
        const key = `blk-${i}`;

        if (block.type === 'ul' || block.type === 'ol') {
            const listTag = block.type;
            const items = [];
            while (i < lines.length && parseBlock(lines[i]).type === listTag) {
                const itemBlock = parseBlock(lines[i]);
                items.push(createElement(
                    'li',
                    {key: `li-${i}`},
                    tokensToReact(tokenizeInline(itemBlock.content), `li-${i}`)
                ));
                i++;
            }
            elements.push(createElement(listTag, {key}, items));
            continue;
        }

        const inline = tokensToReact(tokenizeInline(block.content), key);

        if (block.type === 'indent') {
            const level = Math.min(block.level, MAX_INDENT_LEVEL);
            let node = createElement('div', {key: `${key}-inner`}, inline);
            for (let l = 0; l < level; l++) {
                node = createElement('blockquote', {key: `${key}-bq-${l}`}, node);
            }
            elements.push(node);
        } else if (block.type === 'h3' || block.type === 'h4') {
            elements.push(createElement(block.type, {key}, inline));
        } else if (block.content === '') {
            elements.push(createElement('br', {key}));
        } else {
            elements.push(createElement('p', {key, style: {marginBottom: '0.5rem'}}, inline));
        }
        i++;
    }

    return createElement(Fragment, null, elements);
};

/**
 * Walks a DOM node and emits markup for its contents.
 * Whitelist-only: unrecognized tags are unwrapped (children processed, tag dropped).
 *
 * @param {Node} node
 * @return {string}
 */
const nodeToMarkup = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    const inner = Array.from(node.childNodes).map(nodeToMarkup).join('');

    switch (tag) {
        case 'strong':
        case 'b':
            return `**${inner}**`;
        case 'em':
        case 'i':
            return `*${inner}*`;
        case 'u':
            return `__${inner}__`;
        case 'a': {
            const href = node.getAttribute('href') || '';
            return isValidUrl(href) ? `[${inner}](${href})` : inner;
        }
        case 'h3':
            return `## ${inner}\n`;
        case 'h4':
            return `### ${inner}\n`;
        case 'li':
            // Parent determines bullet vs number; handled in ul/ol cases
            return inner;
        case 'ul':
            return Array.from(node.children)
                .map(li => `- ${nodeToMarkup(li)}`)
                .join('\n') + '\n';
        case 'ol':
            return Array.from(node.children)
                .map((li, idx) => `${idx + 1}. ${nodeToMarkup(li)}`)
                .join('\n') + '\n';
        case 'blockquote': {
            // Count nesting depth by walking down single-child blockquotes
            let depth = 1;
            let current = node;
            while (
                current.children.length === 1
                && current.children[0].tagName?.toLowerCase() === 'blockquote'
                && depth < MAX_INDENT_LEVEL
            ) {
                depth++;
                current = current.children[0];
            }
            const bqInner = Array.from(current.childNodes).map(nodeToMarkup).join('');
            return `${'>'.repeat(depth)} ${bqInner}\n`;
        }
        case 'br':
            return '\n';
        case 'div':
        case 'p':
            return inner + '\n';
        default:
            // Unrecognized tag: unwrap, keep text content only
            return inner;
    }
};

/**
 * Converts HTML from the contentEditable editor into markup for DB storage.
 * Acts as a whitelist sanitizer — only recognized tags produce markers,
 * everything else is stripped to text.
 *
 * @param {string} htmlString
 * @return {string}
 */
export const htmlToMarkup = (htmlString) => {
    if (!htmlString) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const markup = Array.from(doc.body.childNodes).map(nodeToMarkup).join('');
    // Collapse 3+ consecutive newlines to max 2 (one blank line)
    return markup.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '');
};
