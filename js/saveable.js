/*******************************************************************************
 * Copyright (c) 2009, 2010 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors: IBM Corporation - initial API and implementation
 *******************************************************************************/
 
"use strict";
 
/**
 * @namespace The global container for eclipse APIs.
 */ 
var eclipse = eclipse || {};

/**
 * Saveable Service
 * @class Service for saving things
 */
eclipse.SaveableService = function(serviceRegistry) {
	this.serviceRegistry = serviceRegistry;
	this._dirtyCallback = null;
};
 
eclipse.SaveableService.prototype = {
	doSave : function(uri, contents) {
		dojo.xhrPut({
			url: uri,
			timeout: 5000,
			putData: contents,
				load: function(contents, secondArg) {
			},
			error: function(error, ioArgs) {		
				alert(error.message);
				handlePutAuthenticationError(this, ioArgs);
			}
		});	
	},
		
	isDirty : function(onDone) {
		if (this._dirtyCallback) {
			onDone(this._dirtyCallback.apply(this));
		} else {
			onDone(false);
		}
	},

	setDirtyCallback : function(callback) {
		this._dirtyCallback = callback;
	}
};
