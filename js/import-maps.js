import MAPS from "../data/mapsdata.js";
import { supabase } from "./supabase.js";


async function importMaps()
{

    for (const [slug,map] of Object.entries(MAPS))
    {


        // Création / récupération de la map
        const { data: existingMap, error: mapError } =
            await supabase
                .from("maps")
                .select("*")
                .eq("slug", slug)
                .single();



        if(mapError && mapError.code !== "PGRST116")
        {
            console.error(mapError);
            continue;
        }



        let mapId;



        if(existingMap)
        {
            mapId = existingMap.id;
        }
        else
        {

            const { data:newMap, error } =
                await supabase
                    .from("maps")
                    .insert({
                        slug: slug,
                        name: map.name
                    })
                    .select()
                    .single();


            if(error)
            {
                console.error(error);
                continue;
            }


            mapId = newMap.id;

        }



        // Import des étages

        for(const floor of map.floors)
        {

            const { error } =
                await supabase
                    .from("floors")
                    .upsert(
                    {
                        map_id: mapId,
                        floor: floor.id,
                        label: floor.label,
                        image: floor.image
                    },
                    {
                        onConflict:
                        "map_id,floor"
                    });


            if(error)
            {
                console.error(error);
            }

        }


    }


    console.log("Import des maps terminé !");
}



importMaps();
