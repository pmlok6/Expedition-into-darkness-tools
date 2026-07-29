import { supabase } from "./supabase.js";


const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");


async function signup()
{
    const { data, error } = await supabase.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value
    });

    if(error)
    {
        console.error(error);
        return;
    }

    console.log("Compte créé :", data);
}


async function login()
{
    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value
    });

    if(error)
    {
        console.error(error);
        return;
    }

    console.log("Connecté :", data);
    window.location.href = "maps.html";
}


async function logout()
{
    await supabase.auth.signOut();
    console.log("Déconnecté");
}


document
.getElementById("signup")
?.addEventListener("click", signup);


document
.getElementById("login")
?.addEventListener("click", login);


document
.getElementById("logout")
?.addEventListener("click", logout);
