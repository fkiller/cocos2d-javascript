var util = require('util'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp;

/**
 * @class cocos.MenuItem Base class for any buttons or options in a menu
 * @extends cocos.Node
 *
 * @constructor
 * @namedparams
 * @param {Function} callback Function to call when menu item is activated
 */
var MenuItem = Node.extend({
	isEnabled: true,
	isSelected: false,
	callback: null,

	init: function(opts) {
		@super;

		var callback = opts['callback'];

		this.set('anchorPoint', ccp(0.5, 0.5));
		this.set('callback', callback);
	},

	activate: function() {
		if (this.isEnabled && this.callback) {
			this.callback(this);
		}
	},

	get_rect: function() {
		return rectMake(
			this.position.x - this.contentSize.width  * this.anchorPoint.x,
			this.position.y - this.contentSize.height * this.anchorPoint.y,
			this.contentSize.width,
			this.contentSize.height
		)
	}
});

/**
 * @class cocos.MenuItemSprite A menu item that accepts any cocos.Node
 * @extends cocos.MenuItem
 *
 * @constructor
 * @namedparams
 * @param {cocos.Node} normalImage Main Node to draw
 * @param {cocos.Node} selectedImage Node to draw when menu item is selected
 * @param {cocos.Node} disabledImage Node to draw when menu item is disabled
 */
var MenuItemSprite = MenuItem.extend({
	normalImage: null,
	selectedImage: null,
	disabledImage: null,

	init: function(opts) {
		@super;

		var normalImage   = opts['normalImage'],
			selectedImage = opts['selectedImage'],
			disabledImage = opts['disabledImage'];

		this.set('normalImage', normalImage);
		this.set('selectedImage', selectedImage);
		this.set('disabledImage', disabledImage);

		this.set('contentSize', normalImage.get('contentSize'));
	},

	draw: function(ctx) {
		if (this.isEnabled) {
			if (this.isSelected) {
				this.selectedImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		} else {
			if (this.disabledImage != null) {
				this.disabledImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		}
	}
});

/**
 * @class cocos.MenuItemImage MenuItem that accepts image files
 * @extends cocos.MenuItemSprite
 *
 * @constructor
 * @namedparams
 * @param {String} normalImage Main image file to draw
 * @param {String} selectedImage Image file to draw when menu item is selected
 * @param {String} disabledImage Image file to draw when menu item is disabled
 */
var MenuItemImage = MenuItemSprite.extend(/** @scope cocos.MenuItemImage# */{
	init: function(opts) {
		var normalI   = opts['normalImage'],
			selectedI = opts['selectedImage'],
			disabledI = opts['disabledImage'],
			callback  = opts['callback'];

		var normalImage = Sprite.create({file: normalI}),
			selectedImage = Sprite.create({file: selectedI}),
			disabledImage = null;

		if (disabledI) {
			disabledImage = Sprite.create({file: disabledI})
		}

		return @super({normalImage: normalImage, selectedImage: selectedImage, disabledImage: disabledImage, callback: callback});
	}
});

exports.MenuItem = MenuItem;
exports.MenuItemImage = MenuItemImage;
exports.MenuItemSprite = MenuItemSprite;
