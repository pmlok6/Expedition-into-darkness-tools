/* ==========================================
   Main JS

   Features:
   - Navigation
   - Auth state
   - User display
========================================== */

import { supabase } from "./supabase.js";


// ===============================
// Auth state
// ===============================

async function checkUser()
{
    const { data } = await supabase.auth.getSession();

    const user = data.session?.user;

    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
    const userInfo = document.getElementById("user-info");


    if(user)
    {
        console.log("Utilisateur connecté :", user);


        if(userInfo)
        {
            userInfo.textContent =
            user.email ?? "Utilisateur";
        }


        loginButton?.classList.add("hidden");
        logoutButton?.classList.remove("hidden");
    }
    else
    {
        console.log("Aucun utilisateur");

        loginButton?.classList.remove("hidden");
        logoutButton?.classList.add("hidden");
    }
}


// ===============================
// Logout
// ===============================

document
.getElementById("logout-button")
?.addEventListener("click", async () =>
{
    await supabase.auth.signOut();

    window.location.reload();
});
// ===============================
// Save return page
// ===============================

document
.querySelectorAll('a[href*="login.html"]')
.forEach(link =>
{
    link.addEventListener("click", () =>
    {
        sessionStorage.setItem(
            "redirectAfterLogin",
            window.location.href
        );
    });
});




// ===============================
// Start
// ===============================

checkUser();
