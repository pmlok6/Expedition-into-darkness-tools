/* ==========================================
   Skill Tree
   Expedition into Darkness Tools
========================================== */
import SKILLS_DATA from "../data/skillsData.js";

Object.values(SKILLS_DATA).forEach(skill=>{
    createSkillNode(tree,skill);
});

document.addEventListener(
"DOMContentLoaded",
function()
{

    const tree =
        document.getElementById(
            "skill-tree"
        );


    if(!tree)
    {
        return;
    }


    Object.values(
        SKILLS_DATA.skills
    )
    .forEach(function(skill)
    {
        createSkillNode(
            tree,
            skill
        );
    });


});



function createSkillNode(container,skill)
{

    const node =
        document.createElement("div");


    node.className =
        "skill-node";


    node.style.left =
        skill.x + "%";


    node.style.top =
        skill.y + "%";


    node.dataset.id =
        skill.id;


    node.addEventListener(
        "mouseenter",
        function(e)
        {
            showPopup(
                e,
                skill
            );
        }
    );


    node.addEventListener(
        "mouseleave",
        hidePopup
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
