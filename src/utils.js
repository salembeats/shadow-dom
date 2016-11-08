const native = {
    insertBefore: Node.prototype.insertBefore,
    removeChild: Node.prototype.removeChild,
    cloneNode: Node.prototype.cloneNode,
    appendChild: Node.prototype.appendChild,
    parentNode: Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode'),
    firstChild: Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild'),
    childNodes: Object.getOwnPropertyDescriptor(Node.prototype, 'childNodes')
};

const slice = array => Array.prototype.slice.call(array);

export function makeError(name, message) {
    var error = new Error(message || name);
    error.name = name;
    return error;
}

export function extend(object, ...mixins) {
    for (let i = 0; i < mixins.length; i++) {
        const mixin = mixins[i].prototype;
        const names = Object.getOwnPropertyNames(mixin);
        for (let j = 0; j < names.length; j++) {
            const name = names[j];
            if (name === 'constructor') {
                continue;
            }
            const descriptor = Object.getOwnPropertyDescriptor(mixin, name);
            Object.defineProperty(object.prototype || object, name, descriptor);
        }
    }
}

export function shadow(object, info) {
    const shadow = object._shadow || {};
    if (info) {
        const names = Object.getOwnPropertyNames(info);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            shadow[name] = info[name];
        }
    }
    return object._shadow = shadow;
}

export function convertNodesIntoANode(nodes, document) {
    // https://dom.spec.whatwg.org/#converting-nodes-into-a-node
    let node = null;

    for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];

        if (typeof item === "string") {
            nodes[i] = document.createTextNode(item);
        }
    }

    if (nodes.length === 1) {
        node = nodes[0];
    }
    else {
        node = document.createDocumentFragment();

        for (let i = 0; i < nodes.length; i++) {
            node.appendChild(nodes[i]);
        }
    }

    return node;
}

export function isValidCustomElementName(localName) {
    // https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name
    switch (localName) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
            return false;
    }

    // For now, to reduce complexity, we are leaving the unicode sets out...
    const regex = /[a-z](-|\.|[0-9]|_|[a-z])+-(-|\.|[0-9]|_|[a-z])+/g;

    return regex.test(localName);
}

// https://dom.spec.whatwg.org/#finding-slots-and-slotables

export function findASlot(slotable, open) {
    // https://dom.spec.whatwg.org/#find-a-slot
    // To find a slot for a given slotable slotable and an optional 
    // open flag (unset unless stated otherwise), run these steps:

    // 1. If slotable’s parent is null, then return null.
    const parent = slotable.parentNode;
    if (!parent) {
        return null;
    }

    // 2. Let shadow be slotable’s parent’s shadow root.
    const shadow = parent.shadowRoot;

    // 3. If shadow is null, then return null.
    if (!shadow) {
        return null;
    }

    // 4. If the open flag is set and shadow’s mode is not "open", then return null.
    if (open && shadow.mode !== 'open') {
        return null;
    }

    // 5. Return the first slot in shadow’s tree whose name is slotable’s name, if any, and null otherwise.
    if (!shadow.firstChild) {
        return null;
    }

    const name = slotable instanceof Element ? slotable.getAttribute('slot') : null;
    const stack = [{ node: shadow.firstChild, recursed: false }];

    while (stack.length) {
        const frame = stack.pop();
        const node = frame.node;

        if (frame.recursed) {
            if (node.nextSibling) {
                stack.push({ node: node.nextSibling, recursed: false });
            }
        }
        else {
            if (node.localName === 'slot' && node.getAttribute('name') === name) {
                return node;
            }

            stack.push({ node: frame.node, recursed: true });

            if (node.firstChild) {
                stack.push({ node: node.firstChild, recursed: false });
            }
        }
    }

    return null;
}

