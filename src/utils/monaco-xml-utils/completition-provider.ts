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
    for (const item of items) {
        const itemIdx = text.indexOf(item);
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

function getItemDocumentation(element: Element) {
    for (const child of [].concat(...element.children as any as Element[])) {
        if (child.tagName === 'xs:annotation') {
            return getItemDocumentation(element.children[0]);
        } else if (child.tagName === 'xs:documentation') {
            return child.textContent.trim();
        }
    }
}

function getAvailableElements(element: Element): monaco.languages.CompletionItem[] {
    const complexType = [].concat(...element.children as any as HTMLElement[])
        .find((c) => c.tagName === 'xs:complexType');

    const sequences =  [].concat(...complexType.children).filter((child) => child.tagName === 'xs:sequence');
    const allowedElements = [].concat(...sequences.map((s) => [].concat(...s.children).filter((child) => child.tagName === 'xs:element')));

    return allowedElements.map((el) => {
        const elementName = el.getAttribute('name');
        const elementType = el.getAttribute('type');
        return {
            label: elementName,
            kind: monaco.languages.CompletionItemKind.Field,
            detail: elementType,
            documentation: getItemDocumentation(el),
            insertText: `<${elementName}></${elementName}>`
        } as monaco.languages.CompletionItem;
    });
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

            const usedAttributes: string[] = outerXmlNode.split(' ')
                .map((n) => RegExp(/(\S+)=(["'])(\S)([>"'])?/)
                .exec(n))
                .filter((a) => a != null)
                .map((a) => a[1]);

            // return available elements/attributes if the tag exists in the schema, or an empty
            // array if it doesn't
            if (isAttributeSearch) {
                // get attributes completions
                return currentItem ? getAvailableAttribute(currentItem, usedAttributes) : [];
            } else {
                // get elements completions
                return currentItem ? getAvailableElements(currentItem, usedItems) : [];
            }
        },

    };
}
