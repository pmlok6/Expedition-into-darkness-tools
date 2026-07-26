(function()
{

"use strict";


let WEAPON_ITEMS = {};

let WEAPON_RECIPES = {};



document.addEventListener(
"DOMContentLoaded",
function()
{

const root =
document.getElementById(
"weapon-calculator"
);


if(!root)
{
    return;
}


if(root.dataset.loaded)
{
    return;
}


root.dataset.loaded = "true";



Promise.all(
[

WikiAPI.get(
"items"
),

WikiAPI.get(
"recipes"
)

])


.then(function(result)
{


WEAPON_ITEMS = result[0];

WEAPON_RECIPES = result[1];


buildCalculator(
root,
WEAPON_ITEMS,
WEAPON_RECIPES
);


})


.catch(function(error)
{

console.error(
"Weapon Calculator error",
error
);

});


});





function buildCalculator(root,ITEMS,RECIPES)
{


WEAPON_ITEMS = ITEMS;

WEAPON_RECIPES = RECIPES;



const state =
{

left:
{
type:null,
components:{},
materials:{},
stats:{}
},


right:
{
type:null,
components:{},
materials:{},
stats:{}
}

};



window.weaponStates = state;



createWeaponPanel(
document.getElementById("weapon-left"),
"Weapon 1",
state.left
);



createWeaponPanel(
document.getElementById("weapon-right"),
"Weapon 2",
state.right
);



createWeaponType(
document.querySelector(
"#weapon-left .weapon-selection-box"
),
state.left
);



createWeaponType(
document.querySelector(
"#weapon-right .weapon-selection-box"
),
state.right
);


}





function createWeaponPanel(panel,title,state)
{


panel.innerHTML = `

<div class="weapon-box">


<h3>
${title}
</h3>


<div class="weapon-selection-box">


<div class="weapon-components">

</div>


<div class="weapon-materials">

</div>


</div>


</div>



<div class="weapon-box weapon-result-box">


<h3>
Result
</h3>


<div class="weapon-results">

</div>


</div>

`;

}





function createWeaponType(box,weaponState)
{


let selector =
createSelect(
"Weapon Type",
[
{
id:"blade",
name:"Blade Weapon"
},

{
id:"shaft",
name:"Shaft Weapon"
}
]
);



box.appendChild(
selector.wrapper
);



selector.select.onchange =
function()
{


weaponState.type =
selector.select.value;



weaponState.components = {};

weaponState.materials = {};



clearDynamic(box);



if(
weaponState.type === "blade"
)
{

buildBladeWeapon(
box,
weaponState
);

}



if(
weaponState.type === "shaft"
)
{

buildShaftWeapon(
box,
weaponState
);

}



};

}





function buildBladeWeapon(box,state)
{


createComponent(
box,
"Grip",
getItems("grip"),
function(item)
{


state.components.grip =
item.guid;



buildBladeSlots(
box,
item,
state
);


}

);


}





function buildBladeSlots(box,grip,state)
{


clearDynamic(box);



if(!grip.slots)
{
return;
}



grip.slots.forEach(
function(slot)
{


let tag =
slot
.toLowerCase()
.replaceAll(" ","_");



createComponent(
box,
slot,
getItems(tag),
function(item)
{


state.components[slot] =
item.guid;



createMaterial(
box,
item,
state
);



calculateWeapon(
state
);


}

);


});


}





function buildShaftWeapon(box,state)
{


createComponent(
box,
"Shaft",
getItems("shaft"),
function(item)
{


state.components.shaft =
item.guid;



buildShaftSlots(
box,
item,
state
);


}

);


}





function buildShaftSlots(box,shaft,state)
{


clearDynamic(box);



if(!shaft.slots)
{
return;
}



shaft.slots.forEach(
function(slot)
{


let tag =
slot
.toLowerCase()
.replaceAll(" ","_");



createComponent(
box,
slot,
getItems(tag),
function(item)
{


state.components[slot] =
item.guid;



createMaterial(
box,
item,
state
);



calculateWeapon(
state
);


}

);


});


}
  function createComponent(box,label,items,callback)
{


let selector =
createSelect(
label,
items.map(function(i)
{
return {
id:i.guid,
name:i.name
};
})
);



selector.wrapper.classList.add(
"dynamic"
);



box.querySelector(
".weapon-components"
)
.appendChild(
selector.wrapper
);



selector.select.onchange =
function()
{


let item =
findItem(
selector.select.value
);



if(item)
{
callback(item);
}


};


}





function createSelect(label,options)
{


let wrapper =
document.createElement(
"div"
);


wrapper.className =
"weapon-selector";



let labelNode =
document.createElement(
"label"
);


labelNode.textContent =
label;



let select =
document.createElement(
"select"
);



select.innerHTML =
"<option value=''>-- Select --</option>";



options.forEach(function(option)
{


let opt =
document.createElement(
"option"
);


opt.value =
option.id;


opt.textContent =
option.name;


select.appendChild(opt);


});



wrapper.appendChild(
labelNode
);


wrapper.appendChild(
select
);



return {

wrapper:wrapper,

select:select

};


}





function createMaterial(box,item,state)
{


let recipe =
findRecipe(
item.name
);



if(
!recipe ||
!recipe.allowed_materials
)
{
return;
}



let materials =
recipe.allowed_materials.map(
function(mat)
{

return {

id:mat,

name:formatMaterialName(mat)

};

});



let selector =
createSelect(
"Material",
materials
);



selector.wrapper.classList.add(
"dynamic"
);



box.querySelector(
".weapon-materials"
)
.appendChild(
selector.wrapper
);



selector.select.onchange =
function()
{


state.materials[item.guid] =
selector.select.value;



calculateWeapon(
state
);


};


}





function calculateWeapon(state)
{


let stats =
{

damage:0,

swinging_damage:0,

thrusting_damage:0,

base_damage:0,

cleave:0,

attack_speed:0,

attack_stamina_cost:0,

inertia:0,

weight:0,

magic:"none"

};



Object.values(
state.components
)
.forEach(function(id)
{


let item =
findItem(id);



if(item)
{


let materialTag =
state.materials[item.guid];



let material =
materialTag
?
findMaterial(materialTag)
:
null;



addStats(
stats,
item,
material
);


}


});



state.stats =
stats;



renderResult(
state
);



updateComparison();


}





function addStats(stats,item,material)
{


stats.weight +=
Number(
item.weight || 0
);



let base =
parseNumber(
item.base_damage
);



stats.base_damage +=
base;



let damage =
base;



if(
material &&
base > 0
)
{


let hardness =
parsePercent(
material.hardness
);



if(hardness)
{

damage *=
hardness / 100;

}


}



stats.damage +=
damage;



let swing =
parsePercent(
item.swinging_damage
);



let thrust =
parsePercent(
item.thrusting_damage
);



if(material)
{


let hardness =
parsePercent(
material.hardness
);



if(hardness)
{

swing *=
hardness / 100;


thrust *=
hardness / 100;

}


}



stats.swinging_damage +=
swing;



stats.thrusting_damage +=
thrust;



stats.cleave +=
parsePercent(
item.cleave
);



stats.attack_speed +=
parsePercent(
item.attack_speed
);



stats.attack_stamina_cost +=
parseNumber(
item.attack_stamina_cost
);



stats.inertia +=
parseNumber(
item.inertia
);


}





function findMaterial(tag)
{


return Object.values(
WEAPON_ITEMS
)
.find(function(item)
{


return item.tags &&
item.tags.includes(tag);


});


}





function findRecipe(name)
{


return Object.values(
WEAPON_RECIPES
)
.find(function(recipe)
{


return recipe.name === name;


});


}





function getItems(tag)
{


return Object.values(
WEAPON_ITEMS
)
.filter(function(item)
{


return item.tags &&
item.tags.includes(tag);


})
.sort(function(a,b)
{


return a.name.localeCompare(
b.name,
"en"
);


});


}





function findItem(id)
{

return WEAPON_ITEMS[id];

}





function clearDynamic(box)
{


let c =
box.querySelector(
".weapon-components"
);


let m =
box.querySelector(
".weapon-materials"
);



if(c)
{
c.innerHTML="";
}



if(m)
{
m.innerHTML="";
}


}





function renderResult(state)
{


let panels =
document.querySelectorAll(
".weapon-result-box"
);



let target;



if(
state === getState("left")
)
{

target =
panels[0].querySelector(
".weapon-results"
);

}
else
{

target =
panels[1].querySelector(
".weapon-results"
);

}



if(!target)
{
return;
}



let s =
state.stats;



target.innerHTML = `


<div class="weapon-stat">
<span>Damage</span>
<b>${s.damage.toFixed(1)}</b>
</div>


<div class="weapon-stat">
<span>Base Damage</span>
<b>${s.base_damage}</b>
</div>


<div class="weapon-stat">
<span>Swinging Damage</span>
<b>${formatPercent(s.swinging_damage)}</b>
</div>


<div class="weapon-stat">
<span>Thrusting Damage</span>
<b>${formatPercent(s.thrusting_damage)}</b>
</div>


<div class="weapon-stat">
<span>Cleave</span>
<b>${formatPercent(s.cleave)}</b>
</div>


<div class="weapon-stat">
<span>Attack Speed</span>
<b>${formatPercent(s.attack_speed)}</b>
</div>


<div class="weapon-stat">
<span>Stamina Cost</span>
<b>${s.attack_stamina_cost}</b>
</div>


<div class="weapon-stat">
<span>Weight</span>
<b>${s.weight.toFixed(2)}</b>
</div>


<div class="weapon-stat">
<span>Inertia</span>
<b>${s.inertia}</b>
</div>


`;


}





function updateComparison()
{


let box =
document.getElementById(
"weapon-comparison"
);



if(!box)
{
return;
}



let left =
getState("left");


let right =
getState("right");



if(
!left ||
!right ||
!left.stats ||
!right.stats
)
{

box.innerHTML =
"<h3>Comparison</h3>";

return;

}



let stats =
[

["damage","Damage"],

["base_damage","Base Damage"],

["swinging_damage","Swinging Damage"],

["thrusting_damage","Thrusting Damage"],

["cleave","Cleave"],

["attack_speed","Attack Speed"],

["attack_stamina_cost","Stamina Cost"],

["weight","Weight"],

["inertia","Inertia"]

];



let html =
"<h3>Comparison</h3>";



stats.forEach(function(stat)
{


let a =
left.stats[stat[0]] || 0;


let b =
right.stats[stat[0]] || 0;



html += `

<div class="compare-row">

<span>
${stat[1]}
</span>


<span class="${compareClass(a,b,stat[0])}">
${formatValue(a)}
</span>


<span class="${compareClass(b,a,stat[0])}">
${formatValue(b)}
</span>


</div>

`;


});



box.innerHTML =
html;


}





function compareClass(a,b,stat)
{


if(a===b)
{
return "compare-equal";
}



let lower =
[
"attack_stamina_cost",
"weight",
"inertia"
];



if(
lower.includes(stat)
)
{

return a < b
?
"compare-better"
:
"compare-worse";

}



return a>b
?
"compare-better"
:
"compare-worse";


}





function parsePercent(value)
{


if(!value)
{
return 0;
}


return parseFloat(
String(value)
.replace("+","")
.replace("%","")
.replace(",",".")
)
||0;


}





function parseNumber(value)
{


if(!value)
{
return 0;
}



return parseFloat(
String(value)
.replace("+","")
.replace("%","")
.replace("s","")
.replace(",",".")
)
||0;


}





function formatPercent(v)
{

return (
v>0 ? "+" : ""
)
+
v.toFixed(1)
+
"%";

}





function formatValue(v)
{


return typeof v === "number"
?
v.toFixed(2)
:
v;


}





function formatMaterialName(v)
{


return v
.replaceAll("_"," ")
.replace(/\b\w/g,function(c)
{
return c.toUpperCase();
});


}





function getState(side)
{


return window.weaponStates
?
window.weaponStates[side]
:
null;


}



})();