export function findSlotables(slot) {
    // https://dom.spec.whatwg.org/#find-slotables
    // To find slotables for a given slot slot, run these steps:

    // 1. Let result be an empty list.
    const result = [];

    // 2. If slot’s root is not a shadow root, then return result.
    const root = slot.getRootNode({ composed: false });
    if (root.nodeName != '#shadow-root') {
        return result;
    }

    // 3. Let host be slot’s root’s host.
    const host = root.host;

    // 4. For each slotable child of host, slotable, in tree order, run these substeps:
    const slotableChildren = slice(host.childNodes);
    for (let i = 0; i < slotableChildren.length; i++) {
        const slotable = slotableChildren[i];
        if (slotable.nodeType === Node.ELEMENT_NODE 
            || slotable.nodeType === Node.TEXT_NODE) {
            // 1. Let foundSlot be the result of finding a slot given slotable.
            const foundSlot = findASlot(slotable);
            // 2. If foundSlot is slot, then append slotable to result.
            if (foundSlot === slot) {
                result.push(slotable);
            }
        }
    }

    // 5. Return result.
    return result;
}

export function findFlattenedSlotables(slot) {
    // https://dom.spec.whatwg.org/#find-flattened-slotables
    // To find flattened slotables for a given slot slot, run these steps:

    // 1. Let result be an empty list.
    const result = [];

    // 2. Let slotables be the result of finding slotables given slot.
    const slotables = findSlotables(slot);

    // 3. If slotables is the empty list, then append each slotable child of slot, in tree order, to slotables.
    if (slotables.length === 0) {
        const slotableChildren = slice(slot.childNodes);
        for (let i = 0; i < slotableChildren.length; i++) {
            const slotableChild = slotableChildren[i];
            if (slotableChild.nodeType === Node.ELEMENT_NODE 
                || slotableChild.nodeType === Node.TEXT_NODE) {
                slotables.push(slotableChild);
            }
        }
    }

    // 4. For each node in slotables, run these substeps:
    for (let i = 0; i < slotables.length; i++) {
        const node = slotables[i];
        // 1. If node is a slot, run these subsubsteps:
        if (node.localName === 'slot') {
            const temporaryResult = findFlattenedSlotables(node);
            result.splice(result.length, 0, ...temporaryResult);
        }
        else {
            result.push(node);
        }
    }

    // 5. Return result.
    return result;
}

// https://dom.spec.whatwg.org/#assigning-slotables-and-slots

export function assignSlotables(slot, suppressSignaling) {
    // https://dom.spec.whatwg.org/#assign-slotables
    // To assign slotables, for a slot slot with an optional suppress 
    // signaling flag (unset unless stated otherwise), run these steps:

    // 1. Let slotables be the result of finding slotables for slot.
    const slotables = findSlotables(slot);

    // 2. If suppress signaling flag is unset, and slotables and slot’s assigned 
    // nodes are not identical, then run signal a slot change for slot.
    if (!suppressSignaling) {
        const assignedNodes = slot.assignedNodes();
        if (slotables.length !== assignedNodes.length) {
            signalASlotChange(slot);
        }
        else {
            for (let i = 0; i < slotables.length; i++) {
                if (slotables[i] !== assignedNodes[i]) {
                    signalASlotChange(slot);
                    break;
                }
            }
        }
    }

    // 3. Set slot’s assigned nodes to slotables.
    shadow(slot, { assignedNodes: slotables });

    // 4. For each slotable in slotables, set slotable’s assigned slot to slot.

    // 4a. If we haven't tracked them yet, track the slot's logical children
    if (!shadow(slot).childNodes) {
        shadow(slot, {
            childNodes: slice(native.childNodes.get.call(slot))
        });
    }

    // 4b. We need to clean out the slot
    let firstChild;
    while (firstChild = native.firstChild.get.call(slot)) {
        native.removeChild.call(slot, firstChild);
    }

    // 4c. do what the spec said
    for (let i = 0; i < slotables.length; i++) {
        const slotable = slotables[i];
        shadow(slotable, { assignedSlot: slot });
        native.appendChild.call(slot, slotable);
    }

    // 4d. if there were no slotables we need to insert its fallback content
    if (!slotables.length) {
        const childNodes = shadow(slot).childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            native.appendChild.call(slot, childNodes[i]);
        }
    }
}

