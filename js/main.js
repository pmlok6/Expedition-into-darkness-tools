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


    nav.innerHTML = `

<div class="nav-links">
    <a href="../index.html">
        Home
    </a>

    <a href="armor.html">
        Armor Calculator
    </a>

    <a href="weapon.html">
        Weapon Calculator
    </a>

    <a href="leveling.html">
        Leveling
    </a>
    
    <a href="../maps.html">
        Maps
    </a>
</div>

<div class="nav-logo">

    <a href="/Expedition-into-darkness-tools/">
    <img  src="/Expedition-into-darkness-tools/assets/logo.png" alt="Expedition into Darkness">
    </a>

</div>

    `;

});
