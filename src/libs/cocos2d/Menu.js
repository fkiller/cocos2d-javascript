var util = require('util'),
    Layer = require('./Layer').Layer,
    Director = require('./Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    geom = require('geometry'), ccp = geom.ccp;

/** @private
 * @constant */
var kMenuStateWaiting = 0;

/** @private
 * @constant */
var kMenuStateTrackingTouch = 1;
	

/** @member cocos
 * @class
 *
 * @extends cocos.Layer
 */
var Menu = Layer.extend(/** @scope cocos.Menu# */{
	mouseDelegatePriority: (-Number.MAX_VALUE +1),
	state: kMenuStateWaiting,
	selectedItem: null,
	opacuty: 255,
	color: null,

	init: function(opts) {
		@super;

		var items = opts['items'];

		this.set('isMouseEnabled', true);
		
        var s = Director.get('sharedDirector').get('winSize');

		this.set('isRelativeAnchorPoint', false);
		this.anchorPoint = ccp(0.5, 0.5);
		this.set('contentSize', s);

		this.set('position', ccp(s.width /2, s.height /2));


		if (items) {
			var z = 0;
			util.each(items, util.callback(this, function(item) {
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

    itemForMouseEvent: function(event) {
        var location = Director.get('sharedDirector').convertEventToCanvas(event);

        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    mouseUp: function(event) {
        if (this.selectedItem) {
            this.selectedItem.set('isSelected', false);
            this.selectedItem.activate();

            return true;
        }

        if (this.state != kMenuStateWaiting) {
            this.set('state', kMenuStateWaiting);
        }

        return false;

    },
    mouseDown: function(event) {
        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.set('selectedItem', this.itemForMouseEvent(event));
        if (selectedItem) {
            selectedItem.set('isSelected', true);
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },
    mouseDragged: function(event) {
        var currentItem = this.itemForMouseEvent(event);

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', false);
            }
            this.set('selectedItem', currentItem);
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', true);
            }
        }

        if (currentItem && this.state == kMenuStateTrackingTouch) {
            return true;
        }

        return false;
        
    }

});

exports.Menu = Menu;
