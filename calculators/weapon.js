import { invoke } from "../js/wiki-api.js";

"use strict";

let WEAPON_ITEMS = {};
let WEAPON_RECIPES = {};


document.addEventListener("DOMContentLoaded",function()
{
	const root = document.getElementById("weapon-calculator");

	if(!root)
	{
		return;
	}


	Promise.all([
		invoke("WeaponCalculatorData","items"),
		invoke("WeaponCalculatorData","recipes")
	])
	.then(function(result)
	{
		WEAPON_ITEMS = result[0];
		WEAPON_RECIPES = result[1];

		buildCalculator(root);
	})
	.catch(function(error)
	{
		console.error(
			"Weapon Calculator loading error",
			error
		);
	});
});



function buildCalculator(root)
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


	createWeaponPanel(
		document.getElementById("weapon-left"),
		"Weapon 1"
	);

	createWeaponPanel(
		document.getElementById("weapon-right"),
		"Weapon 2"
	);


	createWeaponType(
		document.querySelector("#weapon-left .weapon-selection-box"),
		state.left
	);


	createWeaponType(
		document.querySelector("#weapon-right .weapon-selection-box"),
		state.right
	);
}



function createWeaponPanel(panel,title)
{
	panel.innerHTML =
	`
	<div class="weapon-box">

		<h3>${title}</h3>

		<div class="weapon-selection-box">

			<div class="weapon-components"></div>

			<div class="weapon-materials"></div>

		</div>

	</div>


	<div class="weapon-box weapon-result-box">

		<h3>Result</h3>

		<div class="weapon-results"></div>

	</div>
	`;
}
function createWeaponType(box,state)
{
	const selector =
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
	box.appendChild(selector.wrapper);
	selector.select.onchange = function()
	{
		state.type = selector.select.value;

		state.components = {};
		state.materials = {};
		state.stats = {};

		clearDynamic(box.closest(".weapon-box"));

		if(state.type === "blade")
		{
			buildBladeWeapon(
				box.closest(".weapon-box"),
				state
			);
		}

		if(state.type === "shaft")
		{
			buildShaftWeapon(
				box.closest(".weapon-box"),
				state
			);
		}
	};
}



function buildBladeWeapon(box,state)
{
	const parts =
	[
		"blade",
		"pommel",
		"crossguard",
		"grip"
	];


	parts.forEach(function(part)
	{
		createComponent(
			box,
			part.charAt(0).toUpperCase()+part.slice(1),
			getItems(part),
			function(item,row)
			{
				state.components[part] = item.guid;

				createMaterial(
					row,
					item,
					state
				);

				calculateWeapon(state);
			}
		);
	});
}

function buildShaftWeapon(box,weaponState)
{
	createComponent(
		box,
		"Shaft",
		getItems("shaft"),
		function(item)
		{
			weaponState.components = {};
			weaponState.materials = {};

			weaponState.components.shaft = item.guid;


			const components =
				box.querySelector(".weapon-components");


			if(components)
			{
				components
				.querySelectorAll(".dynamic")
				.forEach(function(element)
				{
					if(
						element.querySelector("label") &&
						element.querySelector("label").textContent !== "Shaft"
					)
					{
						element.parentElement.remove();
					}
				});
			}


			buildShaftSlots(
				box,
				item,
				weaponState
			);
		}
	);
}
function buildShaftSlots(box,shaft,state)
{
	if(!shaft.slots)
	{
		return;
	}


	const components =
		box.querySelector(".weapon-components");


	if(components)
	{
		const dynamic =
			components.querySelectorAll(".dynamic");


		dynamic.forEach(function(element)
		{
			if(
				element.querySelector("label") &&
				element.querySelector("label").textContent !== "Shaft"
			)
			{
				element.parentElement.remove();
			}
		});
	}


	const slotTags =
	{
		"Shaft Head":"spear_head",
		"Spear Head":"spear_head"
	};



	shaft.slots.forEach(function(slot)
	{
		const tag =
			slotTags[slot]
			||
			slot.toLowerCase().replaceAll(" ","_");


		createComponent(
			box,
			slot,
			getItems(tag),
			function(item,row)
			{
				state.components[slot] = item.guid;


				createMaterial(
					row,
					item,
					state
				);


				calculateWeapon(state);
			}
		);
	});
}

