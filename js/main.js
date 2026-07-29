/* ==========================================
   Main JS

   Features:
   - Navigation
   - Auth state
========================================== */

import { supabase } from "./supabase.js";


// ===============================
// navigation
// ===============================
function loadNavigation()
{
    const nav=document.getElementById("main-navigation");

    if(!nav)
        return;

    const root=
    location.pathname.includes("/maps/")||
    location.pathname.includes("/skills/")||
    location.pathname.includes("/leveling/")||
    location.pathname.includes("/calculators/")
    ?
    "../"
    :
    "./";


    nav.innerHTML=
`
<div class="navigation-container">

<a class="navigation-logo" href="${root}index.html">
<img src="${root}assets/Site-logo.png">
</a>

<div class="navigation-links">

<a class="navigation-button" href="${root}maps/maps.html">
🗺 Maps
</a>

<a class="navigation-button" href="${root}skills/skills.html">
🌳 Skill Tree
</a>

<a class="navigation-button" href="${root}leveling/leveling.html">
📈 Leveling
</a>

<a class="navigation-button" href="${root}calculators/armor.html">
🛡 Armor
</a>

<a class="navigation-button" href="${root}calculators/weapon.html">
⚔ Weapon
</a>

<a class="navigation-button" href="${root}login.html">
🔑 Login
</a>

</div>

</div>
`;
}


// ===============================
// auth
// ===============================
async function checkUser()
{
    const {data}=await supabase.auth.getSession();

    const user=data.session?.user??null;

    console.log(
        user?
        "Utilisateur connecté :":
        "Aucun utilisateur",
        user
    );
}


// ===============================
// start
// ===============================
document.addEventListener("DOMContentLoaded",()=>
{
    loadNavigation();
    checkUser();
});
