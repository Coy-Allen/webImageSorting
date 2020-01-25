///////////////////////////
//keycapture and base gui//
///////////////////////////
var topMainSelection = document.getElementById("topMainSelection");
var leftMainSelection = document.getElementById("leftMainSelection");
var rightMainSelection = document.getElementById("rightMainSelection");
var bottomMainSelection = document.getElementById("bottomMainSelection");
var selectedSelection = null;
var keyCaptureStack = [];

window.onkeypress = function(event) {
	// keyCaptureStack's last element tells us what gui we should use for keypresses.
	switch(keyCaptureStack[keyCaptureStack.length-1]){
		case "help":
			break;
		case "controlMenu":
			if(event.keyCode >= 48 && event.keyCode <= 57){
				//0=48 1=49 ... 9=57
				//this translates the keycode back to the number on the keyboard
				selectedControlMenu.selectAction(event.keyCode-48);
			}
			break;
		case undefined:
			//array is empty (only base gui is up)
			if(event.keyCode == 119 || event.keyCode == 97 || event.keyCode == 100 || event.keyCode == 115){
				//w=119 a=97 d=100 s=115
				selectionController(event.keyCode);
			}
			break;
	}
}

function selectionController(keyCode){
	//TODO shorten this somehow
	//TODO make selectionText slightly farther from vertical center when selection is active
	if(selectedSelection == null){
		if(keyCode == 119){
			selectedSelection = topMainSelection;
			selectedSelection.style.left="calc(50% - 150px)";
		}else if (keyCode == 97){
			selectedSelection = leftMainSelection;
			selectedSelection.style.top="calc(50% - 75px)";
		}else if (keyCode == 100){
			selectedSelection = rightMainSelection;
			selectedSelection.style.top="calc(50% - 75px)";
		}else{
			selectedSelection = bottomMainSelection;
			selectedSelection.style.left="calc(50% - 150px)";
		}
		selectedSelection.style.width="300px";
		selectedSelection.style.height="150px";
	}else if(selectedSelection == topMainSelection){
		if(keyCode == 119){
			selectedAction(0);
		}else if (keyCode == 97){
			selectedAction(1);
		}else if (keyCode == 100){
			selectedAction(2);
		}else{
			selectedAction(3);
		}
		selectedSelection.style.width="200px";
		selectedSelection.style.height="100px";
		selectedSelection.style.left="calc(50% - 100px)";
		selectedSelection = null;
	}else if(selectedSelection == leftMainSelection){
		if(keyCode == 119){
			selectedAction(4);
		}else if (keyCode == 97){
			selectedAction(5);
		}else if (keyCode == 100){
			selectedAction(6);
		}else{
			selectedAction(7);
		}
		selectedSelection.style.width="200px";
		selectedSelection.style.height="100px";
		selectedSelection.style.top="calc(50% - 50px)";
		selectedSelection = null;
	}else if(selectedSelection == rightMainSelection){
		if(keyCode == 119){
			selectedAction(8);
		}else if (keyCode == 97){
			selectedAction(9);
		}else if (keyCode == 100){
			selectedAction(10);
		}else{
			selectedAction(11);
		}
		selectedSelection.style.width="200px";
		selectedSelection.style.height="100px";
		selectedSelection.style.top="calc(50% - 50px)";
		selectedSelection = null;
	}else if(selectedSelection == bottomMainSelection){
		if(keyCode == 119){
			selectedAction(12);
		}else if (keyCode == 97){
			selectedAction(13);
		}else if (keyCode == 100){
			selectedAction(14);
		}else{
			selectedAction(15);
		}
		selectedSelection.style.width="200px";
		selectedSelection.style.height="100px";
		selectedSelection.style.left="calc(50% - 100px)";
		selectedSelection = null;
	}
}

function selectedAction(selectionNumber){
	if(selectionNumber % 5 == 0){
		//0,5,10,15 are deselects and dont do anything so they are not listed
	}else if(selectionNumber < 12){
		moveImageToFolder(selectionNumber-1-Math.floor(selectionNumber/5));
	}else{
		controlMenuActivate(selectionNumber-12);
	}
}

function updateImage(){
	//TODO
}

