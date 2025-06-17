sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, Device, JSONModel) {
	"use strict";

	return UIComponent.extend("LocalCrudApp.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * Called automatically during app startup to initialize the component.
		 * @public
		 */
		init: function() {
			// Call base UIComponent init
			UIComponent.prototype.init.apply(this, arguments);

			// Initialize device model for responsive behavior
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			// Main application model - manages form data and item list
			var oMainModel = new JSONModel({
				items: [
					{ id: "1", name: "Item 1", description: "Description 1" },
					{ id: "2", name: "Item 2", description: "Description 2" }
				],
				id: "",
				name: "",
				description: "",

				// For Undo Functionality
				previousState: null,

				// For filtered view (used in card rendering)
				filteredItems: []
			});
			this.setModel(oMainModel);

			// Start the routing (if navigation is needed later)
			this.getRouter().initialize();
		}
	});
});
