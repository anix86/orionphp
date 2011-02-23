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
 * StatusReporting Service
 * @class Service for reporting status
 */
eclipse.StatusReportingService = function(serviceRegistry, domId) {
	this.serviceRegistry = serviceRegistry;
	this.domId = domId;
};
 
eclipse.StatusReportingService.prototype = {
	setMessage : function(msg) {
      		dojo.byId(this.domId).innerHTML = msg;
	},

	setErrorMessage : function(st) {
		//could either be responseText from xhrGet or just a string
		var status = st.responseText || st;
		//accept either a string or a JSON representation of an IStatus
		try {
			status = JSON.parse(status);
		} catch(error) {
			//it is not JSON, just continue;
		}
		var message = status.message || status;
		var color = "red";
		if (status.severity) {
			switch (status.severity) {
			case "warning":
				color = "#FFCC00";
				break;
			case "error":
				color = "red";
				break;
			case "info":
				case "ok":
				color = "green";
				break;
			}
		}
		dojo.byId(this.domId).innerHTML = "<span style=\"color: " + color + "\">" + message + "</span>";
	}
};
	