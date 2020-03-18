
<?php
header("Content-Type: application/json");
header("Cache-Control: no-cache");

/*
	***receved***
	<post REQUEST=<json>>
	{
		"fileSorting":[
			{
				"localLocation": "unsorted/000.png",
				"destination": "p/"
			},
			{
				"localLocation": "unsorted/fileDoesntExist.parchment",
				"destination": "np/"
			},
			{
				"localLocation": "unsorted/111.png",
				"destination": "newFolder/"
			},
		],
		"fileRequests":[
			{
				"directory": "unsorted/",
				"ammount": 1
			},
			{
				"directory": "unsorted/np/",
				"ammount": 1
			}
		]
	}

	***response***
	<json>
	{
		"sortResults":{
			"filesMoved": 2,
			"errors": 1,
			"warnings": 0,
			"messages": "ERROR: file not found\n"
		},
		"requestResponse":[
			{
				"sourceDirectory": "images/unsorted/",
				"files": [
					"AAA.png"
				],
				"subDirectories":[
					"np",
					"p"
				]
			},
			{
				"sourceDirectory": "images/unsorted/np/",
				"files": [
					"BBB.png"
				],
				"subDirectories":[
					"memes",
					"reactionImages",
					"gore",
					"other"
				]
			}
		]
	}
*/
#setup database, folder locations, and file list
include('../../serviceConfig.php');


#unpack json POST
$postJsonData = json_decode(file_get_contents("php://input"),true);

$responseJsonData = [];

if($postJsonData["fileSorting"]){
	//the database is only used if we need to do file sorting
	$db = mysqli_connect($dbConfig['host'],$dbConfig['username'],$dbConfig['password'],$dbConfig['dbname']);
	$sqlData = array("localLocation" => "","sha512" => "");
	$dbUpdateLocation = mysqli_prepare($db, "UPDATE `".$dbConfig['tbname']."` SET `local_location`=? WHERE `sha512`=UNHEX(?)");
	mysqli_stmt_bind_param($dbUpdateLocation, "ss", $sqlData["localLocation"], $sqlData["sha512"]);
	$sortingResponse = array(
		"moved" => 0,
		"errors" => 0,
		"warnings" => 0,
		"messages" => ""
	);
	foreach($postJsonData["fileSorting"] as $fileSorting){
		$directory = $_SERVER['DOCUMENT_ROOT'].dirname($fileSorting["localLocation"])."/".$fileSorting["destination"];
		if(!is_dir($directory)){mkdir($directory);}
		$newLocation = $directory."/".pathinfo($fileSorting["localLocation"], PATHINFO_BASENAME);
		if(rename($_SERVER['DOCUMENT_ROOT'].$fileSorting["localLocation"], $newLocation)){
			//file move worked. update database
			$sqlData["localLocation"]=$newLocation;
			$sqlData["sha512"]=hash_file("sha512",$newLocation);
			mysqli_stmt_execute($dbUpdateLocation);
			$sortingResponse["moved"]+=1;
			#$sortingResponse["messages"].=$newLocation."\n";
		}else{
			#$sortingResponse["messages"].="";
			$sortingResponse["warning"]+=1;
		}
	}
	$responseJsonData["sortResults"] = $sortingResponse;
}
if($postJsonData["fileRequests"]){
	$requestResponse = array();
	foreach($postJsonData["fileRequests"] as $fileRequest){
		if(1 > $fileRequest["ammount"]){$fileRequest["ammount"] = 5;}
		#FIXME check to see if directory is valid. this is a security risk
		#FIXME add default if directory is not specified
		#this will be put into our response
		$responsePart = array(
			"sourceDirectory" => substr($imageLocation["images"].$fileRequest["directory"],strlen($_SERVER['DOCUMENT_ROOT'])),
			"files" => null,
			"subdirectories" => null
		);
		#get files from directory
		$files = glob($imageLocation["images"].$fileRequest["directory"]."*");
		foreach($files as $key => $file){
			#remove any directories from list
			if(is_dir($file)){unset($files[$key]);}
			#cut the filenames to just the basename
			else{$files[$key] = basename($file);}
		}
		#reindex and only send "ammount" of files
		$responsePart["files"] = array_slice(array_values($files),0,$fileRequest["ammount"]);
		#get subdirectories
		$responsePart["subdirectories"] = glob($_SERVER['DOCUMENT_ROOT'].$responsePart["sourceDirectory"]."*",GLOB_ONLYDIR);
		foreach($responsePart["subdirectories"] as &$subdir){
			#cutoff everything but the foldername
			$subdir = substr($subdir,strrpos($subdir,'/')+1);
		}
		unset($subdir);
		array_push($requestResponse,$responsePart);
	}
	$responseJsonData["requestResponse"] = $requestResponse;
}

echo json_encode($responseJsonData);
?>
