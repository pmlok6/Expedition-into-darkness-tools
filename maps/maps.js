/* ==========================================
   Maps Viewer

   Source:
   Supabase

   Features:
   - Load maps
   - Generate map buttons
   - Generate elevator
   - Display floors
   - Manage markers
========================================== */
import {getMaps} from "../js/mapsloader.js";
import {supabase} from "../js/supabase.js";

const actionModal=document.getElementById("action-modal");
const actionTitle=document.getElementById("action-title");
const actionContent=document.getElementById("action-content");
const actionConfirm=document.getElementById("action-confirm");
const actionCancel=document.getElementById("action-cancel");

const mapLayer=document.getElementById("map-layer");
const selector=document.getElementById("map-selector");
const image=document.getElementById("map-image");
const elevator=document.getElementById("map-elevator");
const legend=document.getElementById("map-legend");

let MAPS=[];
let currentMap=null;
let currentFloor=null;
let currentUser=null;
let pendingMarker=null;
let markerWizardStep=null;
let selectedMarkerType=null;
let selectedMarkerCategory=null;
let selectedRotation=0;

let communityReview=false;

let filters={
    door:true,
    rope:true,
    door_need_key:true,
    entrance_exit_door:true,
    entrance_exit_elevator:true,
    exit_door:true,
    exit_elevator:true,
    exit_rope:true,
    harrow:true,
    lever:true,
    button:true,
    boss:true,
    big_mob_spawn:true,
    chest:true,
    body:true,
    armor_stand:true
};

const markerCategories={
    access:[
        "door",
        "door_need_key",
        "entrance_exit_door",
        "exit_door",
        "entrance_exit_elevator",
        "exit_elevator",
        "harrow"
    ],

    interactable:[
        "rope",
        "exit_rope",
        "lever",
        "button"
    ],

    loot:[
        "chest",
        "body",
        "armor_stand"
    ],

    creatures:[
        "boss",
        "big_mob_spawn"
    ]
};

const ROTATABLE=[
    "door",
    "door_need_key",
    "entrance_exit_door",
    "exit_door",
    "harrow",
    "lever"
];
// ===============================
// Map functions
// ===============================

function createMapButtons()
{
    selector.innerHTML="";

    MAPS.forEach(map=>
    {
        const button=document.createElement("button");

        button.className="map-button";
        button.textContent=map.name;
        button.onclick=()=>loadMap(map);

        selector.appendChild(button);
    });
}

async function loadMap(map)
{
    currentMap=map;


    createElevator(map);


    createLegend();


    const floor=map.floors.find(
        f=>f.floor===0
    );


    if(floor)
    {
        currentFloor=floor;

        image.src=floor.image;

        await loadMarkers();
    }
}

function createElevator(map)
{
    elevator.innerHTML="";

    [...map.floors]
    .sort((a,b)=>b.floor-a.floor)
    .forEach(floor=>
    {
        const button=document.createElement("button");

        button.className="floor-button";
        button.textContent=floor.label;

        button.onclick=async()=>
        {
            currentFloor=floor;
            image.src=floor.image;

            await loadMarkers();
        };

        elevator.appendChild(button);
    });
}

function createLegend()
{
    if(!legend)
        return;
    legend.innerHTML="";
    const title=document.createElement("h3");
    title.textContent="Legend";
    legend.appendChild(title);
    Object.keys(filters)
    .forEach(type=>
    {
        const label=document.createElement("label");
        const checkbox=document.createElement("input");
        checkbox.type="checkbox";
        checkbox.checked=filters[type];
        checkbox.onchange=()=>
        {
            filters[type]=checkbox.checked;
            applyMarkerFilters();
        };
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(formatMarkerName(type)));
        const icon=document.createElement("span");
        icon.innerHTML=getMarkerIcon(type);
        label.appendChild(icon);
        legend.appendChild(label);
    });


    if(currentUser)
    {
        const separator=document.createElement("hr");
        legend.appendChild(separator);
        const label=document.createElement("label");
        const checkbox=document.createElement("input");
        checkbox.type="checkbox";
        checkbox.checked=communityReview;
        checkbox.onchange=async()=>
        {
            communityReview=checkbox.checked;
            await loadMarkers();
        };
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" Community review"));
        legend.appendChild(label);
    }
}

