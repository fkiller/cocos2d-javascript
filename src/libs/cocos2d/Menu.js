var sys = require('sys'),
    Layer = require('./Layer').Layer,
    Director = require('./Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    TouchDispatcher = require('./TouchDispatcher').TouchDispatcher,
    geom = require('geometry'), ccp = geom.ccp;

/** @private
 * @constant */
var kMenuStateWaiting = 0;

/** @private
 * @constant */
var kMenuStateTrackingTouch = 1;
	

/** @member cocos
 * @class
 */
var Menu = Layer.extend(/** @scope cocos.Menu# */{
	state: kMenuStateWaiting,
	selectedItem: null,
	opacuty: 255,
	color: null,

	init: function(opts) {
		@super;

		var items = opts['items'];

		this.set('isTouchEnabled', true);
		
        var s = Director.get('sharedDirector.winSize');

		this.set('isRelativeAnchorPoint', false);
		this.anchorPoint = ccp(0.5, 0.5);
		this.set('contentSize', s);

		this.set('position', ccp(s.width /2, s.height /2));


		if (items) {
			var z = 0;
			sys.each(items, sys.callback(this, function(item) {
				this.addChild({child: item, z:z++});
			}));
		}

        
	},

	addChild: function(opts) {
		if (!opts['child'] instanceof MenuItem) {
			throw "Menu only supports MenuItem objects as children";
		}

		return @super;
    },

    registerWithTouchDispatcher: function() {
        TouchDispatcher.get('sharedDispatcher').addTargetedDelegate({delegate: this, priority: INT_MIN+1, swallowsTouches: true});
    },

    itemForTouch: function(touch) {
        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(touch.location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    touchBegan: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.set('selectedItem', this.itemForTouch(touch));
        if (selectedItem) {
            selectedItem.set('isSelected', true);
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },
    touchMoved: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

            var currentItem = this.itemForTouch(touch);

            if (currentItem != this.selectedItem) {
                if (this.selectedItem) {
                    this.selectedItem.set('isSelected', false);
                }
                this.set('selectedItem', currentItem);
                if (this.selectedItem) {
                    this.selectedItem.set('isSelected', true);
                }
            }
        
    },
    touchEnded: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

        if (this.selectedItem) {
            this.selectedItem.set('isSelected', false);
            this.selectedItem.activate();
        }

        this.set('state', kMenuStateWaiting);
    }

});

exports.Menu = Menu;
