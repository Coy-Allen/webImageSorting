var urlParams = new URL(window.location.href).searchParams;
var dir = urlParams.get("dir");
var start = parseInt(urlParams.get("start"));
var step = parseInt(urlParams.get("step"));
var dirMeta;
//TODO make settings save with user
var settings = {
	//step: 25,
	popupWidth: 700,
	popupHeight: 700
}

//validate input
if(start === null || isNaN(start)){start=0;}
if(step === null || isNaN(step)){step=25;}
if(dir === null){dir="";}

listFiles(dir,start,start+step);

function listFiles(dir,start,end){
	//query the backend
	var folders;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState != 4 || xhttp.status != 200) return;
		parseFileList(JSON.parse(xhttp.responseText));
	};
	xhttp.open("GET", "/backend/listFiles.php?dir="+dir+"&start="+start+"&end="+end, true);
	xhttp.send();
	//set the html to show what image we are on
	var currentPicNumbers = document.getElementsByClassName("currentPicNumber");
	currentPicNumbers[0].innerHTML = start;
	currentPicNumbers[1].innerHTML = start;
}
function parseFileList(list){
	/*
	 * list[i] has the following properties:
	 *   properties given by listFiles.php:
	 *     src - file location relative to web root
	 *     thumb - location of (thumbnail) image to display instead of src relitive to web root
	 *       php sets this as null for folders, to a thumbnail if the image is in
	 *       the db and to the original image otherwise
	 *   properties given by this js function:
	 *     pathParts - split src into list of parrent folders and filename
	 *     fileName - the file name
	 *     fileExt - the file extention
	 *     type - the general type of file (folder,image,video,unknown)
	 */

	//directory metadata is in index 0 and files/folders start at 1
	var pictureHolder = document.getElementById("pictureHolder");
	var fileName;
	var fileExt;
	dirMeta = list[0];
	//TODO show dirMeta in page somewhere
	for(var i=1;i<list.length;i++){
		list[i].pathParts = list[i].src.split(/[\\\/]/g);
		list[i].fileName = list[i].pathParts.pop();
		list[i].fileExt = list[i].fileName.split(".").pop();
		//folders dont have filenames
		if(list[i].fileName === ""){
			//folders name should be next in the parts list if not then we are at the base dir
			list[i].fileName = list[i].pathParts.pop();
			if(list[i].fileName === undefined){list[i].fileName = "/";}
			list[i].thumb = "/images-server/folder.png";
			list[i].type = "folder";
			createPicture(list[i],pictureHolder);
		}else{
			switch(list[i].fileExt.toLowerCase()){
			//undesired image formats
			case "jpeg":
				//not from 4chan
				console.log("WARN: "+list[i].fileExt+" image found "+list[i].fileName);
			//desired image formats
			case "png": case "jpg": case "gif":
				list[i].type = "image";
				createPicture(list[i],pictureHolder);
				break;
			//undesired video formats
			case "mp4":
				//not from 4chan
				console.log("WARN: "+list[i].fileExt+" video found "+list[i].fileName);
			//desired video formats
			case "webm":
				list[i].type = "video";
				list[i].thumb = "/images-server/video.png";
				//TODO show real videofile
				createPicture(list[i],pictureHolder);
				break;
			//unknown or no ext
			default:
				list[i].type = "other";
				console.log("WARN: "+list[i].fileExt+" unknown found "+list[i].fileName);
				//cant decide whether to replace the thumb or not. will replace for now
				list[i].thumb = "/images-server/documents.png";
				createPicture(list[i],pictureHolder);
				break;
			}
		}
	}
}
function createPicture(pictureInfo,parentNode){
	/* html if its an image:
	 * <a><div><img></img><span></span></div></a>
	 * <a class="pictureLink" href="javascript:window.open("/images/dump/00009aeff717bade5013acc9f7b542f5.jpg","","width=700,height=700")">
	 *   <div class="pictureFrame">
	 *    <img src="/images/dump/00009aeff717bade5013acc9f7b542f5.jpg" class="picture">
	 *    <span class="pictureName">00009aeff717bade5013acc9f7b542f5.jpg</span>
	 *  </div>
	 *  </a>
	 *
	 *  html if its a folder
	 * <a><div><img></img><span></span></div></a>
	 * <a class="pictureLink" href=""/viewer.html?dir=/dump/&start=0&step=25"">
	 *   <div class="pictureFrame">
	 *    <img src="/images-server/folder.png" class="picture">
	 *    <span class="pictureName">dump</span>
	 *  </div>
	 *  </a>
	 *
	 *  html if its a video
	 *  TODO
	 */
	//create <a> tag with CSS
	link = document.createElement("a");
	link.setAttribute("class","pictureLink");
	//link will travel through folders while
	//opening everything else in a popup window
	//create href based on type
	if(pictureInfo.type === "folder"){
		link.setAttribute("href",getRedirectUrl(pictureInfo.src,0,step));
	}else{
		link.setAttribute("href","javascript:window.open(\""+pictureInfo.src+"\",\"\",\"width="+settings.popupWidth+",height="+settings.popupHeight+"\")");
	}
	//create div with CSS
	var pictureFrame = document.createElement("div");
	pictureFrame.setAttribute("class","pictureFrame");
	//create picture/video with CSS
	var picture;
	//video
	if(pictureInfo.type === "video"){
		//FIXME replace with real video instead of this placeholder
		//picture = document.createElement("video");
		picture = document.createElement("img");
		picture.setAttribute("src",pictureInfo.thumb);
	//image/folder
	}else if(pictureInfo.type === "image" || pictureInfo.type === "folder"){
		picture = document.createElement("img");
		picture.setAttribute("src",pictureInfo.thumb);
	//other/unknown
	}else{
		//NOTE: while i could combine this and image/folder i want to keep these seperate
		//just incase we decide to have another type of file
		picture = document.createElement("img");
		picture.setAttribute("src",pictureInfo.thumb);
	}
	picture.setAttribute("class","picture");
	//create span with CSS and set name
	fileName = document.createElement("span");
	fileName.setAttribute("class","pictureName");
	fileName.innerHTML = pictureInfo.fileName;
	//build and insert node tree into html
	link.appendChild(pictureFrame);
	pictureFrame.appendChild(picture);
	pictureFrame.appendChild(fileName)
	parentNode.appendChild(link);
}
function changePage(direction){
	//TODO fix my fuckup with links, href, redirects, functions, and onclick
	//	see stackoverflow.com/questions/3338642/
	//true is positive/right
	if(direction){
		if(start >= dirMeta.imageCount-step){return;}
		start += step;
	}else{
		if(start <= 0){return;}
		start -= step;
	}
	if(start > dirMeta.imageCount-step){start = dirMeta.imageCount-step;}
	if(start < 0){start = 0;}
	window.location.href = getRedirectUrl(dir,start,step);
}
function getRedirectUrl(newDir,newStart,newStep){
	return "/viewer.html?dir="+newDir+"&start="+newStart+"&step="+newStep;
}
