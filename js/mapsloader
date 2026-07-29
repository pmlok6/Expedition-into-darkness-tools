import { supabase } from "./supabase.js";


export async function getMaps()
{

    const { data, error } =
        await supabase
            .from("maps")
            .select(`
                id,
                slug,
                name,
                floors (
                    id,
                    floor,
                    label,
                    image
                )
            `)
            .order("id");


    if(error)
    {
        console.error(
            "Erreur chargement maps:",
            error
        );

        return [];
    }


    return data;

}
