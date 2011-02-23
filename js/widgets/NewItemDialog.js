/*******************************************************************************
 * Copyright (c) 2010 IBM Corporation and others. All rights reserved. This
 * program and the accompanying materials are made available under the terms of
 * the Eclipse Public License v1.0 which accompanies this distribution, and is
 * available at http://www.eclipse.org/legal/epl-v10.html
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global dojo dijit*/
/*jslint browser:true*/
dojo.provide("widgets.NewItemDialog");

dojo.require("dijit.Dialog");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.data.ItemFileReadStore");

/**
 * @param options {{ 
 *     title: string,
 *     label: string,
 *     func: function,
 *     [advanced]: boolean  // Whether to show advanced controls. Default is false
 * }}
 */
dojo.declare("widgets.NewItemDialog", [dijit.Dialog], {
	widgetsInTemplate: true,
	templateString: dojo.cache("widgets", "templates/NewItemDialog.html"),
	
	constructor : function() {
		this.inherited(arguments);
		this.options = arguments[0] || {};
		this.options.advanced = this.options.advanced || false;
	},
	postMixInProperties : function() {
		this.inherited(arguments);
		this.title = this.options.title || "No title";
		this.itemNameLabelText = this.options.label || "Name:";
		this.buttonCancel = "Cancel";
	},
	postCreate: function() {
		this.inherited(arguments);
		dojo.connect(this, "onKeyPress", dojo.hitch(this, function(evt) {
			if (evt.keyCode === dojo.keys.ENTER) {
				this.domNode.focus(); // FF throws DOM error if textfield is focused after dialog closes
				this._onSubmit();
			}
		}));
		
		if (this.options.advanced) {
			this.itemAdvancedInfo.style.display = "table-row";
			this.itemAdvancedInfo1.style.display = "table-row";
			this.protocol.attr('value', 'file');
			dojo.connect(this.protocol, "onChange", dojo.hitch(this, this.onModuleChange));
			dojo.connect(this.itemURL, "onkeyup", dojo.hitch(this, this.onURLChange));
		} else {
			this.itemAdvancedInfo.style.display = "none";
			this.itemAdvancedInfo1.style.display = "none";
		}
		
		this.refocus = false; // Dojo 10654
	},
	onHide: function() {
		// This assumes we don't reuse the dialog
		this.inherited(arguments);
		setTimeout(dojo.hitch(this, function() {
			this.destroyRecursive(); // TODO make sure this removes DOM elements
		}), this.duration);
	},
	// Stuff from newItemDialog.js is below
	execute: function() {
		var url, create;
		if (this.options.advanced) {
			var protocol = this.protocol.attr("value");
			url = (protocol !== 'file' ? this.protocol.attr("value") + ":/" : "");
			url = url + this.itemURL.value.replace(/^\s+|\s+$/g, '');
			if (this.module.style.display !== "none") {
				url = url + "?/" + this.module.value.replace(/^\s+|\s+$/g, '');
			}
			if (this.createCheckbox.attr('disabled')) {
				create = false;
			} else {
				create = this.createCheckbox.attr('checked');
			}
		}
		this.options.func(this.itemName.value, (url && url !== "") ? url : undefined, create);
	},
	onURLChange : function(evt) {
		var protocol = this.protocol.attr("value");
		if (protocol === 'file') {
			this.createCheckbox.attr('disabled', false);
			return;
		}
		var url = this.itemURL.value;
		if (url.match(new RegExp("^file://"))) {
			this.createCheckbox.attr('disabled', false);
			return;
		}
		var remoteRegExp = new RegExp('^[a-zA-Z][a-zA-Z]+\:\/\/.+');
		if (url.match(remoteRegExp)) {
			this.createCheckbox.attr('disabled', true);
			return;
		} else {
			this.createCheckbox.attr('disabled', false);
			return;
		}
	},
	onModuleChange : function(evt) {
		if (this.protocol.attr("value") === 'gitfs') {
			this.moduleLabel.style.display = 'inline-block';
			this.module.style.display = 'inline-block';
			this.itemURL.style.width = '50%';
		} else {
			this.moduleLabel.style.display = 'none';
			this.module.style.display = 'none';
			this.itemURL.style.width = '86%';
		}
		this.onURLChange(evt);
	}
});