document
.getElementById("map-container")
.addEventListener("click",event=>
{
    // Clic sur une popup → ne rien faire
    if(event.target.closest(".marker-popup"))
        return;

    // Clic sur un marker → l'activer
    if(event.target.closest(".map-marker"))
    {
        document
        .querySelectorAll(".map-marker")
        .forEach(marker=>marker.classList.remove("active"));

        event.target
        .closest(".map-marker")
        .classList.add("active");

        return;
    }

    // Fermer les autres popups
    document
    .querySelectorAll(".map-marker")
    .forEach(marker=>marker.classList.remove("active"));

    const rect=mapLayer.getBoundingClientRect();

    const x=((event.clientX-rect.left)/rect.width)*100;
    const y=((event.clientY-rect.top)/rect.height)*100;

    console.log(
        "Position:",
        x.toFixed(2),
        "%",
        y.toFixed(2),
        "%"
    );

    if(!currentUser)
    {
        alert("You need an account to add markers");
        return;
    }

    pendingMarker={
        x:x,
        y:y
    };

    openMarkerWizard();
});

   function showMarkerTypes(category)
{
    markerWizardStep="type";


    actionTitle.textContent=
        category
        .charAt(0)
        .toUpperCase()
        +
        category.slice(1);


    actionContent.innerHTML="";


    markerCategories[category]
    .forEach(type=>
    {
        const button=document.createElement("button");

        button.className="marker-type-button";

        button.innerHTML=
        `
        ${getMarkerIcon(type)}
        ${formatMarkerName(type)}
        `;


        button.onclick=()=>
        {
            selectedMarkerType=type;

            showMarkerForm(type);
        };


        actionContent.appendChild(button);
    });


    actionCancel.onclick=()=>
    {
        openMarkerWizard();
    };
}

   function showMarkerForm(type)
{
    markerWizardStep="form";

    actionTitle.textContent=
        type
        .replaceAll("_"," ")
        .replace(/\b\w/g,l=>l.toUpperCase());

    actionContent.innerHTML=
    `
    <label>Description</label>

    <textarea
        id="marker-description"
        placeholder="Add a description..."
    ></textarea>
    `;

    if(ROTATABLE.includes(type))
    {
        actionContent.innerHTML+=
        `
        <br>

        <label>Rotation</label>

        <div class="rotation-selector">

            <button class="rotation-button" data-rotation="0">
                0°
            </button>

            <button class="rotation-button" data-rotation="90">
                90°
            </button>

            <button class="rotation-button" data-rotation="180">
                180°
            </button>

            <button class="rotation-button" data-rotation="270">
                270°
            </button>

        </div>
        `;

        document
        .querySelectorAll(".rotation-button")
        .forEach(button=>
        {
            button.onclick=()=>
            {
                selectedRotation=
                Number(button.dataset.rotation);

                document
                .querySelectorAll(".rotation-button")
                .forEach(b=>b.classList.remove("active"));

                button.classList.add("active");
            };
        });

        selectedRotation=0;
    }

    actionCancel.onclick=()=>
    {
        showMarkerTypes(selectedMarkerCategory);
    };

    actionConfirm.onclick=async()=>
    {
        await saveMarker(type);
    };
}
async function saveMarker(type)
{
    const {data:{user},error:userError}=await supabase.auth.getUser();

    if(userError||!user)
    {
        console.error("No user connected");
        return;
    }

    if(!pendingMarker||!currentFloor)
    {
        console.error("No marker position or floor selected");
        return;
    }

    const descriptionInput=document.getElementById("marker-description");

    const markerData=
    {
        floor_id:currentFloor.id,

        x:pendingMarker.x,

        y:pendingMarker.y,

        type:type,

        title:type,

        description:
            descriptionInput
            ?
            descriptionInput.value
            :
            "",

        rotation:selectedRotation,

        created_by:user.id,

        approved:false,

        up_votes:0,

        down_votes:0
    };

    const {error}=await supabase
    .from("markers")
    .insert(markerData);

    if(error)
    {
        console.error("Marker creation error:",error);
        return;
    }

    pendingMarker=null;

    selectedMarkerCategory=null;
    selectedMarkerType=null;
    selectedRotation=0;

    actionModal.classList.add("hidden");

    await loadMarkers();
}