function createComponent(box,label,items,callback)
{
	const row = document.createElement("div");

	row.className = "weapon-component-row";


	const selector =
		createSelect(
			label,
			items.map(function(item)
			{
				return {
					id:item.guid,
					name:item.name
				};
			})
		);


	selector.wrapper.classList.add("dynamic");


	row.appendChild(selector.wrapper);


	const container =
		box.querySelector(".weapon-components");


	container.appendChild(row);



	selector.select.onchange = function()
	{
		const item =
			findItem(selector.select.value);


		if(item)
		{
			callback(
				item,
				row
			);
		}
	};
}



function createSelect(label,options)
{
	const wrapper =
		document.createElement("div");


	wrapper.className =
		"weapon-selector";


	const labelNode =
		document.createElement("label");


	labelNode.textContent = label;



	const select =
		document.createElement("select");


	select.innerHTML =
		`
		<option value="">
			-- Select --
		</option>
		`;



	options.forEach(function(option)
	{
		const opt =
			document.createElement("option");


		opt.value = option.id;

		opt.textContent = option.name;


		select.appendChild(opt);
	});



	wrapper.appendChild(labelNode);

	wrapper.appendChild(select);



	return {
		wrapper:wrapper,
		select:select
	};
}



function createMaterial(box,item,state)
{
	const recipe =
		findRecipe(item.name);


	if(
		!recipe ||
		!recipe.allowed_materials
	)
	{
		return;
	}



	const old =
		box.querySelector(
			".weapon-material-selector"
		);


	if(old)
	{
		old.remove();
	}



	const materials =
		recipe.allowed_materials.map(function(material)
		{
			return {
				id:material,
				name:formatMaterialName(material)
			};
		});



	const selector =
		createSelect(
			"Material",
			materials
		);



	selector.wrapper.classList.add(
		"weapon-material-selector"
	);



	box.appendChild(
		selector.wrapper
	);



	selector.select.onchange = function()
	{
		state.materials[item.guid] =
			selector.select.value;


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

		magical_properties:null,

		damage_type:[]
	};



	Object.values(state.components)
	.forEach(function(id)
	{
		const item =
			findItem(id);


		if(!item)
		{
			return;
		}



		const materialTag =
			state.materials[item.guid];



		const material =
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
	});



	state.stats = stats;


	renderResult(state);
}




function addStats(stats,item,material)
{
	stats.weight +=
		Number(item.weight || 0);



	const base =
		parseNumber(
			item.base_damage
		);



	stats.base_damage += base;



	let damage = base;



	if(material && base)
	{
		const hardness =
			parsePercent(
				material.hardness
			);


		if(hardness)
		{
			damage *= hardness / 100;
		}



		if(
			item.tags &&
			item.tags.includes("blade") &&
			material.magical_properties
		)
		{
			stats.magical_properties =
				material.magical_properties;
		}
	}



	if(item.damage_type)
	{
		item.damage_type.forEach(function(type)
		{
			if(
				!stats.damage_type.includes(type)
			)
			{
				stats.damage_type.push(type);
			}
		});
	}



	stats.damage += damage;



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
		const hardness =
			parsePercent(
				material.hardness
			);


		if(hardness)
		{
			swing *= hardness / 100;

			thrust *= hardness / 100;
		}
	}



	stats.swinging_damage += swing;

	stats.thrusting_damage += thrust;

	stats.cleave += parsePercent(item.cleave);

	stats.attack_speed += parsePercent(item.attack_speed);

	stats.attack_stamina_cost +=
		parseNumber(item.attack_stamina_cost);

	stats.inertia +=
		parseNumber(item.inertia);
}

