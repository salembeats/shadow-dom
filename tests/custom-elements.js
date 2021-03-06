'use strict';

suite('Custom Elements', function () {

    var assert = chai.assert;

    function makeSuite(name, tagName, elementClass) {

        suite(name, function () {

            test('can be defined on window.customElements', function () {
                // Ensure that, upon definition, enqueuing the upgrade callback works
                var element = document.createElement(tagName);
                document.body.append(element);
                var caught = null;
                try {
                    window.customElements.define(tagName, elementClass);
                    var defined = window.customElements.get(tagName);
                    assert.equal(defined, elementClass);
                }
                catch (error) {
                    caught = error;
                }
                element.remove();
                assert.isNull(caught);
            });

            test('can be constructed with document.createElement', function () {
                var element = document.createElement(tagName);
                assert.isTrue('connectedCallback' in element);
                assert.isTrue('disconnectedCallback' in element);
                assert.isTrue('adoptedCallback' in element);
                assert.isTrue('attributeChangedCallback' in element);
            });

            test('can be constructed directly with new()', function () {
                var element = new elementClass();
                assert.isTrue('connectedCallback' in element);
                assert.isTrue('disconnectedCallback' in element);
                assert.isTrue('adoptedCallback' in element);
                assert.isTrue('attributeChangedCallback' in element);
            });

            test('connectedCallback is invoked', function () {
                var element = document.createElement(tagName);
                document.body.appendChild(element);
                document.body.removeChild(element);
                assert.equal(element.connectedCallbackCount, 1);
                assert.equal(element.connectedCallbackArgs.length, 0);
            });

            test('disconnectedCallback is invoked', function () {
                var element = document.createElement(tagName);
                document.body.appendChild(element);
                document.body.removeChild(element);
                assert.equal(element.disconnectedCallbackCount, 1);
                assert.equal(element.disconnectedCallbackArgs.length, 0);
            });

            test('adoptedCallback is invoked', function () {
                var element = document.createElement(tagName);
                var newDocument = document.implementation.createHTMLDocument('test');
                newDocument.adoptNode(element);
                assert.equal(element.adoptedCallbackCount, 1);
                assert.equal(element.adoptedCallbackArgs.length, 2);
            });

            test('attributeChangedCallback is invoked', function () {
                var element = document.createElement(tagName);
                element.setAttribute('attr1', 'some value');
                assert.equal(element.attributeChangedCallbackCount, 1);
                assert.equal(element.attributeChangedCallbackArgs.length, 4);
                element.setAttribute('attr3', 'some value');
                assert.equal(element.attributeChangedCallbackCount, 1);
            });

        });

    }

    // Hand-written ES5-style class    

    function myElement () {
        var self = HTMLElement.call(this);
        self.connectedCallbackCount = 0;
        self.disconnectedCallbackCount = 0;
        self.adoptedCallbackCount = 0;
        self.attributeChangedCallbackCount = 0;
        return self;
    };

    myElement.prototype = Object.create(HTMLElement.prototype, {
        'constructor': {
            value: myElement,
            writable: true,
            configurable: true
        }
    });

    myElement.observedAttributes = ['attr1', 'attr2'];

    myElement.prototype.connectedCallback = function () {
        this.connectedCallbackArgs = arguments;
        this.connectedCallbackCount++;
    };

    myElement.prototype.disconnectedCallback = function () {
        this.disconnectedCallbackArgs = arguments;
        this.disconnectedCallbackCount++;
    };

    myElement.prototype.adoptedCallback = function () {
        this.adoptedCallbackArgs = arguments;
        this.adoptedCallbackCount++;
    };

    myElement.prototype.attributeChangedCallback = function () {
        this.attributeChangedCallbackArgs = arguments;
        this.attributeChangedCallbackCount++;
    };

    makeSuite('Hand-rolled ES5-style class', 'my-element-1', myElement);

    // Babel-generated class (see comment at end of file for source)

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
    
    var TranspiledCustomElementClass = function (_HTMLElement) {
        _inherits(TranspiledCustomElementClass, _HTMLElement);

        _createClass(TranspiledCustomElementClass, null, [{
            key: 'observedAttributes',
            get: function get() {
                return ['attr1', 'attr2'];
            }
        }]);

        function TranspiledCustomElementClass() {
            _classCallCheck(this, TranspiledCustomElementClass);

            var _this = _possibleConstructorReturn(this, (TranspiledCustomElementClass.__proto__ || Object.getPrototypeOf(TranspiledCustomElementClass)).call(this));

            _this.connectedCallbackCount = 0;
            _this.disconnectedCallbackCount = 0;
            _this.adoptedCallbackCount = 0;
            _this.attributeChangedCallbackCount = 0;
            return _this;
        }

        _createClass(TranspiledCustomElementClass, [{
            key: 'connectedCallback',
            value: function connectedCallback() {
                this.connectedCallbackArgs = arguments;
                this.connectedCallbackCount++;
            }
        }, {
            key: 'disconnectedCallback',
            value: function disconnectedCallback() {
                this.disconnectedCallbackArgs = arguments;
                this.disconnectedCallbackCount++;
            }
        }, {
            key: 'adoptedCallback',
            value: function adoptedCallback() {
                this.adoptedCallbackArgs = arguments;
                this.adoptedCallbackCount++;
            }
        }, {
            key: 'attributeChangedCallback',
            value: function attributeChangedCallback() {
                this.attributeChangedCallbackArgs = arguments;
                this.attributeChangedCallbackCount++;
            }
        }]);

        return TranspiledCustomElementClass;
    }(HTMLElement);

    makeSuite('Babel-transpiled ES2015 class', 'my-element-2', TranspiledCustomElementClass);

    // Native class (if available) 

    try {
        var nativeClass = new Function('return class TranspiledCustomElementClass extends HTMLElement{static get observedAttributes(){return["attr1","attr2"]}constructor(){super();this.connectedCallbackCount=0;this.disconnectedCallbackCount=0;this.adoptedCallbackCount=0;this.attributeChangedCallbackCount=0}connectedCallback(){this.connectedCallbackArgs=arguments;this.connectedCallbackCount++}disconnectedCallback(){this.disconnectedCallbackArgs=arguments;this.disconnectedCallbackCount++}adoptedCallback(){this.adoptedCallbackArgs=arguments;this.adoptedCallbackCount++}attributeChangedCallback(){this.attributeChangedCallbackArgs=arguments;this.attributeChangedCallbackCount++}}')();

        makeSuite('Native ES2015 class', 'my-element-3', nativeClass);
    }
    catch (error) {
        // no-op
    }
    
    test('define properly implements [CEReactions]', function (done) {
        assert.notEqual(document.readyState, 'loading');
        var whenDefinedElement = function () {
            var self = HTMLElement.call(this);
            return self;
        };
        whenDefinedElement.prototype = Object.create(HTMLElement.prototype, {
            'constructor': {
                value: whenDefinedElement,
                writable: true,
                configurable: true
            },
            'connectedCallback': {
                value: function () {
                    this.connectedCallbackWasCalled = true;
                }
            }
        });
        var element = document.createElement('when-defined');
        document.body.append(element);
        window.customElements.define('when-defined', whenDefinedElement);
        window.customElements.whenDefined('when-defined').then(function () {
            assert.isTrue(element.connectedCallbackWasCalled);
            element.remove();
            done();
        });
    });
    
    test('Custom element reactions during cloneNode(true)', function (done) {
        var cloneNodeElement = function () {
            var self = HTMLElement.call(this);
            self.attachShadow({ mode: 'open' }).innerHTML = '<span>shadow dom</span>';
            return self;
        };
        cloneNodeElement.prototype = Object.create(HTMLElement.prototype, {
            'constructor': {
                value: cloneNodeElement,
                writable: true,
                configurable: true
            }
        });

        var element = document.createElement('clone-node');
        element.innerHTML = '<div>light dom</div>';

        assert.equal(element.firstChild.localName, 'div');

        window.customElements.define('clone-node', cloneNodeElement);

        window.customElements.whenDefined('clone-node')
            .then(function () {
                return element.cloneNode(true);
            })
            .then(function (clone) {
                // If cloneNode was implemented incorrectly,
                // the firstChild would be a <span>.
                assert.equal(clone.firstChild.localName, 'div');
                done();
            });
    });

    suite('attributeChangedCallback', function () {

        var attributeChangedCallbackElement = function () {
            var self = HTMLElement.call(this);
            self.invokedCount = 0;
            return self;
        };
        attributeChangedCallbackElement.observedAttributes = ['test'];
        attributeChangedCallbackElement.prototype = Object.create(HTMLElement.prototype, {
           'constructor': {
               value: attributeChangedCallbackElement,
               writable: true,
               configurable: true
           },
           'attributeChangedCallback': {
               value: function () {
                   this.invokedCount++;
               }
           }
        });
        window.customElements.define('attrchange-element', attributeChangedCallbackElement);

        suite('invoked upon setting Attr.prototype.value', function () {

            test('when attribute existed at upgrade time', function () {
                var div = document.createElement('div');
                document.body.append(div);
                div.innerHTML = '<attrchange-element test="what"></attrchange-element>';
                div.remove();
                assert.equal(div.firstChild.invokedCount, 1);
                div.firstChild.attributes.test.value = 'ok';
                assert.equal(div.firstChild.invokedCount, 2);
            });

            test('when attribute was added via Element.prototype.setAttribute', function () {
                var elem = document.createElement('attrchange-element');
                elem.setAttribute('test', 'what');
                var attr = elem.getAttributeNode('test');
                attr.value = 'ok';
                assert.equal(elem.invokedCount, 2);
            });

            test('when attribute was added via Element.prototype.setAttributeNS', function () {
                var elem = document.createElement('attrchange-element');
                elem.setAttributeNS('http://shadow-dom-test', 'shadow:test', 'what');
                var attr = elem.getAttributeNodeNS('http://shadow-dom-test', 'test');
                attr.value = 'ok';
                assert.equal(elem.invokedCount, 2);
            });

            test('when attribute was added via Element.prototype.setAttributeNode', function () {
                var elem = document.createElement('attrchange-element');
                var attr = document.createAttribute('test');
                elem.setAttributeNode(attr);
                attr.value = 'ok';
                assert.equal(elem.invokedCount, 2);
            });

            test('when attribute was added via Element.prototype.setAttributeNodeNS', function () {
                var elem = document.createElement('attrchange-element');
                var attr = document.createAttributeNS('http://shadow-dom-test', 'shadow:test');
                elem.setAttributeNodeNS(attr);
                attr.value = 'ok';
                assert.equal(elem.invokedCount, 2);
            });

            test('when attribute was added via NamedNodeMap.prototype.setNamedItem', function () {
                var elem = document.createElement('attrchange-element');
                var attr = document.createAttribute('test');
                elem.attributes.setNamedItem(attr);
                attr.value = 'ok';
                assert.equal(elem.invokedCount, 2);
            });

            test('when attribute was added via NamedNodeMap.prototype.setNamedItemNS', function () {
                var elem = document.createElement('attrchange-element');
                var attr = document.createAttributeNS('http://shadow-dom-test', 'shadow:test');
                elem.attributes.setNamedItemNS(attr);
                attr.value = 'ok';
                assert.equal(elem.invokedCount, 2);
            });

        });

        test('invoked upon calling Element.prototype.setAttribute', function () {
            var elem = document.createElement('attrchange-element');
            elem.setAttribute('test', '');
            assert.equal(elem.invokedCount, 1);
        });

        test('invoked upon calling Element.prototype.setAttributeNS', function () {
            var elem = document.createElement('attrchange-element');
            elem.setAttributeNS('http://shadow-dom-test', 'shadow:test', '');
            assert.equal(elem.invokedCount, 1);
        });

        test('invoked upon calling Element.prototype.setAttributeNode', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttribute('test');
            elem.setAttributeNode(attr);
            assert.equal(elem.invokedCount, 1);
        });

        test('invoked upon calling Element.prototype.setAttributeNodeNS', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttributeNS('http://shadow-dom-test', 'shadow:test');
            elem.setAttributeNodeNS(attr);
            assert.equal(elem.invokedCount, 1);
        });

        test('invoked upon calling Element.prototype.removeAttribute', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttribute('test');
            elem.setAttributeNode(attr);
            elem.removeAttribute('test');
            // One invocation for the addition, another for the removal
            assert.equal(elem.invokedCount, 2);
            // Ensure that the attribute value can still be set without issue
            // due to the patching done in WebKit
            assert.doesNotThrow(function () { attr.value = 'ok'; });
            assert.equal(attr.value, 'ok');
        });

        test('invoked upon calling Element.prototype.removeAttributeNS', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttributeNS('http://shadow-dom-test', 'shadow:test');
            elem.setAttributeNode(attr);
            elem.removeAttributeNS('http://shadow-dom-test', 'test');
            // One invocation for the addition, another for the removal
            assert.equal(elem.invokedCount, 2);
            // Ensure that the attribute value can still be set without issue
            // due to the patching done in WebKit
            assert.doesNotThrow(function () { attr.value = 'ok'; });
            assert.equal(attr.value, 'ok');
        });

        test('invoked upon calling Element.prototype.removeAttributeNode', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttribute('test');
            elem.setAttributeNode(attr);
            elem.removeAttributeNode(attr);
            // One invocation for the addition, another for the removal
            assert.equal(elem.invokedCount, 2);
            // Ensure that the attribute value can still be set without issue
            // due to the patching done in WebKit
            assert.doesNotThrow(function () { attr.value = 'ok'; });
            assert.equal(attr.value, 'ok');
        });

        test('invoked upon calling NamedNodeMap.prototype.setNamedItem', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttribute('test');
            elem.attributes.setNamedItem(attr);
            assert.equal(elem.invokedCount, 1);
        });

        test('invoked upon calling NamedNodeMap.prototype.setNamedItemNS', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttributeNS('http://shadow-dom-test', 'shadow:test');
            elem.attributes.setNamedItemNS(attr);
            assert.equal(elem.invokedCount, 1);
        });

        test('invoked upon calling NamedNodeMap.prototype.removeNamedItem', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttribute('test');
            elem.setAttributeNode(attr);
            elem.attributes.removeNamedItem('test');
            // One invocation for the addition, another for the removal
            assert.equal(elem.invokedCount, 2);
            // Ensure that the attribute value can still be set without issue
            // due to the patching done in WebKit
            assert.doesNotThrow(function () { attr.value = 'ok'; });
            assert.equal(attr.value, 'ok');
        });

        test('invoked upon calling NamedNodeMap.prototype.removeNamedItemNS', function () {
            var elem = document.createElement('attrchange-element');
            var attr = document.createAttributeNS('http://shadow-dom-test', 'shadow:test');
            elem.setAttributeNodeNS(attr);
            elem.attributes.removeNamedItemNS('http://shadow-dom-test', 'test');
            // One invocation for the addition, another for the removal
            assert.equal(elem.invokedCount, 2);
            // Ensure that the attribute value can still be set without issue
            // due to the patching done in WebKit
            assert.doesNotThrow(function () { attr.value = 'ok'; });
            assert.equal(attr.value, 'ok');
        });

    });

});

/*

class TranspiledCustomElementClass extends HTMLElement {

    static get observedAttributes() {
        return ['attr1', 'attr2'];
    }

    constructor() {
        super();
        this.connectedCallbackCount = 0;
        this.disconnectedCallbackCount = 0;
        this.adoptedCallbackCount = 0;
        this.attributeChangedCallbackCount = 0;
    }

    connectedCallback() {
        this.connectedCallbackArgs = arguments;
        this.connectedCallbackCount++;
    }

    disconnectedCallback() {
        this.disconnectedCallbackArgs = arguments;
        this.disconnectedCallbackCount++;
    }

    adoptedCallback() {
        this.adoptedCallbackArgs = arguments;
        this.adoptedCallbackCount++;
    }

    attributeChangedCallback() {
        this.attributeChangedCallbackArgs = arguments;
        this.attributeChangedCallbackCount++;
    }

}

*/