<?php
header("Content-Type: application/json");
header("Cache-Control: no-cache");
include('../../serviceConfig.php');
#dir will be the images server plus GET's dir var. replaces // with / and removes .. for security reasons
@$dir = preg_replace("/[\/]{2,}/","/",str_replace("..","/",$imageLocation["images"].$_REQUEST["dir"]."/*"));
@$start = $_REQUEST["start"];
@$end = $_REQUEST["end"];
#what to send to the client
$response = [];
#init database and setup our statement
#we need the database to get the md5 of any files we find
$db = mysqli_connect($dbConfig['host'],$dbConfig['username'],$dbConfig['password'],$dbConfig['dbname']);
$sqlData = array("localLocation" => "");
$dbGetSha512 = mysqli_prepare($db, "SELECT `sha512 FROM images WHERE LOCATION=(?)");
mysqli_stmt_bind_param($dbGetSha512, "s", $sqlData["localLocation"]);

#search files.
$files = glob($dir);
$imageCount = count($files);

#validate and correct input
if($imageCount > 0){
	if(!ctype_digit($start) or $start < 0 or $start >= $imageCount){$start = 0;}#if start is invalid then default is 0
	if(!ctype_digit($end) or $end < 1){$end = $start + 25;}#if end is invalid then default is start plus 25
	if($end > $imageCount){$end = $imageCount;}#if end is too high from input or default then set it at the max
	if($end <= $start){$end = $start+1;}#if end is before start then only show one image 
}else{$start=0;$end=0;}
#data about the directory
array_push($response,array(
	"imageCount"=>$imageCount
));

#add parent dir link
if(strlen($dir) > strlen($imageLocation["images"])+1){addFile(dirname($dir,2));}
#get file type
for($i=$start;$i<$end;++$i){
	addFile($files[$i]);
}

#convert to json and send
echo json_encode($response);

function addFile($file){
	global $response,$sqlData,$dbGetSha512,$imageLocation;
	#if its a directory then we dont need sha512 checking
	if(is_dir($file)){
		array_push($response,array(
			"src" => substr($file."/",strlen($imageLocation["images"])),
			"thumb" => false
		));
	}else{
		#find sha512 of file
		$sqlData["localLocation"]=$file;
		mysqli_stmt_execute($dbGetSha512);
		mysqli_stmt_bind_result($dbGetSha512, $sha512);
		mysqli_stmt_fetch($dbGetSha512);
		mysqli_stmt_free_result($dbGetSha512);
		$thumbnail=$imageLocation["thumbs"].bin2hex($sha512).".png";
		#if we cant find a thumbnail then dont use one
		if(is_null($sha512) or !file_exists($thumbnail)){
			#TODO throw error
			$thumbnail=$file;
		}
		array_push($response,array(
			"src"=>substr($file,strlen($_SERVER['DOCUMENT_ROOT'])),
			"thumb"=>substr($thumbnail,strlen($_SERVER['DOCUMENT_ROOT']))
		));
	}
}
?>
