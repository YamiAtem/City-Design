AFRAME.registerComponent("create_models", {
    init: async function () {
        var models = await this.get_models();
        var barcodes = Object.keys(models);
        barcodes.map(barcode => {
            var model = models[barcode];
            this.create_model(model);
        });
    },

    get_models: function () {
        return fetch("js/models.json")
            .then(res => res.json())
            .then(data => data);
    },

    create_model: function (model) {
        var barcode_value = model.barcode_value;
        var model_url = model.model_url;
        var model_name = model.model_name;

        var scene = document.querySelector("a-scene");

        var marker = document.createElement("a-marker");

        marker.setAttribute("id", `marker-${model_name}`);
        marker.setAttribute("type", "barcode");
        marker.setAttribute("model_name", model_name);
        marker.setAttribute("value", barcode_value);
        marker.setAttribute("markerhandler", {});
        scene.appendChild(marker);

        if (barcode_value === 0) {
            var model_el = document.createElement("a-entity");
            model_el.setAttribute("id", `${model_name}`);
            model_el.setAttribute("geometry", {
                primitive: "box",
                width: model.width,
                height: model.height
            });
            model_el.setAttribute("position", model.position);
            model_el.setAttribute("rotation", model.rotation);
            model_el.setAttribute("material", {
                color: model.color
            });
            marker.appendChild(model_el);
        } else {
            var model_el = document.createElement("a-entity");
            model_el.setAttribute("id", `${model_name}`);
            model_el.setAttribute("gltf-model", `url(${model_url})`);
            model_el.setAttribute("scale", model.scale);
            model_el.setAttribute("position", model.position);
            model_el.setAttribute("rotation", model.rotation);
            marker.appendChild(model_el);
        }
    }
});
