import { invoke } from "../js/wiki-api.js";

"use strict";

let WEAPON_ITEMS = {};
let WEAPON_RECIPES = {};

document.addEventListener("DOMContentLoaded",function()
{
	const root =document.getElementById("weapon-calculator");
	if(!root)
	{
    	return;
	}
	Promise.all([invoke("WeaponCalculatorData","items"),invoke("WeaponCalculatorData","recipes")]).then(function(result)
	{
		WEAPON_ITEMS = result[0];
		WEAPON_RECIPES = result[1];
		buildCalculator(root,WEAPON_ITEMS,WEAPON_RECIPES);
	})
	.catch(function(error)
	{
		console.error("Weapon Calculator loading error",error);
	});
});
function buildCalculator(root,ITEMS,RECIPES)
{
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
	createWeaponPanel(document.getElementById("weapon-left"),"Weapon 1",state.left);
	createWeaponPanel(document.getElementById("weapon-right"),"Weapon 2",state.right);
	createWeaponType(document.querySelector("#weapon-left .weapon-selection-box"),state.left);
	createWeaponType(document.querySelector("#weapon-right .weapon-selection-box"),state.right);
}

function createWeaponPanel(panel,title,state)
{
	panel.innerHTML = `<div class="weapon-box">
		<h3>${title}</h3>
		<div class="weapon-selection-box">
			<div class="weapon-components"></div>
			<div class="weapon-materials"></div>
		</div>
	</div>
	<div class="weapon-box weapon-result-box">
		<h3>Result</h3>
		<div class="weapon-results"></div>
	</div>`;
}

function createWeaponType(box,state)
{
	const selector =createSelect("Weapon Type",[
	{
		id:"blade",
		name:"Blade Weapon"
	},
	{
		id:"shaft",
		name:"Shaft Weapon"
	}
	]);
	box.appendChild(selector.wrapper);
	selector.select.onchange =function()
	{
		state.type =selector.select.value;
		state.components = {};
		state.materials = {};
		state.stats = {};
		clearDynamic(box);
		if(state.type === "blade")
		{
			buildBladeWeapon(box.closest(".weapon-box"),state);
		}
		if(state.type === "shaft")
		{	
			buildShaftWeapon(box.closest(".weapon-box"),state);
		}
	};
}

function buildBladeWeapon(box,weaponState)
{
	createComponent(box,"Grip",	getItems("grip"),
		function(item)
		{
			weaponState.components.grip = item.guid;
			buildBladeSlots(box,item,weaponState);
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
		const tag =
		slot
		.toLowerCase()
		.replaceAll(" ","_");
		createComponent(box,slot,
		getItems(tag),
		function(item,row)
		{
			state.components[slot] =item.guid;
			createMaterial(row,item,state);
			calculateWeapon(state);
			row.appendChild(materialSelector.wrapper);
		});
	});
}

