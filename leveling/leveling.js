"use strict";

document.addEventListener("DOMContentLoaded",()=>
{
const table=document.getElementById("xp-table"),
chart=document.getElementById("xp-chart");
if(!table&&!chart)return;
const maxLevel=100,xpPerLevel=250;
const levels=Array.from({length:maxLevel},(_,i)=>(
{
	level:i+1,
	totalXP:i*xpPerLevel,
	next:i<maxLevel-1?xpPerLevel:0
}));

function createTable()
{
  if(!table)return;
  const body=table.querySelector("tbody");
  body.innerHTML="";
  levels.forEach(x=>
  {
    let row=document.createElement("tr");
    row.innerHTML=`
    <td>${x.level}</td>
    <td>${x.totalXP.toLocaleString("en-US")}</td>
    <td>${x.next||"-"}</td>`;
    body.appendChild(row);
  });
}
  
function createChart()
{
  if(!chart)return;
  chart.innerHTML="";
  const w=900,h=450,p=
  {
    t:30,r:40,b:50,l:70
  };
  const gw=w-p.l-p.r;
  const gh=h-p.t-p.b;
  const maxXP=levels.at(-1).totalXP;
  const X=l=>p.l+(l-1)/(maxLevel-1)*gw;
  const Y=x=>p.t+gh-(x/maxXP)*gh;
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox",`0 0 ${w} ${h}`);
  svg.style.width="100%";
  for(let i=0;i<=5;i++)
  {
    let line=document.createElementNS("http://www.w3.org/2000/svg","line");
    let y=p.t+gh/5*i;
    line.setAttribute("x1",p.l);
    line.setAttribute("x2",w-p.r);
    line.setAttribute("y1",y);
    line.setAttribute("y2",y);
    line.setAttribute("stroke","#555");
    line.setAttribute("opacity",".2");
    svg.appendChild(line);
  }
  let pts=levels.map(x=>`${X(x.level)},${Y(x.totalXP)}`).join(" ");
  let curve=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  curve.setAttribute("points",pts);
  curve.setAttribute("fill","none");
  curve.setAttribute("stroke","#d33");
  curve.setAttribute("stroke-width","3");
  svg.appendChild(curve);
  let tooltip=document.createElement("div");
  tooltip.className="xp-tooltip";
  chart.style.position="relative";
  chart.append(svg,tooltip);
  levels.forEach(x=>
  {
    let c=document.createElementNS("http://www.w3.org/2000/svg","circle");
    let cx=X(x.level),cy=Y(x.totalXP);
    c.setAttribute("cx",cx);
    c.setAttribute("cy",cy);
    c.setAttribute("r",4);
    c.setAttribute("fill","#d33");
    c.onmouseenter=()=>
    {
      c.setAttribute("r",8);
      tooltip.innerHTML=`<b>Level ${x.level}</b><br><br>Total XP : ${x.totalXP.toLocaleString("en-US")}<br>Next Level : ${x.next.toLocaleString("en-US")}`;
      tooltip.style.display="block";
      tooltip.style.left=cx+15+"px";
      tooltip.style.top=cy-50+"px";
    };
      c.onmouseleave=()=>
    {
        c.setAttribute("r",4);
        tooltip.style.display="none";
    };
      svg.appendChild(c);
  });
}
  createTable();
  createChart();
});
