var strm = new EventSource("backend/dupeCheck.php");
var progress = document.getElementById("progress");
var path = document.getElementById("localLocation");
var sha512 = document.getElementById("sha512");
var md5 = document.getElementById("md5");
var newCount = document.getElementById("newCount");
var dupeCount = document.getElementById("dupeCount");
var errors = document.getElementById("errors");
var warnings = document.getElementById("warnings");
var messages = document.getElementById("messages");
var startData;
strm.addEventListener("stoping", function(e){
	strm.close();
},false);
strm.addEventListener("update", function(e){
	updateGUI(JSON.parse(e.data));
},false);
strm.addEventListener("starting", function(e){
	messages.innerHTML = "";
	startData = JSON.parse(e.data);
},false);
strm.onmessage = function(e){
	console.log(e);
};
function updateGUI(data){
	if("fileNum" in data){progress.innerHTML = data.fileNum+"/"+startData.fileCount;}
	if("localLocation" in data){path.innerHTML = data.localLocation;}
	if("sha512" in data){sha512.innerHTML = data.sha512;}
	if("md5" in data){md5.innerHTML = data.md5;}
	if("newCount" in data){newCount.innerHTML = data.newCount;}
	if("dupeCount" in data){dupeCount.innerHTML = data.dupeCount;}
	if("errors" in data){errors.innerHTML = data.errors;}
	if("warnings" in data){warnings.innerHTML = data.warnings;}
	if("message" in data){
		messages.innerHTML += data.message;
		messages.scrollTop = messages.scrollHeight;
	}
}
