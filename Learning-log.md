Using this to log things I learned while doing this project, and to take notes, for later reference for future projects and to make sure I don't lose important lessons learned by doing this.
See [_**Development Log**_](./development-log.md) for things I've done.

Back to [_**README**_](./README.md).

Not sure about how I will layout this. Will experiment and see what's most usefull.

### 25/12/24

Added a Mithril SPA. At first I couldn't get it served. 
Directoru.GetCurrentDirectory() finds the absolute path to current directory. I had put the mithril spa page in a different folder than the server. So that didn't work cause getcurrentdirectory() returned 'C:/absolute_path/repository_name/server', when I needed it to be 'C:/absolutepath/repository_name/front_end'. I could have just moved the mithril app, would have been the easiest, but it made sense to me that server and frontend were in different directories. I wanted to get the path dynamically, rather than hardcoding it, because it might be different in the docker container, so I found a way to remove the last 'folder' from the string. Don't know if this will work once deployed; if getcurrentdirectory() works relative to the root folder on a docker container. Need to find out, or if there's a better way.

commit 81d2df96a766a130cdef424040e81d3b11f629a8

### 23/12/24

Serving the html file directly, by hard coding the path to the file works. But when using 'context.Request.Url.LocalPath' to retrieve the path from the request sent by the client and then using that as the path to serve the file from, appears to cause the server to look for a favicon.ico file. When it can't fine this the server has an unhandled exception and crashes.

it didn't seem like it was supposed to work like that: if one user sends a request that can't be found then the server crashes for everyone and just stops, untill someone starts it up again.

Tried wrapping the code in a try catch block and writing the error message to the console and that seemed to stop the program crashing even though the error still occured and the page is now also served.

I'm not sure if the request handling for that specific request still stops at that point. If maybe the html file gets served, because that happens earlier in the order of things, and then later on the exception stops it further progressing. Like I can get it to serve the page but then maybe other things like retrieving data from a database will still be interrupted? All I know at this point is that the server itself doesn't crash and it will still carry on listening to further responses. Will experiment to find out which is the case. 

commit 7a9bbbc9f59c472d741327d59556127e4bd511c7