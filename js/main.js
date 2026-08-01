/* ==========================================
   Main JS

   Features:
   - Navigation
   - Footer
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
    location.pathname.includes("/calculators/")||
    location.pathname.includes("/antediluvian-interactive/")||
    location.pathname.includes("/credits/")||
    ?
    "../"
    :
    "./";


    nav.innerHTML=
`
<div class="nav-logo">

    <a href="${root}index.html">

        <img src="${root}assets/Site-logo.png">

    </a>

</div>


<div class="nav-links">

    <a href="${root}maps/maps.html">
        🗺 Maps
    </a>

    <a href="${root}skills/skills.html">
        🌳 Skill Tree
    </a>

    <a href="${root}leveling/leveling.html">
        📈 Leveling
    </a>

    <a href="${root}calculators/armor.html">
        🛡 Armor
    </a>

    <a href="${root}calculators/weapon.html">
        ⚔ Weapon
    </a>

    <a href="${root}login.html">
        🔑 Login
    </a>

</div>
`;
}


// ===============================
// footer
// ===============================

function loadFooter()
{
    const footer=document.getElementById("site-footer");

    if(!footer)
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


    footer.innerHTML=
`
<div class="footer-studio">

    <a href="${root}studio.html">

        <img 
            src="${root}assets/antediluvian-logo.png"
            alt="Antediluvian Interactive">

    </a>

</div>


<div class="footer-credit">

    <a href="${root}credits.html">
        Credits
    </a>

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

document.addEventListener(
"DOMContentLoaded",
()=>
{
    loadNavigation();

    loadFooter();

    checkUser();
});
