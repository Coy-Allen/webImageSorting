///////////////////////////
//keycapture and base gui//
///////////////////////////
var topMainSelection = document.getElementById("topMainSelection");
var leftMainSelection = document.getElementById("leftMainSelection");
var rightMainSelection = document.getElementById("rightMainSelection");
var bottomMainSelection = document.getElementById("bottomMainSelection");
var viewerHolder = document.getElementById("viewerHolder");
var viewerPanzoom;
var selectedSelection = null;
var keyCaptureStack = [];

window.onkeyup = function(event) {
	// keyCaptureStack's last element tells us what gui we should use for keypresses.
	// FIXME: onkeyup must be used due to others fireing multiple times when held.
	// however onkeyup feels delayed compared to onKeydown so we need another solution
	switch(keyCaptureStack[keyCaptureStack.length-1]){
		case "help":
			if("?h".includes(event.key)){
				helpPopupMenu.hideMenu();
			}
			break;
		case "sortingRequest":
			break;
		case "folderCreate":
			break;
		case "controlMenu":
			if("0123456789".includes(event.key)){
				//key is a number 0-9
				selectedControlMenu.selectAction(event.key);
			}else if("?h".includes(event.key)){
				keyCaptureStack.push("help");
				helpPopupMenu.mainDiv.hidden = false;
			}
			break;
		case undefined:
			//array is empty (only base gui is up)
			if("wads".includes(event.key)){
				selectionController(event.key);
			}else if("?h".includes(event.key)){
				keyCaptureStack.push("help");
				helpPopupMenu.mainDiv.hidden = false;
			}
			break;
	}
}

function selectionController(key){
	//TODO make selectionText slightly farther from vertical center when selection is active
	var direction = 0;
	var actionOffset = 0;
	//w=0,a=1,d=2,s=3
	switch (key){
		case "s": direction++;
		case "d": direction++;
		case "a": direction++;
	}
	if(selectedSelection == null){
		if(key == "w"){
			selectedSelection = topMainSelection;
			selectedSelection.style.left="calc(50% - 150px)";
		}else if (key == "a"){
			selectedSelection = leftMainSelection;
			selectedSelection.style.top="calc(50% - 75px)";
		}else if (key == "d"){
			selectedSelection = rightMainSelection;
			selectedSelection.style.top="calc(50% - 75px)";
		}else{
			selectedSelection = bottomMainSelection;
			selectedSelection.style.left="calc(50% - 150px)";
		}
		selectedSelection.style.width="300px";
		selectedSelection.style.height="150px";
	}else{
		//top=0,left=4,right=8,bottom=12
		switch(selectedSelection){
			case bottomMainSelection: actionOffset += 4
			case rightMainSelection: actionOffset += 4
			case leftMainSelection: actionOffset += 4;
		}
		if(selectedSelection == topMainSelection || selectedSelection == bottomMainSelection){
			selectedSelection.style.left="calc(50% - 100px)";
		}else{
			selectedSelection.style.top="calc(50% - 50px)";
		}
		selectedSelection.style.width="200px";
		selectedSelection.style.height="100px";
		selectedSelection = null;
		selectedAction(actionOffset+direction);
	}
}

function selectedAction(selectionNumber){
	if(selectionNumber % 5 == 0){
		//0,5,10,15 are deselects and dont do anything so they are not listed
	}else if(selectionNumber < 12){
		moveImageToFolder(selectionNumber-1-Math.floor(selectionNumber/5));
	}else{
		switch(selectionNumber){
			case 12:
				selectedControlMenu = sortControlMenu;
				break;
			case 13:
				selectedControlMenu = folderControlMenu;
				break;
			case 14:
				selectedControlMenu = fileControlMenu;
				break;
		}
		selectedControlMenu.mainDiv.hidden = false;
		keyCaptureStack.push("controlMenu");
	}
}