export function assignSlotablesForATree(tree, noSignalSlots) {
    // https://dom.spec.whatwg.org/#assign-slotables-for-a-tree
    // To assign slotables for a tree, given a tree tree and an optional set of slots noSignalSlots
    // (empty unless stated otherwise), run these steps for each slot slot in tree, in tree order:
    const slots = [];

    if (tree.localName === 'slot') {
        slots.push(tree);
    }

    if (tree.hasChildNodes()) {
        slots.push(...tree.querySelectorAll('slot'));
    }

    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];

        // 1. Let suppress signaling flag be set, if slot is in noSignalSlots, and unset otherwise.
        const suppressSignaling = noSignalSlots.indexOf(slot) !== -1;

        // 2. Run assign slotables for slot with suppress signaling flag.
        assignSlotables(slot, suppressSignaling);
    }
}

export function assignASlot(slotable) {
    const slot = findASlot(slotable);

    if (slot !== null) {
        assignSlotables(slot);
    }
}

// https://dom.spec.whatwg.org/#signaling-slot-change

export function signalASlotChange(slot) {
    // https://dom.spec.whatwg.org/#signal-a-slot-change
    // To signal a slot change, for a slot slot, run these steps:

    // Skip (MutationObserver)
    // 1. If slot is not in unit of related similar-origin browsing contexts' 
    // signal slot list, append slot to unit of related similar-origin browsing 
    // contexts' signal slot list.
    // 2. Queue a mutation observer compound microtask.
}

// https://dom.spec.whatwg.org/#mutation-algorithms

export function ensurePreInsertionValidity(node, parent, child) {
    // https://dom.spec.whatwg.org/#concept-node-ensure-pre-insertion-validity
    // To ensure pre-insertion validity of a node into a parent before a child, run these steps:

    // Skip (native)
    // 1. If parent is not a Document, DocumentFragment, or Element node, throw a HierarchyRequestError.

    // 2. If node is a host-including inclusive ancestor of parent, throw a HierarchyRequestError.
    let ancestor = parent;
    do {
        if (ancestor === node) {
            throw makeError('HierarchyRequestError');
        }
    }
    while (ancestor = (ancestor.parentNode || ancestor.host));

    // 3. If child is not null and its parent is not parent, then throw a NotFoundError.
    if (child !== null && child.parentNode !== parent) {
        throw makeError('NotFoundError');
    }

    // Skip (native)
    // 4. If node is not a DocumentFragment, DocumentType, Element, Text, ProcessingInstruction, 
    // or Comment node, throw a HierarchyRequestError.
    // 5. If either node is a Text node and parent is a document, or node is a doctype 
    // and parent is not a document, throw a HierarchyRequestError.
    // 6. If parent is a document, and any of the statements below, switched on node, 
    // are true, throw a HierarchyRequestError.
}

export function preInsert(node, parent, child) {
    // https://dom.spec.whatwg.org/#concept-node-pre-insert
    // To pre-insert a node into a parent before a child, run these steps:

    // 1. Ensure pre-insertion validity of node into parent before child.
    ensurePreInsertionValidity(node, parent, child);

    // 2. Let reference child be child.
    let referenceChild = child;

    // 3. If reference child is node, set it to node’s next sibling.
    referenceChild === node && (referenceChild = node.nextSibling);

    // 4. Adopt node into parent’s node document.
    // https://dom.spec.whatwg.org/#concept-node-adopt
    adopt(node, parent.ownerDocument);

    // 5. Insert node into parent before reference child.
    // https://dom.spec.whatwg.org/#concept-node-insert
    insert(node, parent, referenceChild);

    // 6. Return node.
    return node;
}

