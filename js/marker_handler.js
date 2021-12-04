var model_list = [];
var models = null;
AFRAME.registerComponent("markerhandler", {
    init: async function () {
        this.el.addEventListener("markerFound", () => {
            var model_name = this.el.getAttribute("model_name");
            var barcode_value = this.el.getAttribute("value");
            model_list.push({
                model_name: model_name,
                barcode_value: barcode_value
            });

            this.el.setAttribute("visible", true);
        });

        this.el.addEventListener("markerLost", () => {
            var model_name = this.el.getAttribute("model_name");
            var index = model_list.findIndex(x => x.model_name === model_name);

            if (index > -1) {
                model_list.splice(index, 1);
            }
        });
    },

    get_distance: function (elA, elB) {
        return elA.object3D.position.distanceTo(elB.object3D.position);
    },

    is_model_present_in_array: function (arr, val) {
        for (var i of arr) {
            if (i.model_name === val) {
                return true;
            }
        }
        return false;
    },

    tick: async function () {
        if (model_list.length > 1) {
            var isBaseModelPresent = this.is_model_present_in_array(model_list, "base");
            var messageText = document.querySelector("#message-text");

            if (!isBaseModelPresent) {
                messageText.setAttribute("visible", true);
            } else {
                if (models === null) {
                    models = await this.get_models();
                }

                messageText.setAttribute("visible", false);
                this.place_the_model("road", models);
                this.place_the_model("car", models);
                this.place_the_model("building1", models);
                this.place_the_model("building2", models);
                this.place_the_model("building3", models);
                this.place_the_model("tree", models);
                this.place_the_model("sun", models);
            }
        }
    },

    get_models: function () {
        return fetch("js/models.json")
            .then(res => res.json())
            .then(data => data);
    },

    get_model_geometry: function (models, model_name) {
        var barcodes = Object.keys(models);
        for (var barcode of barcodes) {
            if (models[barcode].model_name === model_name) {
                return {
                    position: models[barcode]["placement_position"],
                    rotation: models[barcode]["placement_rotation"],
                    scale: models[barcode]["placement_scale"],
                    model_url: models[barcode]["model_url"]
                };
            }
        }
    },

    place_the_model: function (model_name, models) {
        var isListContainModel = this.is_model_present_in_array(model_list, model_name);
        if (isListContainModel) {
            var distance = null;
            var marker1 = document.querySelector(`#marker-base`);
            var marker2 = document.querySelector(`#marker-${model_name}`);

            distance = this.get_distance(marker1, marker2);
            if (distance < 1.25) {
                // Changing Model Visibility
                var modelEl = document.querySelector(`#${model_name}`);
                modelEl.setAttribute("visible", false);

                // Checking Model placed or not in scene
                var isModelPlaced = document.querySelector(`#model-${model_name}`);
                if (isModelPlaced === null) {
                    var el = document.createElement("a-entity");
                    var modelGeometry = this.get_model_geometry(models, model_name);
                    el.setAttribute("id", `model-${model_name}`);
                    el.setAttribute("gltf-model", `url(${modelGeometry.model_url})`);
                    el.setAttribute("position", modelGeometry.position);
                    el.setAttribute("rotation", modelGeometry.rotation);
                    el.setAttribute("scale", modelGeometry.scale);
                    marker1.appendChild(el);
                }
            }
        }
    }
});