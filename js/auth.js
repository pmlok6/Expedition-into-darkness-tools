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

import {supabase} from "./supabase.js";


// ===============================
// Elements
// ===============================

const email=document.getElementById("email");
const password=document.getElementById("password");



// ===============================
// Redirect management
// ===============================

function saveRedirect()
{
    if(
        !sessionStorage.getItem(
            "redirectAfterLogin"
        )
    )
    {
        sessionStorage.setItem(
            "redirectAfterLogin",
            document.referrer
            ||
            window.location.href
        );
    }
}



function redirectAfterLogin()
{
    const redirect=
    sessionStorage.getItem(
        "redirectAfterLogin"
    );


    sessionStorage.removeItem(
        "redirectAfterLogin"
    );


    if(
        redirect &&
        !redirect.includes("login.html")
    )
    {
        window.location.href=redirect;
        return;
    }


    console.log(
        "No redirect needed"
    );
}



// ===============================
// OAuth Login
// ===============================

async function oauthLogin(provider)
{
    saveRedirect();


    const {error}=await supabase.auth.signInWithOAuth(
    {
        provider,

        options:
        {
            redirectTo:
            "https://pmlok6.github.io/Expedition-into-darkness-tools/login.html"
        }
    });


    if(error)
    {
        console.error(
            "OAuth error:",
            error
        );
    }
}



// ===============================
// OAuth Callback
// ===============================

async function handleOAuthCallback()
{
    const {data,error}=await supabase.auth.getSession();


    if(error)
    {
        console.error(
            "OAuth callback error:",
            error
        );

        return;
    }


    if(data.session)
    {
        console.log(
            "OAuth connected:",
            data.session.user
        );


        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        redirectAfterLogin();
    }
}



// ===============================
// Signup
// ===============================

async function signup()
{
    if(!email || !password)
        return;


    const {data,error}=await supabase.auth.signUp(
    {
        email:email.value,

        password:password.value
    });


    if(error)
    {
        console.error(
            "Signup error:",
            error
        );

        return;
    }


    console.log(
        "Account created:",
        data
    );


    alert(
        "Account created. Check your email."
    );
}



// ===============================
// Login
// ===============================

async function login()
{
    if(!email || !password)
        return;


    const {data,error}=await supabase.auth.signInWithPassword(
    {
        email:email.value,

        password:password.value
    });


    if(error)
    {
        console.error(
            "Login error:",
            error
        );

        return;
    }


    console.log(
        "Login success:",
        data
    );


    redirectAfterLogin();
}



// ===============================
// Logout
// ===============================

async function logout()
{
    const {error}=await supabase.auth.signOut();


    if(error)
    {
        console.error(
            "Logout error:",
            error
        );

        return;
    }


    console.log(
        "Logout success"
    );


    window.location.reload();
}



// ===============================
// Session check
// ===============================

async function checkSession()
{
    const {data,error}=await supabase.auth.getSession();


    if(error)
    {
        console.error(
            "Session error:",
            error
        );

        return;
    }


    if(data.session)
    {
        console.log(
            "Connected user:",
            data.session.user
        );
    }
    else
    {
        console.log(
            "No session"
        );
    }
}



// ===============================
// Auth listener
// ===============================

supabase.auth.onAuthStateChange(
(event,session)=>
{
    console.log(
        "Auth event:",
        event
    );


    if(session)
    {
        console.log(
            "User:",
            session.user
        );
    }
});



// ===============================
// Buttons
// ===============================

document
.getElementById("github-login")
?.addEventListener(
"click",
()=>
{
    oauthLogin("github");
});



document
.getElementById("discord-login")
?.addEventListener(
"click",
()=>
{
    oauthLogin("discord");
});



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

await checkSession();

await handleOAuthCallback();
