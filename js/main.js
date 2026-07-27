console.log("Expedition Tools loaded");

document.addEventListener(
"DOMContentLoaded",
function()
{

    const nav =
        document.getElementById(
            "main-navigation"
        );


    if(!nav)
    {
        return;
    }
const base =
"/Expedition-into-darkness-tools/";

    nav.innerHTML = `

<div class="nav-links">
    <a href="${base}">
        Home
    </a>

    <a href="${base}calculators/armor.html">
        Armor Calculator
    </a>

    <a href="${base}calculators/weapon.html">
        Weapon Calculator
    </a>

    <a href="${base}leveling/leveling.html">
        Leveling
    </a>
    
    <a href="${base}maps/maps.html">
        Maps
    </a>
</div>
<div class="nav-logo">
    <a href="/Expedition-into-darkness-tools/"><img  src="${base}assets/logo.png" alt="Expedition into Darkness"></a>
</div>
    `;

});
