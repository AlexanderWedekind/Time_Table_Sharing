// See https://aka.ms/new-console-template for more information

using System;
using System.Net;
using System.IO;
using System.Text;
using System.Security.Cryptography.X509Certificates;
using System.Reflection.Metadata;

namespace MyTimeDiarySharingServer
{
    public class Listener
    {
         public static string[] validPaths = [
            "server/index.html",
            "server/helloWorld/hello_there.html",
            "frontend/index.html"
        ];

        public static bool IsPathValid(string requestUrlUrl, string[] paths)
        {
            bool pathIsValid = false;
            foreach(string st in paths)
            {
                if(requestUrlUrl == st)
                {
                    pathIsValid = true; 
                }
            }
            return pathIsValid;
            
        }

        public static void Main()
        {
            HttpListener server = new HttpListener();
            server.Prefixes.Add("http://127.0.0.1:8080/");
            server.Prefixes.Add("http://localhost:8080/");
            
            server.Start();

            Console.WriteLine("Server listening at: http://localhost:8080/");

            // while(true)
            // {
            //     HttpListenerContext context = server.GetContext();
            //     HttpListenerResponse response = context.Response;

            //     string requestUrl = Directory.GetCurrentDirectory()  + context.Request.Url.LocalPath;
            //     Console.WriteLine("requestUrl: " + requestUrl);
            // }

            

            while(true)
            {
                HttpListenerContext context = server.GetContext();

                HttpListenerResponse response = context.Response;
                //Console.WriteLine("context: " + context + "\ncontext.request: " + context.Request + "\ncontext.request.url: " + context.Request.Url + "\ncontext.request.url.localpath: " + context.Request.Url.LocalPath );


                //string requestUrl = Directory.GetCurrentDirectory() + "\\index.html"; //context.Request.Url.LocalPath;
                //string requestUrl = Directory.GetCurrentDirectory() + context.Request.Url.LocalPath;
                string requestUrl = context.Request.Url.LocalPath;

                //Console.WriteLine("requestUrl: \"" + requestUrl + "\"");

                if(String.IsNullOrEmpty(requestUrl) == true || String.IsNullOrWhiteSpace(requestUrl) == true)
                {
                    requestUrl = "front_end/index.html";
                }
                if(IsPathValid(requestUrl, validPaths) == false)
                {
                    requestUrl = "front_end/index.html";
                }
                //Console.WriteLine("requestUrl: \"" + requestUrl + "\"");

                string pageAbsolutePath = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().Length - Directory.GetCurrentDirectory().Substring(Directory.GetCurrentDirectory().LastIndexOf("\\") + 1).Length) + requestUrl;
                //Console.WriteLine("pageAbsolutePath: \"" + pageAbsolutePath + "\"");
                try
                {
                    TextReader textReader = new StreamReader(pageAbsolutePath);

                    string requestUrlContent = textReader.ReadToEnd();

                    //Console.WriteLine(requestUrlContent);

                    byte[] byteArrayOfContent = Encoding.UTF8.GetBytes(requestUrlContent);

                    response.ContentLength64 = byteArrayOfContent.Length;

                    Stream stream = response.OutputStream;

                    stream.Write(byteArrayOfContent, 0, byteArrayOfContent.Length);

                    response.Close();
                }
                catch(Exception error)
                {
                    Console.WriteLine(error.Message + "\n" + "source: " + error.Source + "\n" + "stack trace: " + error.StackTrace);
                }
                

                

            }
            
        }
        

    }
    
}