export function insert(node, parent, child, suppressObservers) {
    // https://dom.spec.whatwg.org/#concept-node-insert
    // To insert a node into a parent before a child, with an optional suppress observers flag, run these steps:

    // Skip (Range)
    // 1. Let count be the number of children of node if it is a DocumentFragment node, and one otherwise.
    // 2. If child is non-null, run these substeps:

    // 3. Let nodes be node’s children if node is a DocumentFragment node, 
    // and a list containing solely node otherwise.
    let nodes = (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) 
        ? slice(node.childNodes) : [node];

    // 4. If node is a DocumentFragment node, remove its children with the suppress observers flag set.
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        for (let i = 0; i < nodes.length; i++) {
            remove(nodes[i], node, true);
        }
    }

    // Skip (MutationObserver)
    // 5. If node is a DocumentFragment node, queue a mutation record of "childList" for node with removedNodes nodes.

    // 6. For each node in nodes, in tree order, run these substeps:
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // 1. Insert node into parent before child or at the end of parent if child is null.
        const childNodes = shadow(parent).childNodes;
        if (childNodes) {
            if (child) {
                const childIndex = childNodes.indexOf(child);
                childNodes.splice(childIndex, 0, node);
            }
            else {
                childNodes.push(node);
            }
            shadow(node, { parentNode: parent });
            // If it's a shadow root, perform physical insert on the host.
            const shadowHost = shadow(parent).host;
            if (shadowHost) {
                native.insertBefore.call(shadowHost, node, child);
            }
        }
        else {
            native.insertBefore.call(parent, node, child);
        }

        // 2. If parent is a shadow host and node is a slotable, then assign a slot for node.
        if (shadow(parent).shadowRoot && 'assignedSlot' in node) {
            assignASlot(node);
        }

        // 3. If parent is a slot whose assigned nodes is the empty list, then run signal a slot change for parent.
        if (parent.localName === 'slot' && parent.assignedNodes().length === 0) {
            // 3a. Physically append the child into the slot.
            native.appendChild.call(parent, node);
            // 3b. Do what the spec said
            signalASlotChange(parent);
        }

        // 4. Run assign slotables for a tree with node’s tree and a set containing each inclusive descendant of node that is a slot.
        const inclusiveSlotDescendants = [];
        if (node.localName === 'slot') {
            inclusiveSlotDescendants.push(node);
        }
        if (node.hasChildNodes()) {
            inclusiveSlotDescendants.push(...node.querySelectorAll('slot'));
        }
        assignSlotablesForATree(node, inclusiveSlotDescendants);

        // Skip (CustomElements)
        // 5. For each shadow-including inclusive descendant inclusiveDescendant of node, 
        // in shadow-including tree order, run these subsubsteps:
    }

    // Skip (MutationObserver)
    // 7. If suppress observers flag is unset, queue a mutation record of "childList" for parent 
    // with addedNodes nodes, nextSibling child, and previousSibling child’s previous sibling or 
    // parent’s last child if child is null.
}

export function append(node, parent) {
    // https://dom.spec.whatwg.org/#concept-node-append
    // To append a node to a parent, pre-insert node into parent before null.
    preInsert(node, parent, null);
}

