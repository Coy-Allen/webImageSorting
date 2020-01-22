
<?php
header("Content-Type: text/event-stream");
header("Cache-Control: no-cache");

echo "event: startup".PHP_EOL;
echo "data: ".PHP_EOL;
endEvent();

#setup database, folder locations, and file list
include('../../serviceConfig.php');
$db = mysqli_connect($dbConfig['host'],$dbConfig['username'],$dbConfig['password'],$dbConfig['dbname']);
$files = array();
#find all files and put them into an array
$fileCount = 0;
foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($imageLocation["dump"],FilesystemIterator::SKIP_DOTS)) as $key => $value){
	array_push($files,$key);
	++$fileCount;
}

#stats and session storage
$thisUpdate = array(
	"localLocation" => "",
	"fileNum" => 0,
	"sha512" => "",
	"md5" => "",
	"newCount" => 0,
	"dupeCount" => 0,
	"errors" => 0,
	"warnings" => 0,
	"message" => ""
);
$lastUpdate = array();
#setup db statements. sqlData is used as statements turn data into refrences.
#this makes it a requirement to seperate the data from our thisUpdate var.
$sqlData = array("sha512" => "", "md5" => "", "localLocation" => "");
$dbCheckExists = mysqli_prepare($db, "SELECT count(1) FROM `".$dbConfig['tbname']."` WHERE `sha512`=UNHEX(?)");#sha512
$dbUpdatePopularity = mysqli_prepare($db, "UPDATE `".$dbConfig['tbname']."` SET `popularity`=`popularity`+1 WHERE `sha512`=UNHEX(?)");#sha512
$dbAddEntry = mysqli_prepare($db, "INSERT INTO `".$dbConfig['tbname']."`(`sha512`, `md5`, `popularity`, `local_location`) VALUES (UNHEX(?), UNHEX(?), 1, ?)");#sha512, md5, *state*, popularity, local_location, *external_location*
mysqli_stmt_bind_param($dbCheckExists, "s", $sqlData["sha512"]);
mysqli_stmt_bind_param($dbUpdatePopularity, "s", $sqlData["sha512"]);
mysqli_stmt_bind_param($dbAddEntry, "sss", $sqlData["sha512"], $sqlData["md5"], $sqlData["localLocation"]);

echo "event: starting".PHP_EOL;
echo "data: ".json_encode(array("fileCount" => $fileCount)).PHP_EOL;#give fileCount to client
endEvent();

#$thisUpdate = array("newCount" => 0, "dupeCount" => 0, "errors" => 0, "warnings" => 0);
#loop through each file in our dump folder
for($i=0;$i<$fileCount;$i++){
	#set vars for this file and reset timer
	set_time_limit(30);
	$thisUpdate["fileNum"]++;
	$thisUpdate["localLocation"] = $files[$i];
	$hashes = hashesFromFile($thisUpdate["localLocation"]);
	$thisUpdate["sha512"] = $hashes["sha512"];
	$thisUpdate["md5"] = $hashes["md5"];
	$thisUpdate["message"] = "";
	$sqlData["sha512"] = $thisUpdate["sha512"];
	$sqlData["md5"] = $thisUpdate["md5"];
	$sqlData["localLocation"] = $thisUpdate["localLocation"];
	#querry the DB for the sha512
	mysqli_stmt_execute($dbCheckExists);
	mysqli_stmt_bind_result($dbCheckExists, $exists);
	mysqli_stmt_fetch($dbCheckExists);
	mysqli_stmt_free_result($dbCheckExists);
	if($exists){
		#sha512 exists. delete and increase the image popularity
		$thisUpdate["dupeCount"]++;
		mysqli_stmt_execute($dbUpdatePopularity);
		unlink($thisUpdate["localLocation"]);
	}else{
		#this is a new image
		$thisUpdate["newCount"]++;
		#TODO add image size to DB
		#list($imageWidth, $imageHeight) = getimagesize($thisUpdate["localLocation"]);
		#rename the file to (unsorted dir)/(md5 in hex).(image ext)
		$newLocalLocation = $imageLocation["unsorted"].$thisUpdate["sha512"].".".pathinfo($thisUpdate["localLocation"],PATHINFO_EXTENSION);
		if(file_exists($newLocalLocation)){
			#there is a file here that has the same name (sha512 and ext)
			#this could be from a DB wipe or error but since it SHOULD be the same file it SHOULD be fine...
			#i wont chance it though
			$thisUpdate["message"] .= "WARN: ".$newLocalLocation." exists in unsorted folder.\n";
			$thisUpdate["warnings"]++;
		}else{
			#move image to new location and add it to the DB
			rename($thisUpdate["localLocation"],$newLocalLocation);
			$thisUpdate["localLocation"] = $newLocalLocation;
			$sqlData["localLocation"] = $newLocalLocation;
			mysqli_stmt_execute($dbAddEntry);
		}
		#FIXME
		#make thumbnail with name (thumbnail dir)/(md5 in hex).png
		#$thumbnailName = $imageLocation["thumbs"].$thisUpdate["md5"].".png";
		#if(file_exists($thumbnailName)){
			#there is a file here that has the same name (md5)
			#this could be from a DB wipe or error but since it SHOULD be the same file it SHOULD be fine...
			#i wont chance it though
			#$thisUpdate["message"] .= "WARN: ".$thisUpdate["md5"]." exists in thumbs folder.\n";
			#$thisUpdate["warnings"]++;
		#}else{
			#FIXME wont work for video files. use ffmpeg
			#  FIXME ffmpeg scares me
			#make a 500x500 thumbnail. dont scale up if its smaller.
			#TODO get thumbnails to work
			#exec("bash -c \"exec nohup setsid convert ".$thisUpdate["localLocation"]." -thumbnail '500x500>' ".$thumbnailName." > /dev/null 2>&1 &\"");
		#}
	}
	#send file info to client if the data has updated
	echo "event: update".PHP_EOL;
	echo "data: ".json_encode(
		array_diff_assoc($thisUpdate, $lastUpdate)
	).PHP_EOL;
	endEvent();
	#keep track of last update so we know what not to resend
	$lastUpdate = $thisUpdate;
}

#if dump folder has no files then clear it of folders
echo "event: update".PHP_EOL;
if(exec("find ".$imageLocation["dump"]." -type f") == ""){
	exec("rm -rf ".$imageLocation["dump"]."*");
	echo "data: ".json_encode(array("message" => "dump folder cleared")).PHP_EOL;
}else{
	echo "data: ".json_encode(array("message" => "dump folder NOT clear")).PHP_EOL;
}
endEvent();

echo "event: stoping".PHP_EOL;
echo "data: ".PHP_EOL;
endEvent();

function hashesFromFile($file){
	$fp = fopen($file,"r");
	$ctxMd5 = hash_init("md5");
	$ctxSha512 = hash_init("sha512");
	while(!feof($fp)){
		$buffer = fgets($fp,65536);
		hash_update($ctxMd5,$buffer);
		hash_update($ctxSha512,$buffer);
	}
	return array(
		"md5" => hash_final($ctxMd5),
		"sha512" => hash_final($ctxSha512)
	);
}

function endEvent(){echo PHP_EOL;ob_flush();flush();}
?>
