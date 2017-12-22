export function stringToXml(text): Document {
    return new DOMParser().parseFromString(text, 'text/xml');
}
function getLastOpenedTag(text) {
    // get all tags inside of the content
    const tags = text.match(/<\/*(?=\S*)([a-zA-Z-]+)/g);
    if (!tags) {
        return undefined;
    }
    // we need to know which tags are closed
    const closingTags = [];
    for (let i = tags.length - 1; i >= 0; i--) {
        if (tags[i].indexOf('</') === 0) {
            closingTags.push(tags[i].substring('</'.length));
        } else {
            // get the last position of the tag
            const tagPosition = text.lastIndexOf(tags[i]);
            const tag = tags[i].substring('<'.length);
            const closingBracketIdx = text.indexOf('/>', tagPosition);
            // if the tag wasn't closed
            if (closingBracketIdx === -1) {
                // if there are no closing tags or the current tag wasn't closed
                if (!closingTags.length || closingTags[closingTags.length - 1] !== tag) {
                    // we found our tag, but let's get the information if we are looking for
                    // a child element or an attribute
                    text = text.substring(tagPosition);
                    return {
                        tagName: tag,
                        isAttributeSearch: text.indexOf('<') > text.indexOf('>')
                    };
                }
                // remove the last closed tag
                closingTags.splice(closingTags.length - 1, 1);
            }
            // remove the last checked tag and continue processing the rest of the content
            text = text.substring(0, tagPosition);
        }
    }
}

function getAreaInfo(text) {
    // opening for strings, comments and CDATA
    const items = ['"', '\'', '<!--', '<![CDATA['];
    let isCompletionAvailable = true;
    // remove all comments, strings and CDATA
    text = text.replace(/"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g, '');
    for (let i = 0; i < items.length; i++) {
        const itemIdx = text.indexOf(items[i]);
        if (itemIdx > -1) {
            // we are inside one of unavailable areas, so we remote that area
            // from our clear text
            text = text.substring(0, itemIdx);
            // and the completion is not available
            isCompletionAvailable = false;
        }
    }
    return {
        isCompletionAvailable,
        clearedText: text
    };
}

function shouldSkipLevel(tagName) {
    // if we look at the XSD schema, these nodes are containers for elements,
    // so we can skip that level
    return tagName === 'complexType' || tagName === 'all' || tagName === 'sequence' || tagName === 'extension';
}

function findElements(elements: HTMLCollection, elementName?: string) {
    for (const element of elements as any as HTMLElement[]) {
        // we are looking for elements, so we don't need to process annotations and attributes
        if (element.tagName !== 'annotation' && element.tagName !== 'attribute') {
            // if it is one of the nodes that do not have the info we need, skip it
            // and process that node's child items
            if (shouldSkipLevel(element.tagName)) {
                const child = findElements(element.children, elementName);
                // if child exists, return it
                if (child) {
                    return child;
                }
            } else if (!elementName) {
                // if there is no elementName, return all elements (we'll explain
                // this bit little later
                return elements;
            } else if (getElementAttributes(element).name === elementName) {
                // find all the element attributes, and if is't name is the same
                // as the element we're looking for, return the element.
                return element;
            }
        }
    }
}

function findAttributes(elements: HTMLCollection): Element[] {
    const attrs: Element[] = [];
    for (const element of elements as any as Element[]) {
        if (element.tagName === 'complexType') {
            const child = findAttributes(element.children);
            if (child) {
                return child;
            }
        } else if (element.tagName === 'attribute') {
            attrs.push(element);
        }
    }
    return attrs;
}

function getElementAttributes(element) {
    const attrs = {};
    for (let i = 0; i < element.attributes.length; i++) {
        attrs[element.attributes[i].name] = element.attributes[i].value;
    }
    // return all attributes as an object
    return attrs;
}

function getItemDocumentation(element) {
    for (let i = 0; i < element.children.length; i++) {
        // annotaion contains documentation, so calculate the
        // documentation from it's child elements
        if (element.children[i].tagName === 'annotation') {
            return getItemDocumentation(element.children[0]);
        } else if (element.children[i].tagName === 'documentation') {
            return element.children[i].textContent;
        }
    }
}

function isItemAvailable(itemName, maxOccurs, items) {
    // the default for 'maxOccurs' is 1
    maxOccurs = maxOccurs || '1';
    // the element can appere infinite times, so it is availabel
    if (maxOccurs && maxOccurs === 'unbounded') {
        return true;
    }
    // count how many times the element appered
    let count = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i] === itemName) {
            count++;
        }
    }
    // if it didn't appear yet, or it can appear again, then it
    // is available, otherwise it't not
    return count === 0 || parseInt(maxOccurs, 0) > count;
}

function getAvailableElements(elements, usedItems): monaco.languages.CompletionItem[] {
    const availableItems: monaco.languages.CompletionItem[] = [];
    let children;
    for (let i = 0; i < elements.length; i++) {
        // annotation element only contains documentation,
        // so no need to process it here
        if (elements[i].tagName !== 'annotation') {
            // get all child elements that have 'element' tag
            children = findElements([elements[i]]);
        }
    }
    // if there are no such elements, then there are no suggestions
    if (!children) {
        return [];
    }
    for (let i = 0; i < children.length; i++) {
        // get all element attributes
        const elementAttrs = getElementAttributes(children[i]);
        // the element is a suggestion if it's available
        if (isItemAvailable(elementAttrs.name, elementAttrs.maxOccurs, usedItems)) {
            // mark it as a 'field', and get the documentation
            availableItems.push({
                label: elementAttrs.name,
                kind: monaco.languages.CompletionItemKind.Field,
                detail: elementAttrs.type,
                documentation: getItemDocumentation(children[i]),
                insertText: `<${elementAttrs.name}></${elementAttrs.name}>`
            });
        }
    }
    // return the suggestions we found
    return availableItems;
}

function getAvailableAttribute(element: Element, usedAttributes: string[]) {
    const complexTypeElement = [].concat(...element.children as any as HTMLElement[])
        .find((c) => c.tagName === 'xs:complexType');
    const attributeElements = [].concat(...complexTypeElement.children as any as HTMLElement[])
        .filter((c) => c.tagName === 'xs:attribute' && usedAttributes.indexOf(c.getAttribute('name')) === -1)
        .map((a) => {
            const attributeName = a.getAttribute('name');
            return {
                label: attributeName,
                kind: monaco.languages.CompletionItemKind.Property,
                detail: a.getAttribute('type'),
                documentation: getItemDocumentation(a),
                insertText: `${attributeName}=""`,
            } as monaco.languages.CompletionItem;
        });
    return attributeElements;
}

export function cropSegment(model: monaco.editor.IReadOnlyModel, position: monaco.Position, beforeToken: string, afterToken: string): string {
    let contentPosition: number = position.column - 1;
    for (let i = 0; i < position.lineNumber - 1; i++) {
        contentPosition += model.getLineContent(i + 1).length + 2;
    }
    const modelValue = model.getValue();
    const before = modelValue.substring(0, contentPosition);
    const beforeSegment = before.substring(before.lastIndexOf(beforeToken) - beforeToken.length, before.length);
    const after = modelValue.substring(contentPosition, modelValue.length);
    const afterSegment = after.substring(0, after.indexOf(afterToken) + afterToken.length);
    return `${beforeSegment}${afterSegment}`;
}

export function getOuterXmlElementSegment(model: monaco.editor.IReadOnlyModel, position: monaco.Position) {
    return cropSegment(model, position, '<', '>');
}

export function getXsdCompletionProvider(schemaString: string): monaco.languages.CompletionItemProvider {
    return {
        triggerCharacters: ['<'],
        provideCompletionItems(model, position) {
            const schemaNode = stringToXml(schemaString).childNodes[0] as Element;
            // get editor content before the pointer
            const textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
            // get content info - are we inside of the area where we don't want suggestions, what is the content without those areas
            const areaUntilPositionInfo = getAreaInfo(textUntilPosition); // isCompletionAvailable, clearedText
            // if we don't want any suggestions, return empty array
            if (!areaUntilPositionInfo.isCompletionAvailable) {
                return [];
            }
            // if we want suggestions, inside of which tag are we?
            const lastOpenedTag = getLastOpenedTag(areaUntilPositionInfo.clearedText);
            // get opened tags to see what tag we should look for in the XSD schema
            const openedTags = [];
            // get the elements/attributes that are already mentioned in the element we're in
            const usedItems = [];
            const isAttributeSearch = lastOpenedTag && lastOpenedTag.isAttributeSearch;
            // no need to calculate the position in the XSD schema if we are in the root element
            if (lastOpenedTag) {
                // parse the content (not cleared text) into an xml document
                const xmlDoc = stringToXml(textUntilPosition);
                let lastChild = xmlDoc.lastElementChild;
                while (lastChild) {
                    openedTags.push(lastChild.tagName);
                    // if we found our last opened tag
                    if (lastChild.tagName === lastOpenedTag.tagName) {
                        // if we are looking for attributes, then used items should
                        // be the attributes we already used
                        if (lastOpenedTag.isAttributeSearch) {
                            const attrs = lastChild.attributes;
                            for (const attribute of attrs as any as Attr[]) {
                                usedItems.push(attribute.nodeName);
                            }
                        } else {
                            // if we are looking for child elements, then used items
                            // should be the elements that were already used
                            const children = lastChild.children;
                            for (const child of children as any as Element[]) {
                                usedItems.push(child.tagName);
                            }
                        }
                        break;
                    }
                    // we haven't found the last opened tag yet, so we move to
                    // the next element
                    lastChild = lastChild.lastElementChild;
                }
            }
            // find the last opened tag in the schema to see what elements/attributes it can have
            const currentItem = schemaNode.querySelector(openedTags.map((t) => `element[name=${t}]`).join(' '));
            const outerXmlNode = getOuterXmlElementSegment(model, position);

            const usedAttributes = outerXmlNode.split(' ').map((n) => RegExp(/(\S+)=(["'])(\S)([>"'])?/).exec(n)).filter((a) => a != null).map((a) => a[1]);

            // return available elements/attributes if the tag exists in the schema, or an empty
            // array if it doesn't
            if (isAttributeSearch) {
                // get attributes completions
                return currentItem ? getAvailableAttribute(currentItem, usedAttributes) : [];
            } else {
                // get elements completions
                return currentItem ? getAvailableElements(currentItem.children, usedItems) : [];
            }
        },

    };
}
