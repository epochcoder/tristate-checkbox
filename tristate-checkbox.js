if (typeof(Prototype) == "undefined")
    throw "TriStateCheckbox requires Prototype to be loaded.";
if (typeof(Scriptaculous) == "undefined")
    throw "TriStateCheckbox requires Scriptaculous to be loaded.";

/**
 * Represents a 3-state checkbox, can handle dependancies
 * or function as a standalone box.
 *
 * @author Willie Scholtz
 * @since 2010/08/25
 */
var TriStateCheckbox = Class.create({
    initialize: function(element, options) {
        this.element = $(element);
        this.options = Object.extend({
            determineSelectorContext: function(el) {return el;},
            defaultState: TriStateCheckbox.STATE_NONE,
            dependantSelector: '',
            selectorContext: null,
            displayText: ''
        }, options || {});

        if (!this.element) {
            throw 'Cannot initialize TriStateCheckbox '
                    + 'without a valid checkbox element!';
        }

        this.element.addClassName(TriStateCheckbox.CLASS_TRISTATE_DUMMY);
        this.element.checked = false;
        this.element.disable();
        this.element.hide();

        this._initState();
        this._init();
    },

    getState: function() {
        return this.state;
    },

    _hasDependancySelector: function() {
        return this.options.dependantSelector
                && !this.options.dependantSelector.blank();
    },

    _select: function() {
        if (!this.selector) {
            this.selector = document;
            if (this.options.selectorContext) {
                var element = $(this.options.selectorContext);
                if (Object.isElement(element)) {
                    element = this.options.determineSelectorContext(element);
                    if (!Object.isElement(element)) {
                        element = $(this.options.selectorContext);
                    }

                    this.selector = element;
                } else {
                    this.options.dependantSelector = '';
                    this.options.selectorContext = '';

                    var str = 'error while determining selectorContext, '
                            + 'disabling dependantSelector';
                    alert(str);
                }
            }
        }

        var results = [];
        if (this._hasDependancySelector()) {
            if (this.selector === document) {
                results = $$(this.options.dependantSelector);
            } else {
                results = this.selector.select(this.options.dependantSelector);
            }
        }

        return results;
    },

    _determineStateOfElements: function() {
        var checked = this._select().findAll(function(el) {
            return !el.disabled && (el.type && el.type == 'checkbox');
        }).pluck('checked');

        /*
         * TODO _determineStateOfElements() only handles normal cb's this code needs
         * to be added to handle tristate aswell...
        var checked = $$(this.options.dependantSelector).inject([], function(arr, el) {
            if (el.type && el.type == 'checkbox') {
                if (!el.disabled) {
                    arr.push(el);
                } else if (this._isTristateElement(el)) {
                    var tristate = el.previous('div.tristate');
                    if (tristate) {
                        tristate = tristate.down('span.image');
                        var tri_check = new Object();
                        tri_check['checked'] = (tristate && tristate
                                .hasClassName(TriStateCheckbox.CLASS_CHECKED));
                        arr.push(tri_check);
                    }
                }
            }

            return arr;
        }.bind(this)).pluck('checked');
        */

        return TriStateCheckbox[(checked.all() && checked.size() > 0)
                ? 'STATE_ALL' : (checked.any() ? 'STATE_SOME' : 'STATE_NONE')];
    },

    _initState: function() {
        this.state = this._hasDependancySelector()
                ? this._determineStateOfElements()
                : this.options.defaultState;
    },

    _changeState: function(element, newState) {
        element = element || this.image;
        if (element) {
            element.removeClassName(this.current);

            if (newState != undefined) {
                this.state = newState;
            }

            this.current = this._convertState();
            element.addClassName(this.current);
        }
    },

    _convertState: function() {
        var highlight = this.over;
        var stateClass = highlight
                ? TriStateCheckbox.CLASS_UNCHECKED_H
                : TriStateCheckbox.CLASS_UNCHECKED;
        switch (this.state) {
            case TriStateCheckbox.STATE_NONE: {
                stateClass = highlight
                        ? TriStateCheckbox.CLASS_UNCHECKED_H
                        : TriStateCheckbox.CLASS_UNCHECKED;
                break;
            }
            case TriStateCheckbox.STATE_SOME: {
                stateClass = highlight
                        ? TriStateCheckbox.CLASS_INTERMEDIATE_H
                        : TriStateCheckbox.CLASS_INTERMEDIATE;
                break;
            }
            case TriStateCheckbox.STATE_ALL: {
                stateClass = highlight
                        ? TriStateCheckbox.CLASS_CHECKED_H
                        : TriStateCheckbox.CLASS_CHECKED;
                break;
            }
        }

        return stateClass;
    },

    _init: function() {
        this.current = this._convertState();
        this.container = new Element('div', {
            id: 'tristate_' + this.element.id,
            'class': 'tristate clearfix'
        }).update(
            '<span class="image ' + this.current + '"></span>' +
            '<span class="text">' + this.options.displayText + '</span>'
        ).hide();

        this.element.insert({
            'before': this.container
        });

        this.image = this.container.down('span.image');

        this._addEvents();
        this.container.show();
    },

    _addEvents: function() {
        this.container.observe(TriStateCheckbox.EVENT_STATE_CHANGE, function(evt) {
            var newState = evt.memo.state;
            if (newState !== this.state) {
                this._changeState(null, newState);
            }
        }.bind(this));

        this.container.observe('mouseover', function(evt) {
            var el = evt.element();
            if (el && el.hasClassName('image')) {
                this.over = true;
                this._changeState(el);
            }
        }.bind(this));

        this.container.observe('mouseout', function(evt) {
            var el = evt.element();
            if (el && el.hasClassName('image')) {
                this.over = false;
                this._changeState(el);
            }
        }.bind(this));

        this.container.observe('click', function(evt) {
            var el = evt.element();
            if (el && el.hasClassName('image')) {
                this._respondToClick(el);
            }
        }.bind(this));

        if (this._hasDependancySelector()) {
            this._select().findAll(function(cb) {
                return (cb.type && cb.type == 'checkbox');
            }).each(function(el) {
                if (this._isTristateElement(el)) {
                    var tristate = el.previous('div.tristate');
                    if (tristate && (tristate !== this.container)) {
                        tristate.observe('click', function(evt) {
                            var el = evt.element();
                            if (el && el.hasClassName('image')) {
                                var newState = this._determineStateOfElements();
                                this._changeState(null, newState);
                            }
                        }.bind(this));
                    }
                } else if (!el.disabled) {
                    el.observe('click', function() {
                        this._changeState(null, this._determineStateOfElements());
                    }.bind(this));
                }
            }.bind(this));
        }
    },

    _getNextState: function(value) {
        if (value == TriStateCheckbox.STATE_SOME) {
            return TriStateCheckbox.STATE_ALL
        } else if (value == TriStateCheckbox.STATE_ALL) {
            return TriStateCheckbox.STATE_NONE;
        } else {
            if (this._hasDependancySelector()) {
                return TriStateCheckbox.STATE_ALL;
            } else {
                return TriStateCheckbox.STATE_SOME;
            }
        }
    },

    _isTristateElement: function(element) {
        return element && element.hasClassName(TriStateCheckbox
                .CLASS_TRISTATE_DUMMY);
    },

    _handleClick: function() {
        var handleState = this._getNextState(this.state);
        if (this._hasDependancySelector()) {
            this._select().each(function(cb) {
                if (!cb.disabled && (cb.type && cb.type == 'checkbox')) {
                    cb.checked = (handleState == TriStateCheckbox.STATE_ALL);
                } else if (this._isTristateElement(cb)) {
                    var tristate = cb.previous('div.tristate');
                    if (tristate && (tristate !== this.container)) {
                        tristate.fire(TriStateCheckbox.EVENT_STATE_CHANGE, {
                            state: handleState
                        });
                    }
                }
            }.bind(this));
        }

        return handleState;
    },

    _respondToClick: function(el) {
        var newState = this._handleClick();
        this._changeState(el, newState);
    }
});
Object.extend(TriStateCheckbox, {
    STATE_NONE: 0,
    STATE_SOME: 1,
    STATE_ALL: 2,
    CLASS_UNCHECKED: 'unchecked',
    CLASS_INTERMEDIATE: 'intermediate',
    CLASS_CHECKED: 'checked',
    CLASS_UNCHECKED_H: 'unchecked-highlight',
    CLASS_INTERMEDIATE_H: 'intermediate-highlight',
    CLASS_CHECKED_H: 'checked-highlight',
    CLASS_TRISTATE_DUMMY: 'tristate-dummy',
    EVENT_STATE_CHANGE: 'tristate:statechange'
});