function createMarker(marker)
{
    const element=document.createElement("div");

    element.className="map-marker";


    if(!marker.approved)
    {
        element.classList.add("pending");
    }


    element.dataset.id=marker.id;
    element.dataset.type=marker.type;


    element.style.left=marker.x+"%";
    element.style.top=marker.y+"%";

   element.style.transform=
`
translate(-50%,-50%)
rotate(${marker.rotation || 0}deg)
`;

    const votes=marker.marker_votes??[];

    const upVotes=votes.filter(
        vote=>vote.vote===1
    ).length;

    const downVotes=votes.filter(
        vote=>vote.vote===-1
    ).length;


    element.innerHTML=`
    <div class="marker-icon">${getMarkerIcon(marker.type)}</div>
    <div class="marker-popup">

        <div class="marker-title">
            ${marker.title}
        </div>

        <div class="marker-description">
            ${marker.description??"No description"}
        </div>

        <div class="marker-floor">
            Floor ${currentFloor.floor}
        </div>

        ${
            !marker.approved?`
            <div class="marker-status">
                ⏳ Pending review
            </div>

            ${
            communityReview?`
            <div class="marker-votes">
                👍 ${upVotes}
                👎 ${downVotes}
            </div>
            <div class="vote-actions">
                <button class="vote-up">👍</button>
                <button class="vote-down">👎</button>
            </div>`:""
            }`:""
         }
        ${
        currentUser&&currentUser.id===marker.created_by?
        `
        <div class="marker-actions">

            <button class="edit-marker">
                ✏ Edit
            </button>

            <button class="delete-marker">
                🗑 Delete
            </button>

        </div>
        `
        :""
        }

    </div>`;


    element
    .querySelector(".delete-marker")
    ?.addEventListener(
        "click",
        async event=>
        {
            event.stopPropagation();
            event.preventDefault();

            await deleteMarker(marker.id);
        }
    );


    element
    .querySelector(".edit-marker")
    ?.addEventListener(
        "click",
        async event=>
        {
            event.stopPropagation();
            event.preventDefault();

            openActionModal(
                "Edit marker",
                `
                <textarea id="edit-description">
                ${marker.description??""}
                </textarea>
                `,
                async()=>
                {
                    const description=
                    document
                    .getElementById("edit-description")
                    .value;


                    const {error}=await supabase
                    .from("markers")
                    .update({
                        description:description
                    })
                    .eq(
                        "id",
                        marker.id
                    );


                    if(error)
                    {
                        console.error(
                            "Edit error:",
                            error
                        );

                        return;
                    }


                    await loadMarkers();
                }
            );
        }
    );


    element
    .querySelector(".vote-up")
    ?.addEventListener(
        "click",
        async event=>
        {
            event.stopPropagation();

            await voteMarker(
                marker.id,
                1
            );
        }
    );


    element
    .querySelector(".vote-down")
    ?.addEventListener(
        "click",
        async event=>
        {
            event.stopPropagation();

            await voteMarker(
                marker.id,
                -1
            );
        }
    );


    mapLayer.appendChild(element);
}

function applyMarkerFilters()
{
    document
    .querySelectorAll(".map-marker")
    .forEach(marker=>
    {
        const type=marker.dataset.type;


        const typeVisible=
        filters[type]!==false;


        let visible=true;


        if(!typeVisible)
        {
            visible=false;
        }


        if(communityReview)
        {
            if(!marker.classList.contains("pending"))
            {
                visible=false;
            }
        }
        else
        {
            if(marker.classList.contains("pending"))
            {
                visible=false;
            }
        }


        marker.style.display=
        visible
        ?
        "block"
        :
        "none";
    });
}

function getMarkerIcon(type)
{
    return `<img src="../assets/icons/${type}.png" alt="${type}">`;
}

function formatMarkerName(type)
{
    const names={
        door:"Door",
        rope:"Rope",
        door_need_key:"Door Need Key",
        entrance_exit_door:"Entrance / Exit Door",
        entrance_exit_elevator:"Entrance / Exit Elevator",
        exit_door:"Exit Door",
        exit_elevator:"Exit Elevator",
        exit_rope:"Exit Rope",
        harrow:"Harrow",
        lever:"Lever",
        button:"Button",
        boss:"Boss",
        big_mob_spawn:"Big Mob Spawn",
        chest:"Chest",
        body:"Body",
        armor_stand:"Armor Stand"
    };
    return names[type]||type;
}

async function voteMarker(markerId,vote)
{
    const {data:{user},error:userError}=await supabase.auth.getUser();

    if(userError||!user)
        return;


    const {data:existingVote,error:voteError}=await supabase
    .from("marker_votes")
    .select("id,vote")
    .eq("marker_id",markerId)
    .eq("user_id",user.id)
    .maybeSingle();


    if(voteError)
    {
        console.error("Vote check error:",voteError);
        return;
    }


    let error;


    if(existingVote)
    {
        if(existingVote.vote===vote)
        {
            error=(await supabase
            .from("marker_votes")
            .delete()
            .eq("id",existingVote.id)).error;
        }
        else
        {
            error=(await supabase
            .from("marker_votes")
            .update({vote:vote})
            .eq("id",existingVote.id)).error;
        }
    }
    else
    {
        error=(await supabase
        .from("marker_votes")
        .insert({
            marker_id:markerId,
            user_id:user.id,
            vote:vote
        })).error;
    }


    if(error)
    {
        console.error("Vote error:",error);
        return;
    }


    const {data:votes}=await supabase
    .from("marker_votes")
    .select("vote")
    .eq("marker_id",markerId);


    const score=votes.reduce(
        (total,item)=>total+item.vote,
        0
    );


    if(score>=5)
    {
        await supabase
        .from("markers")
        .update({
            approved:true
        })
        .eq("id",markerId);
    }


    await loadMarkers();
}

