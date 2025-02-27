// See https://aka.ms/new-console-template for more information

using System;
using System.Net;
using System.IO;
using System.Text;
using System.Security.Cryptography.X509Certificates;
using System.Reflection.Metadata;
using DotNetEnv;
using templates;
using System.Collections;
using elements;

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

        

        public static Dictionary<string, string> UrlToPathMatches = new Dictionary<string, string>();

        public static string absolutePathsPrepend = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().Length - Directory.GetCurrentDirectory().Substring(Directory.GetCurrentDirectory().LastIndexOf("\\")).Length);

        public static ElementsFunctionality elementsFunctionality = new ElementsFunctionality();

        public delegate string BuildElement(string nested);

        public static List<Object> allElements = new List<object>();

        public static Dictionary<string, BuildElement> Elements = new Dictionary<string, BuildElement>();
        
        public static string environment = "";

        public static string serving = "";

        public static void SetDevMithrilPaths()
        {
            UrlToPathMatches.Add("/",  absolutePathsPrepend + "/front_end/public/index.html");
            UrlToPathMatches.Add("/styles.css", absolutePathsPrepend + "/front_end/public/styles.css");
            UrlToPathMatches.Add("/index.js", absolutePathsPrepend + "/front_end/dev_build/index.js");
            UrlToPathMatches.Add("/favicon.ico", absolutePathsPrepend + "/favicon/favicon.ico");
            UrlToPathMatches.Add("/index.js.map", absolutePathsPrepend + "/front_end/dev_build/index.js.map");
        }

        public static void SetProdMithrilPaths()
        {
            UrlToPathMatches.Add("/", absolutePathsPrepend + "/front_end/public/index.html");
            UrlToPathMatches.Add("/styles.css", absolutePathsPrepend + "/front_end/public/styles.css");
            UrlToPathMatches.Add("/index.js", absolutePathsPrepend + "/front_end/prod_build/index.js");
            UrlToPathMatches.Add("/favicon.ico", absolutePathsPrepend + "/favicon/favicon.ico");
        }

        public static void SetDevTemplatePaths()
        {
            UrlToPathMatches.Add("/", absolutePathsPrepend + "/server/templates/htmlTemplates/templateFiles/landingPage.html");
            UrlToPathMatches.Add("/landingPage.css", absolutePathsPrepend + "/server/templates/cssTemplates/templatefiles/landingPage.css");
            UrlToPathMatches.Add("/landingPage.js", absolutePathsPrepend + "/server/templates/jsTemplates/templateFiles/landingPage.js");
            UrlToPathMatches.Add("/favicon.ico", absolutePathsPrepend + "/favicon/favicon.ico");
            UrlToPathMatches.Add("/landingPage.js.map", absolutePathsPrepend + "/server/sourceMap/landingPage.js.map");
        }

        public static void SetProdTemplatePaths()
        {
            UrlToPathMatches.Add("/", absolutePathsPrepend + "/server/templates/htmlTemplates/templateFiles/landingPage.html");
            UrlToPathMatches.Add("/landingPage.css", absolutePathsPrepend + "/server/templates/cssTemplates/templatefiles/landingPage.css");
            UrlToPathMatches.Add("/landingPage.js", absolutePathsPrepend + "/server/templates/jsTemplates/templateFiles/landingPage.js");
            UrlToPathMatches.Add("/favicon.ico", absolutePathsPrepend + "/favicon/favicon.ico");
        }

        public static bool TestENVvar(Dictionary<string, string> EnvVars)
        {
            bool setPropoperly = false;
            if(EnvVars["ENV"] == "development")
            {
                setPropoperly = true;
            }
            if(EnvVars["ENV"] == "production")
            {
                setPropoperly = true;
            }
            return setPropoperly;
        }

        public static bool testSERVINGvar(Dictionary<string, string> EnvVars)
        {
            bool setPropoperly = false;
            if(EnvVars["SERVING"] == "mithril")
            {
                setPropoperly = true;
            }
            if(EnvVars["SERVING"] == "templates")
            {
                setPropoperly = true;
            }
            return setPropoperly;
        }

        public static (bool success, string filePath) MatchUrlsToPaths(string url, Dictionary<string, string> paths, out string filePath)
        {
            bool success = false;
            filePath = "";
            foreach (var match in paths)
            {
                if(url == match.Key)
                {
                    filePath = match.Value;
                    success = true;
                }
            }
            return (success, filePath);
        }

        public delegate string GetTemplate();
        public delegate string GetFile(string path);

        public static void Main()
        {
            Env.Load();
            Dictionary<string, string> EnvVars = new Dictionary<string, string>();

            foreach(DictionaryEntry entry in Environment.GetEnvironmentVariables())
            {
                EnvVars.Add(Convert.ToString(entry.Key), Convert.ToString(entry.Value));
            }

            if(TestENVvar(EnvVars) == false)
            {
                Console.WriteLine("Environment variable 'ENV' not set as expected; setting to \"development\".");
                environment = "development";
            }
            else
            {
                environment = EnvVars["ENV"];
                Console.WriteLine("'ENV': \"" + environment + "\"");
            }

            if(testSERVINGvar(EnvVars) == false)
            {
                Console.WriteLine("Environment variable 'SERVING' not set as expected; setting to 'mithril'.");
                serving = "mithril";
            }
            else
            {
                serving = EnvVars["SERVING"];
                Console.WriteLine("'SERVING': \"" + serving + "\"");
            }
            
            switch(environment)
            {
                case "production":
                    switch(serving)
                    {
                        case "mithril":
                            SetProdMithrilPaths();
                            break;
                        case "templates":
                            SetProdTemplatePaths();
                            break;
                    }
                    break;
                case "development":
                    switch(serving)
                    {
                        case "mithril":
                            SetDevMithrilPaths();
                            break;
                        case "templates":
                            SetDevTemplatePaths();
                            break;
                    }
                    break;
            }

            HttpListener server = new HttpListener();
            server.Prefixes.Add("http://127.0.0.1:8080/");
            server.Prefixes.Add("http://localhost:8080/");
            
            server.Start();

            Console.WriteLine("Server listening at: http://localhost:8080/");

            //Console.WriteLine(elementsFunctionality.landingPage);

            while(true)
            {
                GetTemplate getTemplate = () => {return "";};
                GetFile getFile = (path) => {return "";};
                
                HttpListenerContext context = server.GetContext();
                HttpListenerResponse response = context.Response;
                HttpListenerRequest request = context.Request;
                string requestUrl = "";
                if(context.Request.Url.LocalPath != null)
                {
                    requestUrl = context.Request.Url.LocalPath;
                }
                else
                {
                    requestUrl = "/";
                }

                Console.WriteLine("\n");
                Console.WriteLine("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-");
                Console.WriteLine("requestUrl: \"" + requestUrl + "\"");
                Console.WriteLine("-------------------------");

                string responseLocalPath = "";

                if(MatchUrlsToPaths(requestUrl, UrlToPathMatches, out string filePath).success == true)
                {
                    responseLocalPath = filePath;
                }
                else
                {
                    Console.WriteLine("No match found for that url; setting url to 'home-page'.");
                    responseLocalPath = MatchUrlsToPaths("/", UrlToPathMatches, out string result).filePath;
                }

                Console.WriteLine("processed requestUrl into responsePath: \"" + responseLocalPath + "\"");

                Console.WriteLine("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-");
                
                try
                {
                    

                    //TextReader responseFileTextReader = new StreamReader(responseFileAbsolutePath);

                    //string responseFileContent = responseFileTextReader.ReadToEnd();

                    string responseFileContent = templates.templates.AnyOneFile(responseLocalPath);
                    // if(requestUrl == "/favicon.ico" || requestUrl == "/index.js.map")
                    // {
                    //     responseFileContent = getFile(responseLocalPath);
                    // }
                    // else
                    // {
                    //     responseFileContent = getTemplate();
                    // }
                    
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