function updateFolders(folderList){
	if(folderList.length > 9){
		//cant fit all folders into gui
		console.error("folder array is too long.");
	}
	for(i=0;i<9;++i){
		//idOffset fixes the gap between i and sel. id that is caused by 0,5,10,15
		//what i equals:  0, 1, 2, 3, 4, 5, 6, 7, 8
		//sel. id equals: 1, 2, 3, 4, 6, 7, 8, 9, 11
		//diffrence:      1, 1, 1, 1, 2, 2, 2, 2, 3
		var name = "";
		var idOffset = Math.floor(i/4)+1;
		if(i < folderList.length){
			name = folderList[i];
		}
		document.getElementById("selectionText"+(i+idOffset)).innerHTML = name;
	}
}
////////////////////
//menus and popups//
////////////////////
class controlMenu {
	constructor(variableName,title,itemNames,itemFunctions){
		//for some reason it only lets me do this here
		this.selectAction = function(actionNumber){
			if(actionNumber >= this.itemFunctions.length) return;
			console.log(actionNumber);
			this.itemFunctions[actionNumber]();
			//hide and deselect menu then stop capturing keypresses
			this.controlMenuDiv.hidden = true;
			selectedControlMenu = null;
			keyCaptureStack.pop();
		};
		if(itemNames.length != itemFunctions.length) console.error("controlMenu: names and functions not in 1:1 pairs");
		this.itemFunctions = itemFunctions;
		//create main div and start it hidden
		this.controlMenuDiv = document.createElement("div");
		this.controlMenuDiv.className = "controlMenu";
		this.controlMenuDiv.hidden = true;
		//create and append title
		var controlMenuTitle = document.createElement("div");
		controlMenuTitle.className = "controlMenuTitle";
		controlMenuTitle.appendChild(document.createTextNode(title));
		this.controlMenuDiv.appendChild(controlMenuTitle);
		//create and append each item
		for(var i=0;i<itemNames.length;i++){
			var item = document.createElement("div");
			item.className = "controlMenuItem";
			//"i" wont stick to whatever it is when calling onclick so we need to store it somewhere
			item.setAttribute("data-actionnumber",i);
			//no way to get this.selectAction into this context so we need the variableName our object belongs too
			item.setAttribute("onclick",variableName+".selectAction(this.getAttribute(\"data-actionnumber\"))");
			item.appendChild(document.createTextNode(""+i+". "+itemNames[i]));
			this.controlMenuDiv.appendChild(item);
		}
		document.body.prepend(this.controlMenuDiv);
	}
}
//function.prototype is used as a noop for the cancel item
var sortControlMenu = new controlMenu("sortControlMenu","Sorting Control",
	["cancel","skip file","finish file","request new batch"],
	[Function.prototype,sortingSkipFile,sortingFinishFile,sortingRequest]);
var folderControlMenu = new controlMenu("folderControlMenu","Folder Control",
	["cancel","create folder","rename folder","delete folder"],
	[Function.prototype,folderCreate,folderRename,folderDelete]);
var fileControlMenu = new controlMenu("fileControlMenu","File Control",
	["cancel","rename file","set external source","delete file","blacklist file"],
	[Function.prototype,fileRename,fileSetExternalSource,fileDelete,fileBlacklist]);
var selectedControlMenu = null;

function controlMenuActivate(controlMenuNumber){
	switch(controlMenuNumber){
		case 0:
			selectedControlMenu = sortControlMenu;
			break;
		case 1:
			selectedControlMenu = folderControlMenu;
			break;
		case 2:
			selectedControlMenu = fileControlMenu;
			break;
	}
	selectedControlMenu.controlMenuDiv.hidden = false;
	keyCaptureStack.push("controlMenu");
}
////////////////////////////////
//data and backend interaction//
////////////////////////////////
var backendResponse;
var nextRequest;


function moveImageToFolder(folderNumber){
	//TODO
}
function sortingFinishFile(){
	//TODO
}
function sortingSkipFile(){
	//TODO
}
function sortingRequest(){
	//TODO
}
function folderCreate(){
	//TODO
}
function folderRename(){
	//TODO
}
function folderDelete(){
	//TODO
}
function fileRename(){
	//TODO
}
function fileSetExternalSource(){
	//TODO
}
function fileDelete(){
	//TODO
}
function fileBlacklist(){
	//TODO
}
