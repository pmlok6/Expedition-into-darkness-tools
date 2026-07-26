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

    <a href="../database.html">
        Database
    </a>

    <a href="armor.html">
        Armor Calculator
    </a>

    <a href="weapon.html">
        Weapon Calculator
    </a>

    <a href="../leveling.html">
        Leveling
    </a>
    
    <a href="../maps.html">
        Maps
    </a>
</div>

    <div class="nav-logo">

        <img 
        src="../assets/logo.png"
        alt="Expedition into Darkness">

    </div>

    `;

});
