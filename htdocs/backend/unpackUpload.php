<?php
header("Cache-Control: no-cache");
#this goes through the upload folder and extracts all zip files to dump.

include('../../serviceConfig.php');

foreach(glob($imageLocation["upload"]."*.zip") as $file){
	exec("unzip ".$file." -d ".$imageLocation["dump"]."/".$file);
	unlink($file);
	echo "extracted ".$file;
}

#fix any weak permissions that the zip could have
#cant change ownership or group so it stays apache:apache
exec("chmod -R 660 ".$imageLocation["dump"]);
exec("find ".$imageLocation["dump"]." -type d -exec chmod -R ug+x {} +");
echo "permissions fixed"
?>
