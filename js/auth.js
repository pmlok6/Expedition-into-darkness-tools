/* ==========================================
   Supabase Auth

   Features:
   - GitHub OAuth
   - Discord OAuth
   - Email signup/login
   - Logout
   - Session check
   - Redirect after login
========================================== */

import { supabase } from "./supabase.js";


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
    // Sauvegarde de la page actuelle
    sessionStorage.setItem(
        "redirectAfterLogin",
        window.location.href
    );


    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options:
        {
            redirectTo: window.location.origin
        }
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
    if(!email || !password)
        return;


    const { data, error } =
    await supabase.auth.signUp({
        email: email.value,
        password: password.value
    });


    if(error)
    {
        console.error("Signup error :", error);
        return;
    }


    console.log("Compte créé :", data);

    alert(
        "Compte créé ! Vérifie ton email si nécessaire."
    );
}


// ===============================
// Email Login
// ===============================

async function login()
{
    if(!email || !password)
        return;


    const { data, error } =
    await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    });


    if(error)
    {
        console.error("Login error :", error);
        return;
    }


    console.log(
        "Connexion réussie :",
        data
    );


    redirectAfterLogin();
}


// ===============================
// Logout
// ===============================

async function logout()
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


    console.log("Déconnecté");

    window.location.reload();
}


// ===============================
// Redirect after login
// ===============================

function redirectAfterLogin()
{
    const redirect =
        sessionStorage.getItem(
            "redirectAfterLogin"
        );


    sessionStorage.removeItem(
        "redirectAfterLogin"
    );


    if(redirect)
    {
        window.location.href = redirect;
    }
    else
    {
        window.location.href =
        window.location.origin;
    }
}


// ===============================
// Session check
// ===============================

async function checkSession()
{
    const { data, error } =
    await supabase.auth.getSession();


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
        console.log(
            "Aucune session"
        );
    }
}


// ===============================
// OAuth callback
// ===============================

supabase.auth.onAuthStateChange(
(event, session) =>
{
    if(event === "SIGNED_IN" && session)
    {
        redirectAfterLogin();
    }
});


// ===============================
// Buttons
// ===============================

document
.getElementById("github-login")
?.addEventListener(
    "click",
    () => oauthLogin("github")
);


document
.getElementById("discord-login")
?.addEventListener(
    "click",
    () => oauthLogin("discord")
);


document
.getElementById("signup")
?.addEventListener(
    "click",
    signup
);


document
.getElementById("login")
?.addEventListener(
    "click",
    login
);


document
.getElementById("logout")
?.addEventListener(
    "click",
    logout
);


// ===============================
// Start
// ===============================

checkSession();
