import MAPS from "../data/mapsData.js";

const params=new URLSearchParams(location.search);
const mapId=params.get("map")||Object.keys(MAPS)[0];

const map=MAPS[mapId];

const elevator=document.getElementById("map-elevator");
const image=document.getElementById("map-image");

if(!map||!elevator||!image)
{
    throw new Error("Invalid map.");
}

let currentFloor=0;

if(map.floors.some(f=>f.id===0))
{
    currentFloor=0;
}
else
{
    currentFloor=map.floors[0].id;
}

function setFloor(id)
{
    const floor=map.floors.find(f=>f.id===id);

    if(!floor)
    {
        return;
    }

    currentFloor=id;

    image.src=floor.image;
    image.alt=`${map.name} Floor ${floor.label}`;

    elevator
        .querySelectorAll(".floor-button")
        .forEach(button=>
        {
            button.classList.toggle(
                "active",
                Number(button.dataset.floor)===id
            );
        });
}

function createElevator()
{
    elevator.innerHTML="";

    [...map.floors]
        .sort((a,b)=>b.id-a.id)
        .forEach(floor=>
        {
            const button=document.createElement("button");

            button.className="floor-button";
            button.dataset.floor=floor.id;
            button.textContent=floor.label;

            button.addEventListener(
                "click",
                ()=>setFloor(floor.id)
            );

            elevator.appendChild(button);
        });
}

createElevator();
setFloor(currentFloor);
