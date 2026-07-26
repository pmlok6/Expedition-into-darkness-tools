import { invoke }
from "../js/wiki-api.js";


document.addEventListener(
"DOMContentLoaded",
async function()
{

    const calculator =
        document.getElementById(
            "armor-calculator"
        );


    if(!calculator)
    {
        return;
    }


    try
    {

        const ITEM_DATA =
            await invoke(
                "ArmorCalculatorData",
                "items"
            );


        const RECIPE_DATA =
            await invoke(
                "ArmorCalculatorData",
                "recipes"
            );


        initCalculator(
            ITEM_DATA,
            RECIPE_DATA
        );

    }

    catch(error)
    {
        console.error(
            "Armor Calculator loading error",
            error
        );
    }

});



function initCalculator(
    ITEM_DATA,
    RECIPE_DATA
)
{

    const selectorBox =
        document.getElementById(
            "armor-selectors"
        );


    const resultBox =
        document.getElementById(
            "compare-result"
        );


    if(!selectorBox || !resultBox)
    {
        return;
    }



    selectorBox.innerHTML = `

    <div class="armor-selector-row">

        <div>
            <label>Item 1</label><br>
            <select name="item1"></select>
        </div>


        <div>
            <label>Material 1</label><br>
            <select name="material1"></select>
        </div>

    </div>


    <div class="armor-selector-row">

        <div>
            <label>Item 2</label><br>
            <select name="item2"></select>
        </div>


        <div>
            <label>Material 2</label><br>
            <select name="material2"></select>
        </div>

    </div>

    `;



    const item1 =
        document.querySelector(
            'select[name="item1"]'
        );


    const item2 =
        document.querySelector(
            'select[name="item2"]'
        );


    const material1 =
        document.querySelector(
            'select[name="material1"]'
        );


    const material2 =
        document.querySelector(
            'select[name="material2"]'
        );



    function parsePercent(value)
    {

        if(!value)
        {
            return 0;
        }


        return parseFloat(
            String(value)
            .replace("%","")
        ) || 0;

    }



    function getItem(id)
    {
        return ITEM_DATA[id];
    }



    function addOption(
        select,
        value,
        text
    )
    {

        const option =
            document.createElement(
                "option"
            );


        option.value = value;

        option.textContent = text;


        select.appendChild(option);

    }



    function getRecipe(item)
    {

        if(!item)
        {
            return null;
        }


        return Object.values(
            RECIPE_DATA
        )
        .find(recipe =>

            recipe.produces &&
            recipe.produces.some(
                product =>
                    product.item === item.name
            )

        );

    }



    function getMaterial(tag)
    {

        return Object.values(
            ITEM_DATA
        )
        .find(item =>

            item.tags &&
            item.tags.includes(tag) &&
            item.hardness

        );

    }



    function getProtectionZones(item)
    {

        const zones = {};


        const map = {

            "Head":
            "base_head_defense",

            "Torso":
            "base_torso_defense",

            "Left Leg":
            "base_left_leg_defense",

            "Right Leg":
            "base_right_leg_defense",

            "Left Arm":
            "base_left_arm_defense",

            "Right Arm":
            "base_right_arm_defense"

        };



        Object.entries(map)
        .forEach(([zone,key]) =>

        {

            if(item[key])
            {

                zones[zone] =
                    parsePercent(
                        item[key]
                    );

            }

        });


        return zones;

    }




    function fillItems()
    {

        item1.innerHTML =
        '<option value="">-- item --</option>';

        item2.innerHTML =
        '<option value="">-- item --</option>';



        Object.values(
            ITEM_DATA
        )

        .filter(item =>

            item.tags &&
            (

                item.tags.includes("headwear") ||
                item.tags.includes("chestprotection") ||
                item.tags.includes("torso") ||
                item.tags.includes("legs") ||
                item.tags.includes("legprotection") ||
                item.tags.includes("footprotection")

            )

        )

        .sort((a,b)=>

            a.name.localeCompare(
                b.name
            )

        )

        .forEach(item =>
        {

            addOption(
                item1,
                item.guid,
                item.name
            );


            addOption(
                item2,
                item.guid,
                item.name
            );

        });

    }




    function fillMaterials(
        select,
        item
    )
    {

        select.innerHTML =
        '<option value="">-- material --</option>';



        const recipe =
            getRecipe(item);


        if(!recipe)
        {
            return;
        }


        (recipe.allowed_materials || [])

        .forEach(material =>

            addOption(
                select,
                material,
                material
            )

        );

    }




    function buildCard(
        item,
        materialTag
    )
    {

        if(!item || !materialTag)
        {
            return null;
        }



        const material =
            getMaterial(
                materialTag
            );


        if(!material)
        {
            return null;
        }



        const zones =
            getProtectionZones(
                item
            );


        const base =
            Math.max(
                ...Object.values(zones),
                0
            );



        const hardness =
            parsePercent(
                material.hardness
            );


        const brittleness =
            parsePercent(
                material.brittleness
            );



        const real =
            Number(
                (
                    base *
                    hardness /
                    100
                )
                .toFixed(1)
            );



        return {

            name:item.name,

            zone:
                Object.keys(zones)
                .join(", "),

            base,

            material:
                material.name,

            hardness,

            brittleness,

            real

        };

    }





    function compareClass(
        value1,
        value2,
        reverse=false
    )
    {

        if(value1 === value2)
        {
            return "stat-equal";
        }


        if(reverse)
        {

            return value1 < value2
                ?
                "stat-better"
                :
                "stat-worse";

        }


        return value1 > value2
            ?
            "stat-better"
            :
            "stat-worse";

    }





    function createCard(
        data,
        compare
    )
    {

        return `

        <div class="item-card">

            <h3>${data.name}</h3>

            <p>
            Zone:
            <span>${data.zone}</span>
            </p>


            <p>
            Material:
            <span>${data.material}</span>
            </p>


            <p>
            Base Def:
            <span class="${compareClass(data.base,compare.base)}">
            ${data.base}%
            </span>
            </p>


            <p>
            Hardness:
            <span class="${compareClass(data.hardness,compare.hardness)}">
            ${data.hardness}%
            </span>
            </p>


            <p>
            Brittleness:
            <span class="${compareClass(data.brittleness,compare.brittleness,true)}">
            ${data.brittleness}%
            </span>
            </p>


            <p>
            Real Def:
            <span class="${compareClass(data.real,compare.real)}">
            ${data.real}%
            </span>
            </p>


        </div>

        `;

    }





    function render()
    {

        const data1 =
            buildCard(
                getItem(item1.value),
                material1.value
            );


        const data2 =
            buildCard(
                getItem(item2.value),
                material2.value
            );



        if(!data1 || !data2)
        {

            resultBox.innerHTML = "";

            return;

        }



        resultBox.innerHTML = `

        <div class="item-compare-grid">

            ${createCard(data1,data2)}

            ${createCard(data2,data1)}

        </div>

        `;

    }




    item1.onchange = () =>
    {

        fillMaterials(
            material1,
            getItem(item1.value)
        );

        render();

    };



    item2.onchange = () =>
    {

        fillMaterials(
            material2,
            getItem(item2.value)
        );

        render();

    };



    material1.onchange = render;

    material2.onchange = render;



    fillItems();

}
