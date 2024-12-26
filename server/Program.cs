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
            "front_end/public/index.html",
            "favicon/favicon.ico",
            "front_end/build/app.js",
            "server/invalid_path.html"
        ];

        public static string[] validUrls = [
            "/",
            "/favicon.ico",
            "/app.js",
            "server/invalid_path.html"
        ];

        public static bool IsUrlValid(string requestUrl, string[] urls)
        {
            bool urlIsValid = false;
            foreach(string st in urls)
            {
                if(requestUrl == st)
                {
                    urlIsValid = true; 
                }
            }
            return urlIsValid;
            
        }

        public static string MapUrlToPath(string url)
        {
            string responseFileLocalPath = "";
            for(int i = 0; i < validUrls.Length; i++)
            {
                if(url == validUrls[i])
                {
                    responseFileLocalPath = validPaths[i];
                }
            }
            return responseFileLocalPath;
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
                Console.WriteLine("\n");
                Console.WriteLine("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-");
                Console.WriteLine("requestUrl: \"" + requestUrl + "\"");
                Console.WriteLine("-------------------------");
                //Console.WriteLine("requestUrl: \"" + requestUrl + "\"");

                if(String.IsNullOrEmpty(requestUrl) == true || String.IsNullOrWhiteSpace(requestUrl) == true)
                {
                    requestUrl = "server/invalid_path.html";
                }

                if(IsUrlValid(requestUrl, validUrls) == false)
                {
                    requestUrl = "server/invalid_path.html";
                }

                string responseLocalPath = MapUrlToPath(requestUrl);

                Console.WriteLine("processed requestUrl into responsePath: \"" + responseLocalPath + "\"");

                //string jsRequestPath = "front_end/public/app.js";

                //string jsPath = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().Length - Directory.GetCurrentDirectory().Substring(Directory.GetCurrentDirectory().LastIndexOf("\\") + 1).Length) + jsRequestPath;

                string responseFileAbsolutePath = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().Length - Directory.GetCurrentDirectory().Substring(Directory.GetCurrentDirectory().LastIndexOf("\\") + 1).Length) + responseLocalPath;
                //Console.WriteLine("htmlPath: \"" + htmlPath + "\"");
                //Console.WriteLine("jsPath: \"" + jsPath + "\"");
                Console.WriteLine("responseFileAbsolutePath: \"" + responseFileAbsolutePath + "\"");
                Console.WriteLine("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-");

                try
                {
                    

                    TextReader responseFileTextReader = new StreamReader(responseFileAbsolutePath);

                    string responseFileContent = responseFileTextReader.ReadToEnd();
                    
                    byte[] byteArrayOfContent = Encoding.UTF8.GetBytes(responseFileContent);

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