export function replace(child, node, parent) {
    // https://dom.spec.whatwg.org/#concept-node-replace
    // To replace a child with node within a parent, run these steps:

    // Skip (native)
    // 1. If parent is not a Document, DocumentFragment, or Element node, throw a HierarchyRequestError.

    // 2. If node is a host-including inclusive ancestor of parent, throw a HierarchyRequestError.
    let ancestor = parent;
    do {
        if (ancestor === node) {
            throw makeError('HierarchyRequestError');
        }
    }
    while (ancestor = (ancestor.parentNode || ancestor.host));

    // 3. If child’s parent is not parent, then throw a NotFoundError.
    if (child !== null && child.parentNode !== parent) {
        throw makeError('NotFoundError');
    }

    // Skip (native)
    // 4. If node is not a DocumentFragment, DocumentType, Element, Text, ProcessingInstruction, or Comment node, throw a HierarchyRequestError.
    // 5. If either node is a Text node and parent is a document, or node is a doctype and parent is not a document, throw a HierarchyRequestError.
    // 6. If parent is a document, and any of the statements below, switched on node, are true, throw a HierarchyRequestError.

    // 7. Let reference child be child’s next sibling.
    let referenceChild = child.nextSibling;

    // 8. If reference child is node, set it to node’s next sibling.
    if (referenceChild === node) {
        referenceChild = node.nextSibling;
    }

    // Skip (MutationObserver)
    // 9. Let previousSibling be child’s previous sibling.
    // const previousSibling = child.previousSibling;

    // 10. Adopt node into parent’s node document.
    adopt(node, parent.ownerDocument);

    // Skip (MutationObserver)
    // 11. Let removedNodes be the empty list.
    // const removedNodes = [];

    // 12. If child’s parent is not null, run these substeps:
    const childParent = child.parentNode;
    if (childParent !== null) {
        // Skip (MutationObserver)
        // 1. Set removedNodes to a list solely containing child.
        // removedNodes.push(child);
        // 2. Remove child from its parent with the suppress observers flag set.
        remove(child, parent, true);
    }

    // Skip (MutationObserver)
    // 13. Let nodes be node’s children if node is a DocumentFragment node, and a list containing solely node otherwise.

    // 14. Insert node into parent before reference child with the suppress observers flag set.
    insert(node, parent, referenceChild, true);

    // Skip (MutationObserver)
    // 15. Queue a mutation record of "childList" for target parent with addedNodes nodes, 
    // removedNodes removedNodes, nextSibling reference child, and previousSibling previousSibling.
}

export function replaceAll(node, parent) {
    // https://dom.spec.whatwg.org/#concept-node-replace-all
    // To replace all with a node within a parent, run these steps:

    // 1. If node is not null, adopt node into parent’s node document.
    if (node !== null) {
        adopt(node, parent.ownerDocument);
    }

    // 2. Let removedNodes be parent’s children.
    const removedNodes = slice(parent.childNodes);

    // 3. Let addedNodes be the empty list if node is null, node’s children if node is a DocumentFragment node, and a list containing node otherwise.
    const addedNodes = (node === null) ? [] 
        : (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) ? slice(node.childNodes)
        : [node];

    // 4. Remove all parent’s children, in tree order, with the suppress observers flag set.
    for (let i = 0; i < removedNodes.length; i++) {
        remove(removedNodes[i], parent, true);
    }

    // 5. If node is not null, insert node into parent before null with the suppress observers flag set.
    if (node !== null) {
        insert(node, parent, null, true);
    }

    // Skip (MutationObserver)
    // 6. Queue a mutation record of "childList" for parent with addedNodes addedNodes and removedNodes removedNodes.
}

export function preRemove(child, parent) {
    // https://dom.spec.whatwg.org/#concept-node-pre-remove
    // To pre-remove a child from a parent, run these steps:

    // 1. If child’s parent is not parent, then throw a NotFoundError.
    if (child.parentNode !== parent) {
        throw makeError('NotFoundError');
    }

    // 2. Remove child from parent.
    remove(child, parent);

    // 3. Return child.
    return child;
}

