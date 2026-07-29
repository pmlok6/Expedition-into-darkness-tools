/* ==========================================
   Main JS

   Features:
   - Auth state
   - User display
   - Logout
   - Save page before login
========================================== */

import { supabase } from "./supabase.js";

// ===============================
// Navigation
// ===============================

function loadNavigation()
{
    const nav =
    document.getElementById(
        "main-navigation"
    );


    if(!nav)
        return;


    nav.innerHTML = `

        <a href="/Expedition-into-darkness-tools/">
            🏠 Home
        </a>

        <a href="/Expedition-into-darkness-tools/maps/maps.html">
            🗺 Maps
        </a>

        <a href="/Expedition-into-darkness-tools/skills/skills.html">
            🌳 Skills
        </a>

        <a href="/Expedition-into-darkness-tools/leveling/leveling.html">
            📈 Leveling
        </a>

    `;
}
// ===============================
// Check user
// ===============================

async function checkUser()
{
    const { data, error } =
    await supabase.auth.getSession();


    if(error)
    {
        console.error(
            "Session error :",
            error
        );
        return;
    }


    const user =
    data.session?.user;


    const loginButton =
    document.getElementById(
        "login-button"
    );


    const logoutButton =
    document.getElementById(
        "logout-button"
    );


    const userInfo =
    document.getElementById(
        "user-info"
    );



    if(user)
    {
        console.log(
            "Utilisateur connecté :",
            user
        );


        if(userInfo)
        {
            userInfo.textContent =
            user.user_metadata?.user_name ??
            user.email ??
            "Utilisateur";
        }


        loginButton
        ?.classList
        .add("hidden");


        logoutButton
        ?.classList
        .remove("hidden");
    }
    else
    {
        console.log(
            "Aucun utilisateur"
        );


        loginButton
        ?.classList
        .remove("hidden");


        logoutButton
        ?.classList
        .add("hidden");


        if(userInfo)
        {
            userInfo.textContent = "";
        }
    }
}



// ===============================
// Logout
// ===============================

document
.getElementById("logout-button")
?.addEventListener(
"click",
async () =>
{
    const { error } =
    await supabase.auth.signOut();


    if(error)
    {
        console.error(
            "Logout error :",
            error
        );

        return;
    }


    window.location.reload();
});



// ===============================
// Save current page
// before login
// ===============================

document
.querySelectorAll(
    'a[href*="login.html"]'
)
.forEach(link =>
{
    link.addEventListener(
        "click",
        () =>
        {
            sessionStorage.setItem(
                "redirectAfterLogin",
                window.location.href
            );
        }
    );
});



// ===============================
// Auth changes
// ===============================

supabase.auth.onAuthStateChange(
(event, session) =>
{
    if(event === "SIGNED_IN")
    {
        checkUser();
    }


    if(event === "SIGNED_OUT")
    {
        checkUser();
    }
});



// ===============================
// Start
// ===============================

checkUser();