function buildShaftWeapon(box,weaponState)
{
	createComponent(box,"Shaft",
	getItems("shaft"),
	function(item)
	{
			weaponState.components.shaft = item.guid;
			buildShaftSlots(box,item,weaponState);
	});
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
		const tag = slot.toLowerCase().replaceAll(" ","_");
		createComponent(box,slot,getItems(tag),
		function(item,row)
		{
			state.components[slot] =item.guid;
			createMaterial(row,item,state);
			calculateWeapon(state);
		});
	});
	function createComponent(box,label,items,callback)
	{
		const row = document.createElement("div");
		row.className ="weapon-component-row";
		const selector =createSelect(label,items.map(function(item)
		{
			return{
				id:item.guid,
				name:item.name
			};
		}));
		selector.wrapper.classList.add(	"dynamic");
		row.appendChild(selector.wrapper);
		let container =box.querySelector(".weapon-components");
		container.appendChild(row);
		selector.select.onchange = function()
		{
			const item =findItem(selector.select.value);
			if(item)
			{
				callback(item,row);
			}
		};
	}	
	function createSelect(label,options)
	{
		const wrapper =	document.createElement("div");
		wrapper.className ="weapon-selector";
		const labelNode =document.createElement("label");
		labelNode.textContent =label;
		const select =document.createElement("select");
		select.innerHTML =`<option value="">-- Select --</option>`;
		options.forEach(function(option)
		{
			const opt =document.createElement("option");
			opt.value =option.id;
			opt.textContent =option.name;
			select.appendChild(opt);
		});
		wrapper.appendChild(labelNode);
		wrapper.appendChild(select);
		return 
		{
			wrapper:wrapper,select:select
		};
	}
	function createMaterial(box,item,state)
	{
		const recipe =findRecipe(item.name);
		if(!recipe ||!recipe.allowed_materials)
		{
			return;
		}
		const materials =recipe.allowed_materials.map(function(material)
		{
			return 
			{
				id:material,name:formatMaterialName(material)
			};
		});
		const selector =createSelect("Material",materials);
		selector.wrapper.classList.add("dynamic");
		box.querySelector(".weapon-materials").appendChild(selector.wrapper);
		selector.select.onchange =
		function()
		{
			state.materials[item.guid] =selector.select.value;
			calculateWeapon(state);
		};
	}
	function calculateWeapon(state)
	{
		const stats =
		{
			damage:0,
			base_damage:0,
			swinging_damage:0,
			thrusting_damage:0,
			cleave:0,
			attack_speed:0,
			attack_stamina_cost:0,
			inertia:0,
			weight:0,
			magic:"none"
		};
		Object.values(state.components).forEach(function(id)
		{
			const item =findItem(id);
			if(!item)
			{
				return;
			}
			const materialTag =state.materials[item.guid];
			const material =materialTag?findMaterial(materialTag):null;
			addStats(stats,item,material);
		});
		state.stats =stats;
		renderResult(state);
		updateComparison();
	}
	function addStats(stats,item,material)
	{
		stats.weight +=
		Number(item.weight || 0);
		const base =parseNumber(item.base_damage);
		stats.base_damage +=base;
		let damage =base;
		if(material &&base)
		{
			const hardness =parsePercent(material.hardness);
			if(hardness)
			{
				damage *=hardness / 100;
			}
		}
		stats.damage +=damage;
		let swing =parsePercent(item.swinging_damage);
		let thrust =parsePercent(item.thrusting_damage);
		if(material)
		{
			const hardness =parsePercent(material.hardness);
			if(hardness)
			{
				swing *=hardness / 100;
				thrust *=hardness / 100;
			}
		}
		stats.swinging_damage +=swing;
		stats.thrusting_damage +=thrust;
		stats.cleave +=parsePercent(item.cleave);
		stats.attack_speed +=parsePercent(item.attack_speed);
		stats.attack_stamina_cost +=parseNumber(item.attack_stamina_cost);
		stats.inertia +=parseNumber(item.inertia);
	}
	function findMaterial(tag)
	{
		return Object.values(WEAPON_ITEMS).find(function(item)
		{
			return item.tags &&item.tags.includes(tag);
		});
	}
	function findRecipe(name)
	{
		return Object.values(WEAPON_RECIPES).find(function(recipe)
		{
			return recipe.name === name;
		});
	}
	function getItems(tag)
	{
		return Object.values(WEAPON_ITEMS).filter(function(item)
		{
			return item.tags &&item.tags.includes(tag);
		})
		.sort(function(a,b)
		{
			return a.name.localeCompare(b.name,"en",
			{
				sensitivity:"base"
			});
		});
	}
	function findItem(id)
	{
		return WEAPON_ITEMS[id];
	}
	function clearDynamic(box)
	{
		const components =box.querySelector(".weapon-components");
		const materials =box.querySelector(".weapon-materials");
		if(components)
		{
			components.innerHTML = "";
		}
		if(materials)
		{
			materials.innerHTML = "";
		}
	}
	function renderResult(state)
	{
		const panels =document.querySelectorAll(".weapon-result-box");
		let target = null;
		if(state === getState("left"))
		{
			target =panels[0]?.querySelector(".weapon-results");
		}
		else
		{
			target =panels[1]?.querySelector(".weapon-results");
		}
		if(!target)
		{
			return;
		}
		const s =state.stats;
		target.innerHTML = `<div class="weapon-card">
			<div class="weapon-stat">
				<span>Damage</span>
				<b>	${s.damage.toFixed(1)}	</b>
			</div>
			<div class="weapon-stat">
				<span>Base Damage</span>
				<b>${s.base_damage.toFixed(1)}</b>
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
				<b>${s.attack_stamina_cost.toFixed(1)}</b>
			</div>
			<div class="weapon-stat">
				<span>Weight</span>
				<b>${s.weight.toFixed(2)}</b>
			</div>
			<div class="weapon-stat">
				<span>Inertia</span>
				<b>${s.inertia.toFixed(2)}</b>
			</div>
		</div>`;
	}
function updateComparison()
{


const box =
document.getElementById(
"weapon-comparison"
);



if(!box)
{
return;
}



const left =
getState("left");



const right =
getState("right");



if(
!left ||
!right ||
Object.keys(left.stats).length === 0 ||
Object.keys(right.stats).length === 0
)
{

box.innerHTML =
"<h3>Comparison</h3>";

return;

}



const stats =
[

[
"damage",
"Damage"
],

[
"base_damage",
"Base Damage"
],

[
"swinging_damage",
"Swinging Damage"
],

[
"thrusting_damage",
"Thrusting Damage"
],

[
"cleave",
"Cleave"
],

[
"attack_speed",
"Attack Speed"
],

[
"attack_stamina_cost",
"Stamina Cost"
],

[
"weight",
"Weight"
],

[
"inertia",
"Inertia"
]

];



let html =
"<h3>Comparison</h3>";



stats.forEach(function(stat)
{


const key =
stat[0];


const name =
stat[1];



const a =
left.stats[key] || 0;



const b =
right.stats[key] || 0;



html += `

<div class="compare-row">


<span>
${name}
</span>



<span class="${compareClass(a,b,key)}">

${formatValue(a)}

</span>



<span class="${compareClass(b,a,key)}">

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


if(a === b)
{
return "compare-equal";
}



const lowerBetter =
[

"attack_stamina_cost",

"weight",

"inertia"

];



if(
lowerBetter.includes(stat)
)
{

return a < b
?
"compare-better"
:
"compare-worse";

}



return a > b
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





function formatPercent(value)
{


if(!value)
{
return "0%";
}



return (
value > 0
?
"+"
:
""
)
+
value.toFixed(1)
+
"%";


}





function formatValue(value)
{


if(typeof value === "number")
{

return value.toFixed(2);

}



return value;


}





function formatMaterialName(value)
{


return value
.replaceAll("_"," ")
.replace(/\b\w/g,function(char)
{

return char.toUpperCase();

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
