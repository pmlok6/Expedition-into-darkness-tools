/* ==========================================
   Maps Selector Gadget

   Features:
   - Map button selection
   - Dynamic map loading
   - Level handling compatibility
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const mapButtons = document.querySelectorAll(".map-button");
    const mapImage = document.querySelector("#map-image");
    const mapTitle = document.querySelector("#map-title");

    if (!mapButtons.length || !mapImage) return;


    const maps = {
        catacomb: {
            name: "Catacomb",
            image: "asset/catacomb/0.png"
        },

        moor: {
            name: "Moor",
            image: "asset/moor/0.png"
        }
    };


    function loadMap(mapId) {

        const map = maps[mapId];

        if (!map) return;


        mapImage.src = map.image;
        mapTitle.textContent = map.name;


        // sauvegarde de la map sélectionnée
        localStorage.setItem("selectedMap", mapId);
    }


    mapButtons.forEach(button => {

        button.addEventListener("click", () => {

            const mapId = button.dataset.map;

            loadMap(mapId);


            mapButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

        });

    });


    // recharge la dernière map choisie
    const savedMap = localStorage.getItem("selectedMap");

    if (savedMap && maps[savedMap]) {
        loadMap(savedMap);

        const button = document.querySelector(
            `[data-map="${savedMap}"]`
        );

        if (button)
            button.classList.add("active");

    } else {
        loadMap("catacomb");
    }

});
