/* ==========================================
   Skill Tree
   Expedition into Darkness Tools
========================================== */

"use strict";


document.addEventListener(
"DOMContentLoaded",
function()
{

const tree =
document.getElementById("skill-tree");


if(!tree || tree.dataset.loaded)
{
	return;
}


tree.dataset.loaded="true";



fetch("../data/skills.json")

.then(response=>response.json())

.then(data=>{


if(!data.skills)
{
	return;
}


Object.values(data.skills)
.forEach(skill=>{

	createSkillNode(tree,skill);

});


})


.catch(error=>{

console.error(
"Skill loading error",
error
);

});


});



function createSkillNode(container,skill)
{

const node =
document.createElement("div");


node.className="skill-node";


node.dataset.skillId =
skill.id;



node.style.left =
skill.x+"%";


node.style.top =
skill.y+"%";



if(skill.locked)
{
	node.classList.add("locked");
}



node.addEventListener(
"mouseenter",
event=>
showPopup(event,skill)
);



node.addEventListener(
"mouseleave",
hidePopup
);



node.addEventListener(
"click",
()=>
selectSkill(node)
);



container.appendChild(node);

}



function showPopup(event,skill)
{

const popup =
document.getElementById(
"skill-popup"
);


if(!popup)
{
	return;
}



popup.innerHTML=`

<div class="skill-popup-label">
Skill
</div>

<div class="skill-popup-title">
${skill.name}
</div>

<div class="skill-popup-branch">
${skill.branch}
</div>

<img 
class="skill-popup-icon"
src="${skill.icon}">


<div class="skill-popup-description">
${skill.description}
</div>


<div class="skill-popup-effect">
${skill.effect}
</div>

`;



popup.style.left =
event.pageX + 10 + "px";


popup.style.top =
event.pageY + 10 + "px";


popup.classList.add(
"is-visible"
);

}



function hidePopup()
{

document
.getElementById("skill-popup")
?.classList.remove(
"is-visible"
);

}



function selectSkill(node)
{

document
.querySelector(
".skill-node.selected"
)
?.classList.remove(
"selected"
);



node.classList.add(
"selected"
);

}