function findMaterial(tag)
{
	return Object.values(WEAPON_ITEMS).find(function(item)
	{
		return item.tags && item.tags.includes(tag);
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
	return Object.values(WEAPON_ITEMS)
	.filter(function(item)
	{
		return item.tags && item.tags.includes(tag);
	})
	.sort(function(a,b)
	{
		return a.name.localeCompare(
			b.name,
			"en",
			{
				sensitivity:"base"
			}
		);
	});
}

function findItem(id)
{
	return WEAPON_ITEMS[id];
}

function clearDynamic(box)
{
	const components =
		box.querySelector(".weapon-components");


	const materials =
		box.querySelector(".weapon-materials");


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
	const panels =
		document.querySelectorAll(".weapon-result-box");


	let target = null;


	if(state === getState("left"))
	{
		target =
			panels[0]?.querySelector(".weapon-results");
	}
	else
	{
		target =
			panels[1]?.querySelector(".weapon-results");
	}

	if(!target)
	{
		return;
	}
	const s = state.stats;
	const weaponTags = [];
	if(s.damage_type.length)
	{
		weaponTags.push(...s.damage_type);
	}
	if(		s.magical_properties &&		s.magical_properties !== "none"	)
	{
		weaponTags.push(
			s.magical_properties
		);
	}



	const info =
		weaponTags.length
		?
		`
		<div class="weapon-tags">
			${weaponTags.map(function(tag)
			{
				return `
				<div class="weapon-tag">
					${tag}
				</div>`;
			}).join("")}
		</div>
		`
		:
		"";



	const otherState =
		state === getState("left")
		?
		getState("right")
		:
		getState("left");



	const other =
		otherState?.stats ||
		{
			damage:0,
			base_damage:0,
			swinging_damage:0,
			thrusting_damage:0,
			cleave:0,
			attack_speed:0,
			attack_stamina_cost:0,
			weight:0,
			inertia:0
		};



	target.innerHTML =
	`
	<div class="weapon-card">

		${info}


		<div class="weapon-stat">
			<span>Damage</span>
			<b class="${compareClass(s.damage,other.damage,"damage")}">
				${s.damage.toFixed(1)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Base Damage</span>
			<b class="${compareClass(s.base_damage,other.base_damage,"base_damage")}">
				${s.base_damage.toFixed(1)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Swinging Damage</span>
			<b class="${compareClass(s.swinging_damage,other.swinging_damage,"swinging_damage")}">
				${formatPercent(s.swinging_damage)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Thrusting Damage</span>
			<b class="${compareClass(s.thrusting_damage,other.thrusting_damage,"thrusting_damage")}">
				${formatPercent(s.thrusting_damage)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Cleave</span>
			<b class="${compareClass(s.cleave,other.cleave,"cleave")}">
				${formatPercent(s.cleave)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Attack Speed</span>
			<b class="${compareClass(s.attack_speed,other.attack_speed,"attack_speed")}">
				${formatPercent(s.attack_speed)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Stamina Cost</span>
			<b class="${compareClass(other.attack_stamina_cost,s.attack_stamina_cost,"attack_stamina_cost")}">
				${s.attack_stamina_cost.toFixed(1)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Weight</span>
			<b class="${compareClass(other.weight,s.weight,"weight")}">
				${s.weight.toFixed(2)}
			</b>
		</div>


		<div class="weapon-stat">
			<span>Inertia</span>
			<b class="${compareClass(other.inertia,s.inertia,"inertia")}">
				${s.inertia.toFixed(2)}
			</b>
		</div>

	</div>
	`;
}



function compareClass(a,b,stat)
{
	a = Number(a);

	b = Number(b);



	if(Math.abs(a-b) < 0.01)
	{
		return "compare-equal";
	}



	const lowerBetter =
	[
		"attack_stamina_cost",
		"weight",
		"inertia"
	];



	if(lowerBetter.includes(stat))
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
	) || 0;
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
	) || 0;
}



function formatPercent(value)
{
	if(!value)
	{
		return "0%";
	}


	return (
		value > 0 ? "+" : ""
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
