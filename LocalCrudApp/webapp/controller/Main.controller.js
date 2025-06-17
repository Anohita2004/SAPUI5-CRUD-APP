sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("LocalCrudApp.controller.Main", {
        onInit: function () {
            this._lastAction = null;

            var initialItems = [
                { id: "1", name: "Item 1", description: "Description 1" },
                { id: "2", name: "Item 2", description: "Description 2" }
            ];

            var oModel = new sap.ui.model.json.JSONModel({
                items: initialItems,
                filteredItems: initialItems.slice(),
                id: "",
                name: "",
                description: "",
                itemsCount: initialItems.length,
                filteredCount: initialItems.length
            });

            this.getView().setModel(oModel);
        },

        _refreshFilteredItems: function () {
            var oModel = this.getView().getModel();
            var sQuery = this.byId("searchField").getValue().toLowerCase();
            var aAllItems = oModel.getProperty("/items");

            var aFiltered = [];
            for (var i = 0; i < aAllItems.length; i++) {
                var item = aAllItems[i];
                if (
                    item.name.toLowerCase().indexOf(sQuery) !== -1 ||
                    item.description.toLowerCase().indexOf(sQuery) !== -1
                ) {
                    aFiltered.push(item);
                }
            }

            oModel.setProperty("/filteredItems", aFiltered);
            oModel.setProperty("/filteredCount", aFiltered.length);
        },

        _updateItemCount: function () {
            var oModel = this.getView().getModel();
            var count = oModel.getProperty("/items").length;
            oModel.setProperty("/itemsCount", count);
        },

        onAdd: function () {
            var oModel = this.getView().getModel();
            var oData = oModel.getData();

            if (!oData.id || !oData.name) {
                MessageToast.show("⚠️ ID and Name required!");
                return;
            }

            for (var i = 0; i < oData.items.length; i++) {
                if (oData.items[i].id === oData.id) {
                    MessageToast.show("❌ ID already exists!");
                    return;
                }
            }

            var newItem = {
                id: oData.id,
                name: oData.name,
                description: oData.description
            };

            oData.items.push(newItem);
            this._lastAction = { type: "add", item: newItem };

            oData.id = "";
            oData.name = "";
            oData.description = "";

            oModel.refresh();
            this._refreshFilteredItems();
            this._updateItemCount();
            MessageToast.show("🎉 Item added!");
        },

        onUpdate: function () {
            var oModel = this.getView().getModel();
            var oData = oModel.getData();
            var found = false;

            for (var i = 0; i < oData.items.length; i++) {
                if (oData.items[i].id === oData.id) {
                    var prevItem = {
                        id: oData.items[i].id,
                        name: oData.items[i].name,
                        description: oData.items[i].description
                    };

                    oData.items[i].name = oData.name;
                    oData.items[i].description = oData.description;

                    this._lastAction = { type: "update", prev: prevItem };
                    found = true;
                    break;
                }
            }

            if (!found) {
                MessageToast.show("❌ No matching ID found to update!");
                return;
            }

            oData.id = "";
            oData.name = "";
            oData.description = "";

            oModel.refresh();
            this._refreshFilteredItems();
            MessageToast.show("✅ Item updated!");
        },

        onDelete: function () {
            var oModel = this.getView().getModel();
            var oData = oModel.getData();
            var index = -1;

            for (var i = 0; i < oData.items.length; i++) {
                if (oData.items[i].id === oData.id) {
                    index = i;
                    break;
                }
            }

            if (index === -1) {
                MessageToast.show("⚠️ No item selected to delete!");
                return;
            }

            var deleted = oData.items.splice(index, 1)[0];
            this._lastAction = { type: "delete", item: deleted };

            oData.id = "";
            oData.name = "";
            oData.description = "";

            oModel.refresh();
            this._refreshFilteredItems();
            this._updateItemCount();
            MessageToast.show("🗑️ Item deleted!");
        },

        onUndo: function () {
            var oModel = this.getView().getModel();
            var oData = oModel.getData();
            var action = this._lastAction;

            if (!action) {
                MessageToast.show("No action to undo.");
                return;
            }

            if (action.type === "add") {
                var newList = [];
                for (var i = 0; i < oData.items.length; i++) {
                    if (oData.items[i].id !== action.item.id) {
                        newList.push(oData.items[i]);
                    }
                }
                oData.items = newList;
            } else if (action.type === "delete") {
                oData.items.push(action.item);
            } else if (action.type === "update") {
                for (var i = 0; i < oData.items.length; i++) {
                    if (oData.items[i].id === action.prev.id) {
                        oData.items[i].name = action.prev.name;
                        oData.items[i].description = action.prev.description;
                        break;
                    }
                }
            }

            this._lastAction = null;
            oModel.refresh();
            this._refreshFilteredItems();
            this._updateItemCount();
            MessageToast.show("↩️ Undo successful!");
        },

        onCardSelect: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oData = oContext.getObject();
            var oModel = this.getView().getModel();

            oModel.setProperty("/id", oData.id);
            oModel.setProperty("/name", oData.name);
            oModel.setProperty("/description", oData.description);
        },

        onThemeToggle: function () {
            var oCore = sap.ui.getCore();
            var sCurrentTheme = oCore.getConfiguration().getTheme();
            var sNewTheme = (sCurrentTheme === "sap_fiori_3_dark") ? "sap_fiori_3" : "sap_fiori_3_dark";
            oCore.applyTheme(sNewTheme);
            MessageToast.show("🌗 Theme switched to " + sNewTheme);
        },

        onExport: function () {
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            var sCSV = "ID,Name,Description\n";

            for (var i = 0; i < aItems.length; i++) {
                var item = aItems[i];
                sCSV += item.id + "," + item.name + "," + item.description + "\n";
            }

            var blob = new Blob([sCSV], { type: "text/csv;charset=utf-8;" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "items.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            MessageToast.show("📤 Exported to CSV!");
        },

        onFilter: function () {
            this._refreshFilteredItems();
        },

        onSortAsc: function () {
            var oModel = this.getView().getModel();
            var aFiltered = oModel.getProperty("/filteredItems");

            aFiltered.sort(function (a, b) {
                return parseInt(a.id, 10) - parseInt(b.id, 10);
            });

            oModel.setProperty("/filteredItems", aFiltered);
            MessageToast.show("Sorted by ID (Asc)");
        },

        onSortDesc: function () {
            var oModel = this.getView().getModel();
            var aFiltered = oModel.getProperty("/filteredItems");

            aFiltered.sort(function (a, b) {
                return parseInt(b.id, 10) - parseInt(a.id, 10);
            });

            oModel.setProperty("/filteredItems", aFiltered);
            MessageToast.show("Sorted by ID (Desc)");
        }
    });
});

