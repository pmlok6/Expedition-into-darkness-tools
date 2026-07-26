const API =
"https://expeditionintodarkness.wiki.gg/api.php";



export async function invoke(
    module,
    functionName
)
{

    const params =
        new URLSearchParams({

            action: "expandtemplates",

            text:
            `{{#invoke:${module}|${functionName}}}`,

            prop: "wikitext",

            format: "json",

            origin: "*"

        });



    const response =
        await fetch(
            API + "?" + params.toString()
        );



    if(!response.ok)
    {
        throw new Error(
            "Wiki API error : " +
            response.status
        );
    }



    const data =
        await response.json();



    if(
        !data.expandtemplates ||
        !data.expandtemplates.wikitext
    )
    {
        throw new Error(
            "No data returned from wiki"
        );
    }



    try
    {

        return JSON.parse(
            data.expandtemplates.wikitext
        );

    }

    catch(error)
    {

        console.error(
            "JSON parsing error",
            data.expandtemplates.wikitext
        );


        throw error;

    }

}
