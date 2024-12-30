// See https://aka.ms/new-console-template for more information

using System;
using System.Net;
using System.IO;
using System.Text;
using System.Security.Cryptography.X509Certificates;
using System.Reflection.Metadata;
using DotNetEnv;

namespace MyTimeDiarySharingServer
{
    public class Listener
    {
        // 'public static string[] validPaths = [
        //     "front_end/public/index.html",
        //     "front_end/public/styles.css",
        //     "favicon/favicon.ico",
        //     "front_end/build/app.js",
        //     "server/invalid_path.html"
        // ];

        // public static string[] validUrls = [
        //     "/",
        //     "/styles.css",
        //     "/favicon.ico",
        //     "/app.js",
        //     "server/invalid_path.html"
        // ];

        // public static bool IsUrlValid(string requestUrl, string[] urls)
        // {
        //     bool urlIsValid = false;
        //     foreach(string st in urls)
        //     {
        //         if(requestUrl == st)
        //         {
        //             urlIsValid = true; 
        //         }
        //     }
        //     return urlIsValid;
            
        // }

        // public static string MapUrlToPath(string url)
        // {
        //     string responseFileLocalPath = "";
        //     for(int i = 0; i < validUrls.Length; i++)
        //     {
        //         if(url == validUrls[i])
        //         {
        //             responseFileLocalPath = validPaths[i];
        //         }
        //     }
        //     return responseFileLocalPath;
        // }

        public static void Main()
        {
            Env.Load();
            string ENV = "";
            if(Environment.GetEnvironmentVariable("ENV") != null)
            {
                ENV = Environment.GetEnvironmentVariable("ENV");
            }
            else
            {
                Console.WriteLine("Warning: Environment Variables not present; setting Environment to 'development'");
                ENV = "development";
            }
            Console.WriteLine("ENV is: \" " + ENV + " \"");

            HttpListener server = new HttpListener();
            server.Prefixes.Add("http://127.0.0.1:8080/");
            server.Prefixes.Add("http://localhost:8080/");
            
            server.Start();

            Console.WriteLine("Server listening at: http://localhost:8080/");

            while(true)
            {
                HttpListenerContext context = server.GetContext();

                HttpListenerResponse response = context.Response;
                string requestUrl = "";
                requestUrl = context.Request.Url.LocalPath;
                Console.WriteLine("\n");
                Console.WriteLine("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-");
                Console.WriteLine("requestUrl: \"" + requestUrl + "\"");
                Console.WriteLine("-------------------------");

                string responseLocalPath = "";

                switch(ENV)
                {
                    case "development":
                        switch(requestUrl)
                        {
                            case "/":
                                responseLocalPath = "front_end/public/index.html";
                                break;
                            case "/styles.css":
                                responseLocalPath = "front_end/public/styles.css";
                                break;
                            case "/app.js":
                                responseLocalPath = "front_end/dev_build/app.js";
                                break;
                            case "/favicon.ico":
                                responseLocalPath = "favicon/favicon.ico";
                                break;
                            case "/app.js.map":
                                responseLocalPath = "front_end/dev_build/app.js.map";
                                break;
                            default:
                                Console.WriteLine("Invalid url from client to server; defaulting to home-path.");
                                responseLocalPath = "front_end/public/index.html";
                                break;
                        }
                        break;
                    case "production":
                        switch(requestUrl)
                        {
                            case "/":
                                responseLocalPath = "front_end/public/index.html";
                                break;
                            case "/styles.css":
                                responseLocalPath = "front_end/public/styles.css";
                                break;
                            case "/app.js":
                                responseLocalPath = "front_end/prod_build/app.js";
                                break;
                            case "/favicon.ico":
                                responseLocalPath = "favicon/favicon.ico";
                                break;
                            default:
                                Console.WriteLine("Invalid url from client to server; defaulting to home-path.");
                                responseLocalPath = "front_end/public/index.html";
                                break;
                        }
                        break;
                }
                
                
                // if(String.IsNullOrEmpty(requestUrl) == true || String.IsNullOrWhiteSpace(requestUrl) == true)
                // {
                //     requestUrl = "server/invalid_path.html";
                // }

                // if(IsUrlValid(requestUrl, validUrls) == false)
                // {
                //     requestUrl = "server/invalid_path.html";
                // }

                //string responseLocalPath = MapUrlToPath(requestUrl);

                Console.WriteLine("processed requestUrl into responsePath: \"" + responseLocalPath + "\"");

                string responseFileAbsolutePath = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().Length - Directory.GetCurrentDirectory().Substring(Directory.GetCurrentDirectory().LastIndexOf("\\") + 1).Length) + responseLocalPath;
                Console.WriteLine("responseFileAbsolutePath: \"" + responseFileAbsolutePath + "\"");
                Console.WriteLine("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-");
                Console.WriteLine("\nServer listening at: http://localhost:8080/");

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



