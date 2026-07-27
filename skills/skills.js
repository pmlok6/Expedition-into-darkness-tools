/* ==========================================
   Skill Tree
   Expedition into Darkness Tools
========================================== */
import SKILLS_DATA from "../data/skillsdata.js";

"use strict";

document.addEventListener("DOMContentLoaded", function()
{
    const tree = document.getElementById("skill-tree");
    if(!tree)
    {
        return;
    }
    Object.values(SKILLS_DATA).forEach(function(skill)
   {
      createSkillNode(tree, skill);
   });
});

function createSkillNode(container, skill) 
{
    const node = document.createElement("div");

    node.className = "skill-node";
    node.dataset.skillId = skill.id;
   
    node.style.left = skill.x + "%";
    node.style.top = skill.y + "%";

    if(skill.icon)
    {
      const img = document.createElement("img");
      img.src = "../assets/skills/" + skill.icon;
      img.onerror = function()
      {
        img.remove();
      };
      img.className = "skill-icon";
      node.appendChild(img);
    }

   node.addEventListener("mouseenter",
    function(e)
    {
        showPopup(e, skill);
    });

   node.addEventListener("mouseleave",
    function()
    {
        hidePopup();
    });
   
    container.appendChild(node);
}

function showPopup(event,skill)
{
    const popup = document.getElementById("skill-popup");
    if(!popup)
    {
        return;
    }      
const tags = 
   [
      "Skill",
      skill.branch
   ];

popup.innerHTML = `

<div class="skill-popup-tags">${tags.map(tag => `<span>${tag}</span>`).join("")}</div>
<div class="skill-popup-title">${skill.name}</div>
<img class="skill-popup-icon" src="${skill.icon}">
<div class="skill-popup-description">${skill.description}</div>
<div class="skill-popup-effect">${skill.effect}</div>
`;
    popup.style.left =event.pageX + 10 + "px";
    popup.style.top =event.pageY + 10 + "px";
    popup.classList.add("is-visible");
}

function hidePopup()
{
    document.getElementById("skill-popup")?.classList.remove("is-visible");
}
