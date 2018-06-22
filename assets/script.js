"use strict";

let carousel=document.getElementById("carousel"), carouselUp=document.getElementById("carousel-up"), carouselDown=document.getElementById("carousel-down"), scrollSpeed=4, scrolling;

carouselUp.onmousedown = carouselUp.ontouchstart = function() {
  clearInterval(scrolling);
  scrolling = setInterval(function(){scrollCarousel(-scrollSpeed)}, 16);
};
carouselDown.onmousedown = carouselDown.ontouchstart = function() {
  clearInterval(scrolling);
  scrolling = setInterval(function(){scrollCarousel(scrollSpeed)}, 16);
};

document.onmouseup = document.ontouchend = function() {
  clearInterval(scrolling);
};

function scrollCarousel(speed){
  carousel.scrollBy(speed, speed);
}

//getting the header nav buttons, getting whichever item has the current tag,
//adding an onclick event to filter content based on header button selected
let navButtons=document.getElementById("contentFilters").getElementsByTagName("a"), carouselItems=carousel.getElementsByTagName("figure");

for (var i = navButtons.length - 1; i >= 0; i--)
{
  navButtons[i].addEventListener("click", function(){
    changeCurrentPage(this);
  });
}

function changeCurrentPage(e){
  let firstItem;
  
  for (var i = navButtons.length - 1; i >= 0; i--)
  {
    navButtons[i].className = "";
  }
  
  for (var i = carouselItems.length - 1; i >= 0; i--)
  {
    carouselItems[i].classList.remove("active");
    
    if(carouselItems[i].className == e.id){
      carouselItems[i].classList.add("active");
      
      if(!firstItem)
        firstItem = carouselItems[i];
    }
  }
  
  firstItem.click();
  
  e.className += "currentPage";
}

//for each carousel item, make it so clicking shows the content in the main content window
let contentContainer=document.getElementById("contentContainer"), content=document.getElementById("content"), purchaseButton=document.getElementById("purchaseButton").children[0];

for (var i = carouselItems.length - 1; i >= 0; i--)
{
  carouselItems[i].addEventListener("click", function(){
    changeCurrentContent(this);
  });
}

function changeCurrentContent(e){
  let newContent;
  
  purchaseButton.parentElement.href=e.getAttribute("url")||"#";
  purchaseButton.innerText=e.getAttribute("promptText")||"<(^_^//<)";
  purchaseButton.parentElement.style.display=e.getAttribute("promptText")?"inline-block":"none";
  
  // --------- TODO ---------
  //Figure out what to do in case of different types of media
  
  switch(e.getAttribute("mediaType")){
    case "vid":
      break;
    case "mus":
      break;
    case "snd":
      break;
    default:
      newContent=document.createElement("img");
      newContent.src=e.children[0].src;
      break;
  }
  
  content.parentNode.insertBefore(newContent, content);
  content.parentNode.removeChild(content);
  
  content=newContent;
}

document.getElementById("contentFilters").getElementsByClassName("currentPage")[0].click();






















