WHAT WORKS:
viewing images with viewer.html
duplicate removal with dupeCheck.html

WHAT DOESNT WORK:
uploading files via http. rsync or scp them into images/dump for now
thumbnails for files. god do i hate imagemagic
sorting files but im working on it. everything is just going to be vomited into images/unsorted 

SETUP:
setup apache, php, and mysql
webroot should be at htdocs folder (aka you shouldnt be able to access this file via web interface)
create mysql database with these tables:
	images ((bin*64) sha512, (bin*16) md5, (unsigned-tinyint) state, (unsigned-int) popularity, (string) local_location, (string) external_location)
make the serviceConfig.php file and fill in the correct info
make the htdocs/images folder and immediate subfolders
recomended permisions (run in same folder as serviceConfig.php and README.txt)
umask 0027                              ;makes all new files rw-r-----
chown -R webadmin:apache .              ;set this to your account and webgroup
chmod -R 640 .                          ;owner has full perms while web server has read
find . -type d -exec chmod ug+x {} +    ;give web server and owner execute on directiories
find . -type d -exec chmod g+s {} +     ;make sure new items have the correct group
chmod -R g+w htdocs/images/*            ;give web server write on our images
