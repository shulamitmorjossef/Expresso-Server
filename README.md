README.md

Expresso ☕

A website for selling coffee machines and capsules, built with:

Backend: Node.js + Express

Frontend: React

Steps to install and run the project:

1. Install Node.js along with npm:

If Node.js and npm are not installed:
- Go to the official Node.js website and download the installer from the following link: https://nodejs.org/en.
- Install Node.js, which will also install npm along with it.


- Make sure the PATH is set correctly by following these steps:
o Open the Control Panel and click on "System and Security".
o Click on "System" and then on "Advanced System Settings".
o Click on "Environment Variables".
o Under "System Variables", look for the "Path" variable and click "Edit".
o Add the path to the folder where npm is installed (usually something like C:\Program Files\nodejs\).
o Click "OK" to save the changes and restart your computer.

2. Download the server code:
Git link: https://github.com/shulamitmorjossef/Expresso-Server.git 
3. Download the client code:
Git link: https://github.com/shulamitmorjossef/Expresso-Client.git
4. Important:
Create a .env file inside the server folder
Before starting the server, you must create a .env file inside the root directory of the server project,
and add the following lines inside:
env
Copy code
DATABASE_URL=postgresql://expresso_aikk_user:IY43DxnKCHDePkauNcgzP2iy4gkQT6FD@dpg-d03uq1ngi27c73b3hfbg-a.frankfurt-postgres.render.com/expresso_aikk
PORT=3000
Make sure the file is named exactly .env (no .txt extension).
Save the file inside the server's main directory.
5. Start the server using the commands:
- npm install
- npm start
6. Start the client using the commands:
- npm install
- npm start
