/* ==========================================
   Supabase Auth

   Features:
   - GitHub OAuth
   - Discord OAuth
   - Email signup/login
   - Logout
   - Session check
========================================== */

import { supabase } from "./supabase.js";


// ===============================
// Elements
// ===============================

const email = document.getElementById("email");
const password = document.getElementById("password");


// ===============================
// Redirect
// ===============================

const redirect = () =>
{
    window.location.href = "maps.html";
};


// ===============================
// OAuth Login
// ===============================

async function oauthLogin(provider)
{
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options:
        {
            redirectTo: window.location.href
        }
    });

    if(error)
        console.error("OAuth error :", error);
}


// ===============================
// Email Signup
// ===============================

async function signup()
{
    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
    });


    if(error)
    {
        console.error("Signup error :", error);
        return;
    }


    console.log("Compte créé :", data);

    alert("Compte créé !");
}


// ===============================
// Email Login
// ===============================

async function login()
{
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    });


    if(error)
    {
        console.error("Login error :", error);
        return;
    }


    console.log("Connecté :", data);

    redirect();
}


// ===============================
// Logout
// ===============================

async function logout()
{
    await supabase.auth.signOut();

    console.log("Déconnecté");

    window.location.reload();
}


// ===============================
// Session check
// ===============================

async function checkSession()
{
    const { data } = await supabase.auth.getSession();

    if(data.session)
    {
        console.log(
            "Utilisateur connecté :",
            data.session.user
        );
    }
    else
    {
        console.log("Aucune session");
    }
}


// ===============================
// Events
// ===============================

document
.getElementById("github-login")
?.addEventListener("click", () =>
{
    oauthLogin("github");
});


document
.getElementById("discord-login")
?.addEventListener("click", () =>
{
    oauthLogin("discord");
});


document
.getElementById("signup")
?.addEventListener("click", signup);


document
.getElementById("login")
?.addEventListener("click", login);


document
.getElementById("logout")
?.addEventListener("click", logout);


// Start
checkSession();
