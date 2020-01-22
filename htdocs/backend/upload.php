<?php
header("Cache-Control: no-cache");
#this file might be useless. most uploads will be multiple gigabytes large and as such it can be done with php but not recomended
exit();

include('../../serviceConfig.php');
$finalLocation = $imageLocation["upload"].basename($_FILES["file"]["name"]);

if(file_exists($finalLocation)){
	exit("ERROR: file exists");
}


move_uploaded_file($_FILES["file"]["tmp_name"],$finalLocation) ? exit("INFO: file uploaded") : exit("INFO: file uploaded");


?>
