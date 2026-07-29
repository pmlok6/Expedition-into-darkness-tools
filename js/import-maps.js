import MAPS from "../data/mapsdata.js";
import { supabase } from "./supabase.js";


async function importMaps()
{
    let mapCount = 0;
    let floorCount = 0;


    for (const [slug, map] of Object.entries(MAPS))
    {

        // =========================
        // MAP
        // =========================

        const { data: mapData, error: mapError } =
            await supabase
                .from("maps")
                .upsert(
                {
                    slug: slug,
                    name: map.name,
                    updated_at: new Date()
                },
                {
                    onConflict: "slug"
                })
                .select()
                .single();



        if(mapError)
        {
            console.error(
                "Erreur map:",
                slug,
                mapError
            );

            continue;
        }


        mapCount++;


        const mapId = mapData.id;



        // =========================
        // FLOORS
        // =========================

        const floorIds = [];


        for(const floor of map.floors)
        {

            const { data: floorData, error: floorError } =
                await supabase
                    .from("floors")
                    .upsert(
                    {
                        map_id: mapId,
                        floor: floor.id,
                        label: floor.label,
                        image: floor.image,
                        updated_at: new Date()
                    },
                    {
                        onConflict:
                        "map_id,floor"
                    })
                    .select()
                    .single();



            if(floorError)
            {
                console.error(
                    "Erreur floor:",
                    floor,
                    floorError
                );

                continue;
            }


            floorCount++;

            floorIds.push(floorData.id);

        }



        // =========================
        // NETTOYAGE
        // Supprime les vieux floors
        // =========================

        const { error: deleteError } =
            await supabase
                .from("floors")
                .delete()
                .eq("map_id", mapId)
                .not(
                    "id",
                    "in",
                    `(${floorIds.join(",")})`
                );


        if(deleteError)
        {
            console.warn(
                "Nettoyage impossible:",
                deleteError
            );
        }


    }



    console.log(
        "===================="
    );

    console.log(
        "Import terminé"
    );

    console.log(
        "Maps:",
        mapCount
    );

    console.log(
        "Floors:",
        floorCount
    );

    console.log(
        "===================="
    );
}



importMaps();
