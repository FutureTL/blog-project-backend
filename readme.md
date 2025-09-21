This is my personal blog project. I am building it from scratch, and the knowledge I gathered from watching Hitesh's backend series.

Here I will be specifying the entire steps I am following.

1. Create a folder with any name you want.
2. Set up node js environment using the command-
            npm i node

Now you will see a package.json file is created.
3. Now, you write the initialization command that adds more info to your package.json file
            npm init

As you write this command, a number of entries will be asked, fill them accordingly.

4. Create a readme.md file, where you can add any information related to your project like I am.
   -md extension stands for markdown language.

Metadata- data giving information about some other data.

-package.json file is a json file that lies in the root directory of the project and contains human-readable metadata about the project. 
As you initialized your project, like the name of the project, the version, author etc.

Difference between Dev dependency and Dependency in package.json file
-Dev dependencies help during development of code not when it is in production. Eg- nodemon or prettier.
-Dependencies needed while writing code and also later in production. like any package i install-cors, multer.

We will use two basic dev dependencies which are included in all projects-
         1.nodemon
         2.prettier
      
-we can install them as-
         npm i -D nodemon 
         npm i -D prettier

-D here signifies that both these are being installed as dev dependencies.

External modules are used in 2 ways-
   1. require (which doesn't require any changes )
   2. import statements (refer below article)
   -we can add "type"
:"module" in our package.json file.

link for more info: https://herreranacho.medium.com/using-import-instead-of-require-in-node-js-1957ff5ed720

         CONNECTING THE DATABASE
-one major issue I faced:
I was getting mongodb connection error. My mistake I had not imported the dotenv file properly. For that we have to write
         1.import dotenv from "dotenv"
         2. In the same file where we have imported it, we also have to configure it as-
         dotenv.config({
            path: './env'
         })
         3. we have to make some changes in the scripts in package.json. EWHY? because this method of importing dotenv is not directly supported right now so we have the scripts value as-
"nodemon -r dotenv/config --experimental-json-modules src/db/connect.js"

After this the problem was solved.

Read about the dependencies- 
   1. cookie-parser(https://expressjs.com/en/resources/middleware/cookie-parser.html)

   

One important mistake I made during the project- i forgot to add .gitignore file in my project resulting in my .env file being exposed in the github repository. So revert this-
   1. Add .gitignore file in the project and write 
   .env in it. 
   2. in the bash terminal, write git rm --cache .env
   3. commit the changes and push them.

The problem is solved! 

//some information needs to be added here
June 8th 2025
- access and refresh tokens generated in our user model code.

Json web token -https://github.com/dwyl/learn-json-web-tokens/blob/main/README.md
- now I have to write logic for registering and logging the user.

1. Register user logic will be written in  user.controller.js

I wrote the entire register user logic along with also modifying the code of the routes to finally check it on postman. 
I was getting the bug- avatar image not found (user.controller.js line 62)

Solution: I changed upload.single used in multer.middleware.js code to -> upload.fields and the problem got resolved.

2. While logging in the user I got an error in postman- req.body cannot be destructured.

Solution: In postman I had set body and then form-data, so this format expects a middleware like multer because it is used for sending files also along with normal text values. 
   - I had to select raw in body and actually send json data. Caution: for this your app.js should have app.use(express.json())

Error: cannot access "USER" before initialization.
I am getting the error from using User reference in personal_blog.model.js line 12.
- ONE reason why this error might be obtained is due to circular dependency, we are calling personalBlog in User and User in personalBlog. lets see.
-solution- lol! The problem was not circular dependency. I will not putting the name of the reference in " ". I had to write ref: "User" , not User.

OK, so now I have written the logic for tech-blogs and personal-blogs, its time to test it. Since I don't have any blogs written and both these routes have get request, we have to use a different way of testing.
- 