function updateViewer(fileLocation){
	//clear the holder and panzoom
	if(viewerPanzoom)viewerPanzoom.dispose();
	viewerHolder.innerHTML = "";
	var newViewer;
	switch(fileLocation.split(".").pop()){
		//images
		case "jpeg": case "png": case "jpg": case "gif":
			newViewer = document.createElement("img");
			break;
		//video
		case "mp4": case "webm":
			//FIXME video keyboard shortcuts and click events conflict with panzoom
			newViewer = document.createElement("video");
			newViewer.autoplay = true;
			newViewer.loop = true;
			newViewer.controls = true;
			break;
		default:
			return;//FIXME
			console.log("WARN: unknown ext found "+fileLocation);
			break;
	}
	//set attribs and add to html
	newViewer.setAttribute("id","viewer");
	newViewer.setAttribute("src",fileLocation);
	viewerHolder.append(newViewer);
	viewerPanzoom = panzoom(newViewer);
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
	constructor(variableName,menuTitle,width,height,leftPos,topPos,itemNames,itemFunctions){
		//for some reason it aonly lets me make methods here
		this.selectAction = function(actionNumber){
			if(actionNumber >= this.itemFunctions.length) return;
			this.hideMenu();
			this.itemFunctions[actionNumber]();
		};
		this.hideMenu = function(){
			//hide and deselect menu then stop capturing keypresses
			this.mainDiv.hidden = true;
			selectedControlMenu = null;
			keyCaptureStack.shift();
		};
		if(itemNames.length != itemFunctions.length) console.error("controlMenu: names and functions not in 1:1 pairs");
		this.itemFunctions = itemFunctions;
		//create main div and start it hidden
		this.mainDiv = document.createElement("div");
		this.mainDiv.className = "controlMenu";
		if(width != "")this.mainDiv.style.width = width;
		if(height != "")this.mainDiv.style.height = height;
		if(leftPos != "")this.mainDiv.style.left = leftPos;
		if(topPos != "")this.mainDiv.style.top = topPos;
		this.mainDiv.hidden = true;
		//create and append title
		var title = document.createElement("div");
		title.className = "menuTitle";
		title.appendChild(document.createTextNode(menuTitle));
		this.mainDiv.appendChild(title);
		//create and append each item
		for(var i=0;i<itemNames.length;i++){
			var item = document.createElement("div");
			item.className = "controlMenuItem";
			//"i" wont stick to whatever it is when calling onclick so we need to store it somewhere
			item.setAttribute("data-actionnumber",i);
			//no way to get this.selectAction into this context so we need the variableName our object belongs too
			item.setAttribute("onclick",variableName+".selectAction(this.getAttribute(\"data-actionnumber\"))");
			item.appendChild(document.createTextNode(""+i+". "+itemNames[i]));
			this.mainDiv.appendChild(item);
		}
		document.body.append(this.mainDiv);
	}
}
class popupMenu {
	constructor(menuTitle,width,height,leftPos,topPos,innerHtml){
		//for some reason it only lets me make methods here
		this.hideMenu = function(){
			//hide then stop capturing keypresses
			this.mainDiv.hidden = true;
			keyCaptureStack.pop();
		};
		//create main div and start it hidden
		this.mainDiv = document.createElement("div");
		this.mainDiv.className = "popupMenu";
		if(width != "")this.mainDiv.style.width = width;
		if(height != "")this.mainDiv.style.height = height;
		if(leftPos != "")this.mainDiv.style.left = leftPos;
		if(topPos != "")this.mainDiv.style.top = topPos;
		this.mainDiv.hidden = true;
		//create and append title
		var title = document.createElement("div");
		title.className = "menuTitle";
		title.appendChild(document.createTextNode(menuTitle));
		this.mainDiv.appendChild(title);
		//create and append innerHtml
		var item = document.createElement("div");
		item.className = "popupMenuItem";
		item.innerHTML = innerHtml;
		this.mainDiv.appendChild(item);
		//add finished menu to html
		document.body.append(this.mainDiv);
	}
}
//function.prototype is used as a noop for the cancel item
var sortControlMenu = new controlMenu("sortControlMenu","Sorting Control","","","","",
	["cancel","skip file","finish file","request new batch","apply changes"],
	[Function.prototype,sortingSkipFile,sortingFinishFile,sortingRequest,sortingSend]);
var folderControlMenu = new controlMenu("folderControlMenu","Folder Control","","","","",
	["cancel","create folder","rename folder","delete folder"],
	[Function.prototype,folderCreate,folderRename,folderDelete]);
var fileControlMenu = new controlMenu("fileControlMenu","File Control","","","","",
	["cancel","rename file","set external source","delete file","blacklist file"],
	[Function.prototype,fileRename,fileSetExternalSource,fileDelete,fileBlacklist]);
