//////////////////////
//keycapture and gui//
//////////////////////
var topMainSelection = document.getElementById("topMainSelection");
var leftMainSelection = document.getElementById("leftMainSelection");
var rightMainSelection = document.getElementById("rightMainSelection");
var bottomMainSelection = document.getElementById("bottomMainSelection");
var selectedSelection = null;
var sortControlMenu = document.getElementById("sortControlMenu");
var folderControlMenu = document.getElementById("folderControlMenu");
var fileControlMenu = document.getElementById("fileControlMenu");
var selectedControlMenu = null;

window.onkeypress = function(event) {
	/*
	 * keys:
	 * wasd = folder controls
	 *
	 * actions (selctedAction):
	 * 1,2,3,4,6,7,8,9,11 folders
	 * 0,5,10,15 deselect selection
	 * 12 sort control (new menu)
	 *   skip file
	 *   finish file
	 * 13 folder control (new menu)
	 *   create folder
	 *   rename folder
	 *   delete folder
	 * 14 file control (new menu)
	 *   rename file
	 *   set external source
	 *   delete file
	 *   blacklist file
	 */
	//TODO help section via 'h' key
	if(selectedControlMenu != null){
		if(event.keyCode >= 48 && event.keyCode <= 57){
			//0=48,1=49,...,9=57
			//this translates the keycode back to the number on the keyboard
			controlMenuAction(event.keyCode-48);
		}
	}else if(event.keyCode == 119 || event.keyCode == 97 || event.keyCode == 100 || event.keyCode == 115){
		//w=119 a=97 d=100 s=115
		selectionController(event.keyCode);
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
	//TODO shorten this somehow
	switch(selectionNumber){
		//0,5,10,15 are deselects and dont do anything so they are not listed
		//case  0:
		case  1:
			moveImageToFolder(0);
			break;
		case  2:
			moveImageToFolder(1);
			break;
		case  3:
			moveImageToFolder(2);
			break;
		case  4:
			moveImageToFolder(3);
			break;
		//case  5:
		case  6:
			moveImageToFolder(4);
			break;
		case  7:
			moveImageToFolder(5);
			break;
		case  8:
			moveImageToFolder(6);
			break;
		case  9:
			moveImageToFolder(7);
			break;
		//case 10:
		case 11:
			moveImageToFolder(8);
			break;
		case 12:
			//sortControlMenu
			sortControlMenu.hidden = false;
			selectedControlMenu = sortControlMenu;
			break;
		case 13:
			//folderControlMenu
			folderControlMenu.hidden = false;
			selectedControlMenu = folderControlMenu;
			break;
		case 14:
			//fileControlMenu
			fileControlMenu.hidden = false;
			selectedControlMenu = fileControlMenu;
			break;
		//case 15:
	}
}

function controlMenuAction(itemNumber){
	//TODO shorten this somehow
	var closeMenu = false;
	if(itemNumber == 0){
		closeMenu = true;
	}else if(selectedControlMenu == sortControlMenu){
		switch(itemNumber){
			case 1:
				sortingSkipFile()
				closeMenu = true;
				break;
			case 2:
				sortingFinishFile();
				closeMenu = true;
				break;
		}
	}else if(selectedControlMenu == folderControlMenu){
		switch(itemNumber){
			case 1:
				folderCreate();
				closeMenu = true;
				break;
			case 2:
				folderRename();
				closeMenu = true;
				break;
			case 3:
				folderDelete();
				closeMenu = true;
				break;
		}
	}else if(selectedControlMenu == fileControlMenu){
		switch(itemNumber){
			case 1:
				fileRename();
				closeMenu = true;
				break;
			case 2:
				fileSetExternalSource();
				closeMenu = true;
				break;
			case 3:
				fileDelete();
				closeMenu = true;
				break;
			case 4:
				fileBlacklist();
				closeMenu = true;
				break;
		}
	}
	if(closeMenu){
		selectedControlMenu.hidden = true;
		selectedControlMenu = null;
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
