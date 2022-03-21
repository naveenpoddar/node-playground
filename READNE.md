# Node playground

Node playground is a basic web based code IDE for the development of web technologies

This currently supports just two templates we will add more in the future

## Technologies used and why?

**NextJS, TS, Monaco Editor, Xterm.js, Docker Containers**: I planned to use these 5 technologies from the beginning.

**Redux**: There will be a state which stores everything that goes in the playground.

**Axios**: I could just used the built in fetch api but because i did not had enough time for he configuration part i went with axios (i look forward to use fetch api in the future for performance)

**Socket.io**: For this his part i used socket.io because i think it's a good tool for Initializing sockets

**Sass**: CSS sometimes gets in the way when nesting styles it becomes hard, sass here saves the way by providing great features to css like variables, mixins and nestings

And for the Server part i used these technologies listed:

1. **Express**
2. **Dockerode**
3. **Pino**
4. **Mongoose/Typegoose**
5. **Net**

## How does the playground works

1. After the desired template selection the server creates a playground object on the database and gives the user a playground id which can later be used to access the playground (note that only the browser which created the playground can access the playground editor environment)

2. When the playground page loads the server creates a docker container with the image containing the user's desired template and starts a interactive server on the container (Note: the container exposes 2 ports [**5858**: For viewing the app, **7777**: The Interactive server running on the container] this container server is used to read/write/remove and do things like that on the container as per the command by the server.

3. I used "net" package to create tunnels to the container so that everyone out there on the internet can access the apps.

4. The docker engine runs on a aws ec2 instance aswell as the server whereas the front-end part is Fully hosted on vercel.

5. As for saving user data, when the client disconnects the server backups all the files and saves it into the database and the next time when the playground is being open the server than loads the files from the db to the container.

6. There is a runtime config (rc.config) in your root project to configure actions like the install script which runs when the playground is loaded and the run script which will run after clicking the run button.

Working App Url: https://playground.cursor.works

## Installation

To contribute or use the source code first of all you need to install these required dependencies:

1. **Docker Desktop/Engine**
2. **Node => 16.x**

Now clone the repository using `git clone`

Install all the dependencies using:

```bash
cd frontend && npm ci
cd backend && npm ci
```

Now you need to build the docker images, for that go to the build folder and run the build-files.sh script and give type your password

```bash
cd build && ./build-files.sh
```

### Configuration

Next change the config files and add a .env into backend to add mongoose connection string

Here are the list of all the configuration files

```
frontend/src/config.ts
backend/src/config.ts
backend/.env
```

**That's it you're done with the setup**

### Ussage

Run server and client with

```
Client: npm run dev
Server: npm run dev
```

**Thanks for visiting this repository!**

If you have any queries regarding this project email me at cursor56789@gmail.com.
