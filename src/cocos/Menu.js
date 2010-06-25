var sys = require('sys'),
    Layer = require('./Layer').Layer,
    Director = require('./Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    ccp = require('geometry').ccp;

var kMenuStateWaiting		= 0,
	kMenuStateTrackingTouch = 1;
	

var Menu = Layer.extend({
	state: null,
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

    touchBegan: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.itemForTouch(touch);
        if (selectedItem) {
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    }

});

exports.Menu = Menu;
