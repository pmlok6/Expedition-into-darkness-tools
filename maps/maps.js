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
const markerMenu=document.getElementById("marker-menu");

let MAPS=[];
let currentMap=null;
let currentFloor=null;
let currentUser=null;
let pendingMarker=null;

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

    const floor=map.floors.find(f=>f.floor===0);

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
// ===============================
// Marker functions
// ===============================

function openMarkerMenu(x,y)
{
    pendingMarker={x:x,y:y};

    markerMenu.style.left=x+"%";
    markerMenu.style.top=y+"%";

    markerMenu.classList.remove("hidden");
}

document
.getElementById("map-container")
.addEventListener("click",event=>
{
    if(event.target.closest(".marker-popup"))
        return;

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

    if(event.target.closest("#marker-menu"))
        return;


    document
    .querySelectorAll(".map-marker")
    .forEach(marker=>marker.classList.remove("active"));
    markerMenu.classList.add("hidden");

    const rect=mapLayer.getBoundingClientRect();

    const x=((event.clientX-rect.left)/rect.width)*100;
    const y=((event.clientY-rect.top)/rect.height)*100;

    console.log("Position:",x.toFixed(2),"%",y.toFixed(2),"%");
    openMarkerMenu(x,y);
});


if(markerMenu)
{
    markerMenu
    .querySelectorAll("button")
    .forEach(button=>
    {
        button.onclick=async event=>
        {
            event.stopPropagation();

            await saveMarker(button.dataset.type);

            document
            .getElementById("marker-description")
            .value="";

            markerMenu.classList.add("hidden");
        };
    });
}


async function saveMarker(type)
{
    const {data:{user},error:userError}=await supabase.auth.getUser();

    if(userError||!user)
    {
        console.error("No user connected");
        return;
    }


    const markerData=
    {
        floor_id:currentFloor.id,
        x:pendingMarker.x,
        y:pendingMarker.y,
        type:type,
        title:type,
        description:document.getElementById("marker-description").value,
        created_by:user.id
    };


    const {error}=await supabase
    .from("markers")
    .insert(markerData);


    if(error)
    {
        console.error("Marker creation error:",error);
        return;
    }


    await loadMarkers();
}


function createMarker(marker)
{
    const upVotes=marker.marker_votes?.filter(v=>v.vote).length??0;
    const downVotes=marker.marker_votes?.filter(v=>!v.vote).length??0;

    const userVote=marker.marker_votes?.find(v=>
        currentUser&&v.user_id===currentUser.id
    );

    const element=document.createElement("div");

    element.className="map-marker";
    element.dataset.id=marker.id;
    element.dataset.type=marker.type;

    element.style.left=marker.x+"%";
    element.style.top=marker.y+"%";

    element.innerHTML=`
    ${getMarkerIcon(marker.type)}
    <div class="marker-popup">
        <div class="marker-title">${marker.title}</div>

        <div class="marker-description">
            ${marker.description??"No description"}
        </div>

        <div class="marker-floor">
            Floor ${currentFloor.floor}
        </div>

        <div class="marker-votes">
            <button class="vote-up ${userVote?.vote===true?"active":""}">
                👍 ${upVotes}
            </button>

            <button class="vote-down ${userVote?.vote===false?"active":""}">
                👎 ${downVotes}
            </button>
        </div>

        ${
        currentUser&&currentUser.id===marker.created_by?
        `<div class="marker-actions">
            <button class="edit-marker">✏ Edit</button>
            <button class="delete-marker">🗑 Delete</button>
        </div>`
        :""
        }
    </div>`;

    element.onclick=event=>
    {
        event.stopPropagation();

        document
        .querySelectorAll(".map-marker")
        .forEach(marker=>marker.classList.remove("active"));

        markerMenu.classList.add("hidden");

        element.classList.add("active");
    };

    element
    .querySelector(".vote-up")
    ?.addEventListener("click",async event=>
    {
        event.stopPropagation();
        event.preventDefault();

        await voteMarker(marker.id,true);
    });

    element
    .querySelector(".vote-down")
    ?.addEventListener("click",async event=>
    {
        event.stopPropagation();
        event.preventDefault();

        await voteMarker(marker.id,false);
    });

    element
    .querySelector(".edit-marker")
    ?.addEventListener("click",event=>
    {
        event.stopPropagation();
        event.preventDefault();

        openActionModal(
        "Edit marker",
        `<textarea id="edit-description">${marker.description??""}</textarea>`,
        async()=>
        {
            const description=document
            .getElementById("edit-description")
            .value;

            const {error}=await supabase
            .from("markers")
            .update({
                description:description
            })
            .eq("id",marker.id);

            if(error)
            {
                console.error("Edit error:",error);
                return;
            }

            await loadMarkers();
        });
    });

    element
    .querySelector(".delete-marker")
    ?.addEventListener("click",async event=>
    {
        event.stopPropagation();
        event.preventDefault();

        await deleteMarker(marker.id);
    });

    mapLayer.appendChild(element);
}
   
function getMarkerIcon(type)
{
    switch(type)
    {
        case "chest":
            return `<img src="../assets/icons/${type}.png" alt="${type}">`;

        case "elevator":
            return "🛗";

        case "npc":
            return "👤";

        case "monster":
            return "👹";

        case "resource":
            return "🌿";

        default:
            return "📍";
    }
}
async function voteMarker(markerId,vote)
{
    const {data:{user}}=await supabase.auth.getUser();

    if(!user)
    {
        console.error("No user connected");
        return;
    }

    const {error}=await supabase
    .from("marker_votes")
    .upsert(
    {
        marker_id:markerId,
        user_id:user.id,
        vote:vote
    },
    {
        onConflict:"marker_id,user_id"
    });

    if(error)
    {
        console.error("Vote error:",error);
        return;
    }

    await loadMarkers();
}

async function deleteMarker(id)
{
    openActionModal(
    "Delete marker?",
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

        console.log("Marker deleted:",id);
    });
}


async function loadMarkers()
{
    document
    .querySelectorAll(".map-marker")
    .forEach(marker=>marker.remove());

    if(!currentFloor)
        return;

    const {data,error}=await supabase
    .from("markers")
    .select(`
        *,
        marker_votes(vote,user_id)
    `)
    .eq("floor_id",currentFloor.id);

    if(error)
    {
        console.error("Load markers error:",error);
        return;
    }

    data.forEach(marker=>createMarker(marker));
}


// ===============================
// User functions
// ===============================

async function getCurrentUser()
{
    const {data}=await supabase.auth.getSession();

    currentUser=data.session?.user??null;

    console.log(
        "Current user:",
        currentUser
    );
}

function openActionModal(title,content,callback)
{
    actionTitle.textContent=title;
    actionContent.innerHTML=content;

    actionModal.classList.remove("hidden");


    actionConfirm.onclick=async()=>
    {
        await callback();
        actionModal.classList.add("hidden");
    };


    actionCancel.onclick=()=>
    {
        actionModal.classList.add("hidden");
    };
}
// ===============================
// Start
// ===============================

document.addEventListener("DOMContentLoaded",async()=>
{
    await getCurrentUser();

    MAPS=await getMaps();

    console.log(
        "Maps loaded:",
        MAPS
    );


    if(MAPS.length===0)
    {
        console.warn("No maps found");
        return;
    }


    createMapButtons();

    await loadMap(MAPS[0]);
});
