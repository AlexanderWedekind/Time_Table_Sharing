Using this to log things I learned while doing this project, and to take notes, for later reference for future projects and to make sure I don't lose important lessons learned by doing this.
See [_**Development Log**_](./development-log.md) for things I've done.

Back to [_**README**_](./README.md).

Not sure about how I will layout this. Will experiment and see what's most usefull.

## 30/12/24

### Use .env on frontend and sbackend

(this isn't really neccesary for this project since the repo and source code is public anyway, but for a real project in production this will be neccesary, and definitely for keeping any api keys out of the repo, hobby project or otherwise, so I'm doing it here anyway as a learning exercise)

In order to keep source maps out of the repo and out of production code, to protect source code, I'm learning here how to use environment variables in .env files on both front and backend. The node build script also set env vars at the time of build, so I maybe don't need the .env file for the front end, but I will need one for the back end as far as I can tell. The env vars on backend I will also use to programatically change the path served from, depending on prod or dev. 

#### Frontend:

Had to npm install 'cross-env' first, so that I can write the terminal scripts so that setting ENV variables in the terminal command (eg: env=prod or env=dev),  before bundling, work on both win, linux and mac.

#### Back end:

It appears that env vars are by default local machine base in .NET. First install the DotNetEnv pachage that lets you use a .env file instead. the install command would not work; looking online I found other's had same problem and doing 'dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org' was the solution. Apparently installing chocolaty results in the url for the packages to not be present in a config file anymore, and that command put it back, I think.

After that in the c# source file:
using DotNetEnv;
Env.Load();
string envVar = Environment.GetEnvironmentVariable("envVar")
then use to programatically change paths.

Commits related to this:
commit d87846aca00195e2fe553ccfa1f9de6464c97424
commit 0974435c16c96db9761f3b52a2b68aea6232603c
commit e0bd02883dbe89e7486b40ec804c53b49219e3ab
See below 'debug client side js' as well.

### Debug client side js

Couldn't debug the js as error only showed up after bundling and serving. Wasn't able to tell wher in source code error comes from as the client's erroe message stack trace just refers to the bundled code, not the source code. Here's what to do:

- create source map while bundling with esbuild; flag: --sourcemap
- this will be inline in code.
- to protect sourcecode (if not public anyway) make source map hidden; flag: --sourcemap=hidden
- delete comment in bundled code, linking to the sourcemap, to prevent browser automatically looking for it
- another option: have soucemap available only in development Serve app locally and debug. don't expose source file in production.
- to debug locally: in stall sourcemad explorer; npm install -g source-map-explorer; run it on bundled code and the map: source-map-explorer [bundled code].js [bundled code].js.map
- can also debug locally in vscode with the .map file and use that to locate original error; source-map-explorer toll does this

## 26/12/26

### To do later:

Notes for things to find out for hosting on my own pc, rather than a free webhosting service:
- find my router's ip address
- find out how to forward my pc's port
- find out how to tell router to forward requests to the right computer based on the port in the request (usually called: port forwarding, or found in NAT settings)
- find out if my ip is static or if it changes
- find out how to keep the pc listening to the port (this might not need attention, but might need firewall setting changed)
- find out about free DNS services for a subdomain
- if my ip is not static: find out if I need a service that dynamically updates my ip linked to my domain

## 25/12/24

Added a Mithril SPA. At first I couldn't get it served. 
Directoru.GetCurrentDirectory() finds the absolute path to current directory. I had put the mithril spa page in a different folder than the server. So that didn't work cause getcurrentdirectory() returned 'C:/absolute_path/repository_name/server', when I needed it to be 'C:/absolutepath/repository_name/front_end'. I could have just moved the mithril app, would have been the easiest, but it made sense to me that server and frontend were in different directories. I wanted to get the path dynamically, rather than hardcoding it, because it might be different in the docker container, so I found a way to remove the last 'folder' from the string. Don't know if this will work once deployed; if getcurrentdirectory() works relative to the root folder on a docker container. Need to find out, or if there's a better way.

commit 81d2df96a766a130cdef424040e81d3b11f629a8

Mithril:

m.mount(root, ...) puts the content into the component, updates the component automatically every time content changes, no page reload.

m.render(root, ...) on the other hand puts content into the component, but no automatic updates. Instead you call m.render again to update at time of your choosing.


## 23/12/24

Serving the html file directly, by hard coding the path to the file works. But when using 'context.Request.Url.LocalPath' to retrieve the path from the request sent by the client and then using that as the path to serve the file from, appears to cause the server to look for a favicon.ico file. When it can't fine this the server has an unhandled exception and crashes.

it didn't seem like it was supposed to work like that: if one user sends a request that can't be found then the server crashes for everyone and just stops, untill someone starts it up again.

Tried wrapping the code in a try catch block and writing the error message to the console and that seemed to stop the program crashing even though the error still occured and the page is now also served.

I'm not sure if the request handling for that specific request still stops at that point. If maybe the html file gets served, because that happens earlier in the order of things, and then later on the exception stops it further progressing. Like I can get it to serve the page but then maybe other things like retrieving data from a database will still be interrupted? All I know at this point is that the server itself doesn't crash and it will still carry on listening to further responses. Will experiment to find out which is the case. 

commit 7a9bbbc9f59c472d741327d59556127e4bd511c7