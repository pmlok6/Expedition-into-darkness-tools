/* ==========================================
   Skill Tree
   Expedition into Darkness Tools
========================================== */
import SKILLS_DATA from "../data/skillsdata.js";

"use strict";


document.addEventListener("DOMContentLoaded", function(){

    const tree = document.getElementById("skill-tree");

    if(!tree)
    {
        return;
    }


    Object.values(SKILLS_DATA).forEach(function(skill){

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
        img.className = "skill-icon";
        node.appendChild(img);
    }


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


    popup.innerHTML = `

        <h3>${skill.name}</h3>

        <strong>
        ${skill.branch}
        </strong>

        <p>
        ${skill.description}
        </p>

        <b>
        ${skill.effect}
        </b>

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
    .getElementById(
        "skill-popup"
    )
    ?.classList.remove(
        "is-visible"
    );

}
