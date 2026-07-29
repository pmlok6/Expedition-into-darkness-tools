/* ==========================================
   Supabase Auth

   Features:
   - GitHub OAuth
   - Discord OAuth
   - Email signup/login
   - Logout
   - Session check
   - OAuth callback
   - Redirect after login
========================================== */
import { supabase } from "./supabase.js";
// ===============================
// Elements
// ===============================
const email =document.getElementById("email");
const password =document.getElementById("password");
// ===============================
// Redirect after login
// ===============================
function redirectAfterLogin()
{
    const redirect =    sessionStorage.getItem(        "redirectAfterLogin"    );


    sessionStorage.removeItem(
        "redirectAfterLogin"
    );


    if(redirect)
    {
        window.location.href = redirect;
    }
    else
   {
       window.location.href ="https://pmlok6.github.io/Expedition-into-darkness-tools/";
   }
}
// ===============================
// OAuth Login
// ===============================
async function oauthLogin(provider)
{
    sessionStorage.setItem("redirectAfterLogin",document.referrer || "/Expedition-into-darkness-tools/");
    const redirectUrl ="https://pmlok6.github.io/Expedition-into-darkness-tools/login.html";
    const { error } =await supabase.auth.signInWithOAuth(
       {
        provider,
        options:
        {
            redirectTo: redirectUrl
        }
    });

    if(error)
    {
        console.error(error);
    }
}
// ===============================
// Handle OAuth callback
// ===============================

async function handleOAuthCallback()
{
    const hash =
    window.location.hash;


    if(hash.includes("access_token"))
    {
        const { data, error } =
        await supabase.auth.getSession();


        if(error)
        {
            console.error(
                "OAuth callback error :",
                error
            );

            return;
        }


        console.log(
            "OAuth session :",
            data.session
        );


        // Nettoyage URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        redirectAfterLogin();
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
        console.error(
            "Signup error :",
            error
        );

        return;
    }


    console.log(
        "Compte créé :",
        data
    );


    alert(
        "Compte créé ! Vérifie ton email."
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
        console.error(
            "Login error :",
            error
        );

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


    console.log(
        "Déconnecté"
    );


    window.location.reload();
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
        console.error(
            error
        );

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
// Auth listener
// ===============================

supabase.auth.onAuthStateChange(
(event, session) =>
{
    console.log(
        "Auth event :",
        event
    );


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
    () =>
    {
        oauthLogin("github");
    }
);



document
.getElementById("discord-login")
?.addEventListener(
    "click",
    () =>
    {
        oauthLogin("discord");
    }
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

handleOAuthCallback();