var helpPopupMenu = new popupMenu("Help","","","","",
"help controls:<br>&emsp;h?: open/close help menu<br>selection controls:<br>&emsp;wasd (with no selection): select inital selection<br>&emsp;wasd (with selection): select option in selection<br>");
var sortingRequest = new popupMenu("Sorting Request","","","","",
"Directory: <input type=\"text\" id=\"sortingRequestDirectory\" value=\"unsorted/\"><br>Ammount: <input type=\"number\" id=\"sortingRequestQuantity\" value=5 min=0 max=50><br><input type=\"submit\" onclick=\"sortingRequestSend()\">");
var folderCreate = new popupMenu("New Folder","","","","",
"Folder Name: <input type=\"text\" id=\"folderCreate\" value=\"\"><br><input type=\"submit\" onclick=\"folderCreateApply()\">");
var selectedControlMenu = null;

////////////////////////////////
//data and backend interaction//
////////////////////////////////
var backendResponse = [];
var nextRequest = {"fileSorting" : [], "fileRequests" : []};
var currentImageDirIndex = 0;
var currentImageIndex = 0;
var xhttp = new XMLHttpRequest();

xhttp.onreadystatechange = function(){
	if(xhttp.readyState == 4 && xhttp.status == 200){
		backendResponse = JSON.parse(xhttp.responseText);
		currentImageDirIndex = 0;
		if(backendResponse["requestResponse"] == undefined || backendResponse["requestResponse"].length == 0 || backendResponse["requestResponse"][currentImageDirIndex]["files"].length == 0){
			currentImageIndex = 0;
		}else{
			currentImageIndex = -1; //showNextImage inc this by 1
			updateFolders(backendResponse["requestResponse"][currentImageDirIndex]["subdirectories"]);
			showNextImage();
		}
	}
	//TODO set a gui popup to show that we are waiting for a backen response
}
function showNextImage(){
	currentImageIndex++;
	if(backendResponse["requestResponse"][currentImageDirIndex]["files"].length <= currentImageIndex){
		currentImageDirIndex++;
		currentImageIndex = 0;
		if(backendResponse["requestResponse"].length <= currentImageDirIndex){
			sortingSend();
			return;
		}else{
			updateFolders(backendResponse["requestResponse"][currentImageDirIndex]["subdirectories"]);
		}
	}
	updateViewer(backendResponse["requestResponse"][currentImageDirIndex]["sourceDirectory"]+backendResponse["requestResponse"][currentImageDirIndex]["files"][currentImageIndex]);
}

function moveImageToFolder(folderNumber){
	if(folderNumber >= backendResponse["requestResponse"][currentImageDirIndex]["subdirectories"].length){
		console.error("invalid folder number");
		return;
	}
	nextRequest["fileSorting"].push({
		"localLocation" : backendResponse["requestResponse"][currentImageDirIndex]["sourceDirectory"]+backendResponse["requestResponse"][currentImageDirIndex]["files"][currentImageIndex],
		"destination" : backendResponse["requestResponse"][currentImageDirIndex]["subdirectories"][folderNumber]
	});
	showNextImage();
}
function sortingFinishFile(){
	//STUB
}
function sortingSkipFile(){
	if(backendResponse.length == 0 || backendResponse["requestResponse"].length == 0 || backendResponse["requestResponse"][currentImageDirIndex]["files"].length == 0){
		return;
	}
	showNextImage()
}
function sortingRequest(){
	keyCaptureStack.push("sortingRequest");
	sortingRequest.mainDiv.hidden = false;
}
function sortingRequestSend(){
	sortingRequest.hideMenu();
	nextRequest["fileRequests"].push({
		"directory" : document.getElementById("sortingRequestDirectory").value,
		"ammount" : document.getElementById("sortingRequestQuantity").value
	});
	sortingSend();
}
function sortingSend(){
	updateFolders([]);
	updateViewer("");
	xhttp.open("POST","/backend/sorter.php");
	xhttp.send(JSON.stringify(nextRequest));
	nextRequest = {"fileSorting" : [], "fileRequests" : []};
}
function folderCreate(){
	//STUB
	keyCaptureStack.push("folderCreate");
	folderCreate.mainDiv.hidden = false;
}
function folderCreateApply(){
	keyCaptureStack.pop();
	folderCreate.mainDiv.hidden = true;
	backendResponse["requestResponse"][currentImageDirIndex]["subdirectories"].push(document.getElementById("folderCreate").value);
	updateFolders(backendResponse["requestResponse"][currentImageDirIndex]["subdirectories"]);
}
function folderRename(){
	//STUB
}
function folderDelete(){
	//STUB
}
function fileRename(){
	//STUB
}
function fileSetExternalSource(){
	//STUB
}
function fileDelete(){
	//STUB
}
function fileBlacklist(){
	//STUB
}
