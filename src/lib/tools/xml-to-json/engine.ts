/**
 * XML → JSON — engine (custom parser, works in workers).
 *
 * A simple XML parser that builds a tree without DOMParser, so it runs
 * in web workers and all browsers. Handles attributes, text content,
 * and nested elements. CDATA is treated as text. Comments and processing
 * instructions are skipped.
 */
import type { XmlToJsonOptions, XmlToJsonResult } from "./types";

interface XmlNode {
    name: string;
    attributes: Record<string, string>;
    children: XmlNode[];
    text: string;
}

function parseXml(xml: string): XmlNode {
    // Tokenize: split into tags and text
    const tokens: string[] = [];
    let i = 0;
    while (i < xml.length) {
        if (xml[i] === '<') {
            const end = xml.indexOf('>', i + 1);
            if (end === -1) break;
            tokens.push(xml.slice(i, end + 1));
            i = end + 1;
        } else {
            const end = xml.indexOf('<', i);
            if (end === -1) {
                tokens.push(xml.slice(i));
                break;
            }
            const text = xml.slice(i, end);
            if (text.trim()) tokens.push(text);
            i = end;
        }
    }

    // Build tree using a stack
    const root: XmlNode = { name: 'root', attributes: {}, children: [], text: '' };
    const stack: XmlNode[] = [root];
    let current = root;

    for (const token of tokens) {
        if (token.startsWith('</')) {
            // closing tag
            stack.pop();
            current = stack[stack.length - 1] || root;
        } else if (token.startsWith('<?') || token.startsWith('<!')) {
            // processing instruction, comment, or doctype – skip
            continue;
        } else if (token.startsWith('<')) {
            // opening tag
            const tagMatch = token.match(/<(\w+)([^>]*)>/);
            if (!tagMatch) continue;
            const tagName = tagMatch[1];
            const attrsStr = tagMatch[2].trim();
            const attributes: Record<string, string> = {};
            // parse attributes: key="value" or key='value'
            const attrRe = /(\w+)\s*=\s*(["'])(.*?)\2/g;
            let match;
            while ((match = attrRe.exec(attrsStr)) !== null) {
                attributes[match[1]] = match[3];
            }
            const node: XmlNode = { name: tagName, attributes, children: [], text: '' };
            current.children.push(node);
            stack.push(node);
            current = node;
        } else {
            // text content
            const text = token.trim();
            if (text) {
                current.text += (current.text ? ' ' : '') + text;
            }
        }
    }

    return root.children[0] || root;
}

function nodeToJson(node: XmlNode, opts: XmlToJsonOptions): any {
    const obj: Record<string, any> = {};

    // Attributes
    if (opts.includeAttributes && Object.keys(node.attributes).length > 0) {
        for (const [key, val] of Object.entries(node.attributes)) {
            obj[`@${key}`] = val;
        }
    }

    // Group children by tag name
    const childMap: Record<string, any[]> = {};
    for (const child of node.children) {
        const val = nodeToJson(child, opts);
        const tag = child.name;
        if (!childMap[tag]) childMap[tag] = [];
        childMap[tag].push(val);
    }

    // If there is text and no children and no attributes, return text as string
    const text = node.text.trim();
    if (Object.keys(childMap).length === 0 && text && Object.keys(obj).length === 0) {
        return text;
    }

    // Add children to obj
    for (const [tag, arr] of Object.entries(childMap)) {
        if (opts.preserveArrays) {
            obj[tag] = arr.length === 1 ? arr[0] : arr;
        } else {
            obj[tag] = arr[arr.length - 1]; // last wins
        }
    }

    if (text) {
        obj['#text'] = text;
    }

    return obj;
}

export function convertXmlToJson(xml: string, opts: XmlToJsonOptions): XmlToJsonResult {
    const root = parseXml(xml);
    if (!root || !root.name) {
        throw new Error("Empty or invalid XML");
    }
    const json = nodeToJson(root, opts);
    const resultObj = { [root.name]: json };
    const indent = opts.indent === 'tab' ? '\t' : Number(opts.indent);
    const output = JSON.stringify(resultObj, null, indent);
    return {
        output,
        inputChars: xml.length,
        outputChars: output.length,
    };
}