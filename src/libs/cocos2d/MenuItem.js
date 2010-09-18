var sys = require('sys'),
    Node = require('./Node').Node,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp;

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

	rect: function() {
		return rectMake(
			this.position.x - this.contentSize.width  * this.anchorPoint.x,
			this.position.y - this.contentSize.height * this.anchorPoint.y,
			this.contentSize.width,
			this.contentSize.height
		)
	}.property()
});

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

var MenuItemImage = MenuItemSprite.extend({
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
