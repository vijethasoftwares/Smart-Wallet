
steps to run Authentication system apis project
=============================

step-1:
======
Install node js (if you haven't installed)
website url: https://nodejs.org/en

step-2:
======
Login in the mongodb database and create a new cluster and database
website url: https://www.mongodb.com/

step-3:
======
change the mongodb string in the (.env) file (MONGO_URL) with own database, username and password

step-4:
======
open terminal and go to the root director and run the server file
command for start server: `npm start`


Also use the enhanced Usermodel and keep that in mind only after auth from server 1 ,server 2 can be accessed with get /profile. 
