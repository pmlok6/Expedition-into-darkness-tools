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
// Config
// ===============================

const redirectURL = window.location.href;


// ===============================
// Elements
// ===============================

const email = document.getElementById("email");
const password = document.getElementById("password");


// ===============================
// OAuth Login
// ===============================

async function oauthLogin(provider)
{
    sessionStorage.setItem(
        "redirectAfterLogin",
        window.location.href
    );


    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider
    });


    if(error)
    {
        console.error("OAuth error :", error);
    }
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


    console.log("Connexion réussie :", data);

    window.location.href = redirectURL;
}


// ===============================
// Logout
// ===============================

async function logout()
{
    const { error } = await supabase.auth.signOut();

    if(error)
    {
        console.error("Logout error :", error);
        return;
    }

    console.log("Déconnecté");

    window.location.reload();
}


// ===============================
// Session check
// ===============================

async function checkSession()
{
    const { data, error } = await supabase.auth.getSession();

    if(error)
    {
        console.error(error);
        return;
    }


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
supabase.auth.onAuthStateChange((event, session) =>
{
    if(event === "SIGNED_IN" && session)
    {
        const redirect =
            sessionStorage.getItem("redirectAfterLogin");


        if(redirect)
        {
            sessionStorage.removeItem(
                "redirectAfterLogin"
            );

            window.location.href = redirect;
        }
    }
});

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


// ===============================
// Start
// ===============================

checkSession();