export function remove(node, parent, suppessObservers) {
    // https://dom.spec.whatwg.org/#concept-node-remove
    // To remove a node from a parent, with an optional suppress observers flag, run these steps:

    // Skip (Range)
    // 1. Let index be node’s index.
    // 2. For each range whose start node is an inclusive descendant of node, set its start to (parent, index).
    // 3. For each range whose end node is an inclusive descendant of node, set its end to (parent, index).
    // 4. For each range whose start node is parent and start offset is greater than index, decrease its start offset by one.
    // 5. For each range whose end node is parent and end offset is greater than index, decrease its end offset by one.

    // Skip (NodeIterator)
    // 6. For each NodeIterator object iterator whose root’s node document is node’s node document, 
    // run the NodeIterator pre-removing steps given node and iterator.

    // Skip (MutationObserver)
    // 7. Let oldPreviousSibling be node’s previous sibling.
    // 8. Let oldNextSibling be node’s next sibling.

    // 9. Remove node from its parent.
    const childNodes = shadow(parent).childNodes;
    if (childNodes) {
        const nodeIndex = childNodes.indexOf(node);
        childNodes.splice(nodeIndex, 1);
    }
    delete shadow(node).parentNode;
    native.removeChild.call(native.parentNode.get.call(node), node);

    // 10. If node is assigned, then run assign slotables for node’s assigned slot.
    const assignedSlot = shadow(node).assignedSlot;
    if (assignedSlot) {
        assignSlotables(assignedSlot);
        shadow(node).assignedSlot = null;
    }

    // 11. If parent is a slot whose assigned nodes is the empty list, then run signal a slot change for parent.
    if (parent.localName === 'slot' && parent.assignedNodes().length === 0) {
        signalASlotChange(parent);
    }

    // 12. If node has an inclusive descendant that is a slot, then:
    let inclusiveSlotDescendants = [];
    if (node.localName === 'slot') {
        inclusiveSlotDescendants.push(node);
    }
    if (node.hasChildNodes()) {
        inclusiveSlotDescendants.push(...node.querySelectorAll('slot'));
    }
    if (inclusiveSlotDescendants.length) {
        // 1. Run assign slotables for a tree with parent’s tree.
        assignSlotablesForATree(parent);
        // 2. Run assign slotables for a tree with node’s tree and a 
        // set containing each inclusive descendant of node that is a slot.
        assignSlotablesForATree(node, inclusiveSlotDescendants);
    }

    // Skip (other)
    // 13. Run the removing steps with node and parent.

    // Skip (CustomElements)
    // 14. If node is custom, then enqueue a custom element callback reaction 
    // with node, callback name "disconnectedCallback", and an empty argument list.
    // 15. For each shadow-including descendant descendant of node, in 
    // shadow-including tree order, run these substeps:

    // Skip (MutationObserver)
    // 16. For each inclusive ancestor inclusiveAncestor of parent, if inclusiveAncestor 
    // has any registered observers whose options' subtree is true, then for each such registered 
    // observer registered, append a transient registered observer whose observer and options are 
    // identical to those of registered and source which is registered to node’s list of registered observers.
    // 17. If suppress observers flag is unset, queue a mutation record of "childList" for parent 
    // with removedNodes a list solely containing node, nextSibling oldNextSibling, and previousSibling 
    // oldPreviousSibling.
}

export function clone(node, document, cloneChildren) {
    // https://dom.spec.whatwg.org/#concept-node-clone
    // To clone a node, with an optional document and clone children flag, run these steps:

    // 1. If document is not given, let document be node’s node document.
    document = document || node.ownerDocument;

    // Use a shortcut here
    // 2. If node is an element, then:
    // 3. Otherwise, let copy be a node that implements the same interfaces 
    // as node, and fulfills these additional requirements, switching on node:
    // 4. Set copy’s node document and document to copy, if copy is a document, 
    // and set copy’s node document to document otherwise.
    // 5. Run any cloning steps defined for node in other applicable 
    // specifications and pass copy, node, document and the clone children 
    // flag if set, as parameters.
    const copy = native.cloneNode.call(node, false);

    // 6. If the clone children flag is set, clone all the children of node 
    // and append them to copy, with document as specified and the clone 
    // children flag being set.
    if (cloneChildren === true) {
        const childNodes = slice(node.childNodes);
        for (let i = 0; i < childNodes.length; i++) {
            append(childNodes[i].cloneNode(true), copy);
        }
    }

    return copy;
}

export function adopt(node, document) {
    // https://dom.spec.whatwg.org/#concept-node-adopt

    // 1. Let oldDocument be node’s node document.
    let oldDocument = node.ownerDocument;

    // 2. If node’s parent is not null, remove node from its parent.
    const parent = node.parentNode;
    if (parent !== null) {
        remove(node, parent);
    }

    // Skip (CustomElements, native)
    // 3. If document is not the same as oldDocument, run these substeps:
}