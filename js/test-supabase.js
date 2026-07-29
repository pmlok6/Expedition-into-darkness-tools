import { supabase } from "./supabase.js";


async function test()
{

    const { data, error } = await supabase
        .from("maps")
        .select("*");


    if(error)
    {
        console.error(error);
        return;
    }


    console.log("Connexion Supabase OK !");
    console.log(data);

}


test();