async function deleteMarker(id)
{
    openActionModal(
        "Delete marker",
        "Are you sure you want to delete this marker?",
        async()=>
        {
            const {error}=await supabase
            .from("markers")
            .delete()
            .eq("id",id);


            if(error)
            {
                console.error("Delete error:",error);
                return;
            }


            document
            .querySelector(`.map-marker[data-id="${id}"]`)
            ?.remove();


            document
            .querySelectorAll(".map-marker")
            .forEach(marker=>
                marker.classList.remove("active")
            );
            actionModal.classList.add("hidden");
            console.log("Marker deleted:",id);
        }
    );
}

async function loadMarkers()
{
    document
    .querySelectorAll(".map-marker")
    .forEach(marker=>marker.remove());


    if(!currentFloor)
        return;


    let query=supabase
    .from("markers")
    .select("*")
    .eq(
        "floor_id",
        currentFloor.id
    );


    if(communityReview)
    {
        query=query.eq(
            "approved",
            false
        );
    }
    else
    {
        query=query.eq(
            "approved",
            true
        );
    }


    const {data:markers,error}=await query;


    if(error)
    {
        console.error(
            "Load markers error:",
            error
        );

        return;
    }


    for(const marker of markers)
    {
        const {data:votes,error:voteError}=await supabase
        .from("marker_votes")
        .select("user_id,vote")
        .eq(
            "marker_id",
            marker.id
        );


        if(voteError)
        {
            console.error(
                "Load votes error:",
                voteError
            );
        }
        else
        {
            marker.marker_votes=votes;
        }


        createMarker(marker);
    }


    applyMarkerFilters();
}
// ===============================
// User functions
// ===============================

async function getCurrentUser()
{
    const {data,error}=await supabase
    .auth
    .getSession();
    if(error)
    {
        console.error("Session error:",error);
        currentUser=null;
    }
    else
    {
        currentUser=
        data.session?.user??null;
    }
    console.log("Current user:",currentUser);
    if(legend)
    {
        createLegend();
    }
}
function listenAuthChanges()
{
    supabase.auth.onAuthStateChange(
    async(_,session)=>
    {
        currentUser=session?.user??null;

        if(!currentUser)
            communityReview=false;

        createLegend();

        await loadMarkers();
    });
}

function openActionModal(title,content,callback)
{
    actionTitle.textContent=title;

    actionContent.innerHTML=content;

    actionModal.classList.remove("hidden");


    actionConfirm.onclick=async()=>
    {
        actionConfirm.disabled=true;

        try
        {
            await callback();
        }
        catch(error)
        {
            console.error("Action error:",error);
        }

        actionConfirm.disabled=false;

        actionModal.classList.add("hidden");
    };


    actionCancel.onclick=()=>
    {
        actionModal.classList.add("hidden");
    };
}

function openMarkerWizard()
{
    markerWizardStep="category";


    actionTitle.textContent="Add Marker";


    actionContent.innerHTML=
    `
    <button class="category-button" data-category="access">
        🚪 Access
    </button>

    <button class="category-button" data-category="interactable">
        ⚙️ Interactable
    </button>

    <button class="category-button" data-category="loot">
        📦 Loot
    </button>

    <button class="category-button" data-category="creatures">
        👹 Creatures
    </button>
    `;


    actionModal.classList.remove("hidden");


    document
    .querySelectorAll(".category-button")
    .forEach(button=>
    {
        button.onclick=()=>
{
    selectedMarkerCategory =
        button.dataset.category;


    console.log(
        "Category selected:",
        selectedMarkerCategory
    );


    actionTitle.textContent =
        "Selected : " + selectedMarkerCategory;


    actionContent.innerHTML =
    `
    <p>
        Category loaded
    </p>
    `;
};
    });


    actionCancel.onclick=()=>
{
    actionModal.classList.add("hidden");

    pendingMarker=null;
};
}
// ===============================
// Start
// ===============================
document.addEventListener("DOMContentLoaded",async()=>
{
    await getCurrentUser();
    listenAuthChanges();
    createLegend();
    MAPS=await getMaps();
    if(MAPS.length===0)
    {
        console.warn("No maps found");
        return;
    }   
    createMapButtons();
    await loadMap(MAPS[0]);
});
