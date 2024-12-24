// See https://aka.ms/new-console-template for more information

using System;
using System.Net;
using System.IO;
using System.Text;
using System.Security.Cryptography.X509Certificates;

namespace MyTimeDiarySharingServer
{
    public class Listener
    {
         string[] validPaths = [
            "C:\\Usera\\awedw\\repositories\\personal-projects\\Time_Table_Sharing\\server\\index.html",
            "C:\\Usera\\awedw\\repositories\\personal-projects\\Time_Table_Sharing\\server\\helloWorld\\hello_there.html"
        ];

        public static bool IsPathValid(string pageUrl, string[] paths)
        {
            bool pathIsValid = false;
            foreach(string st in paths)
            {
                if(pageUrl == st)
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

            // while(true)
            // {
            //     HttpListenerContext context = server.GetContext();
            //     HttpListenerResponse response = context.Response;

            //     string page = Directory.GetCurrentDirectory()  + context.Request.Url.LocalPath;
            //     Console.WriteLine("page: " + page);
            // }

            

            while(true)
            {
                HttpListenerContext context = server.GetContext();

                HttpListenerResponse response = context.Response;

#pragma warning disable CS8602 // Dereference of a possibly null reference.
                //string page = Directory.GetCurrentDirectory() + "\\index.html"; //context.Request.Url.LocalPath;
                string page = Directory.GetCurrentDirectory() + context.Request.Url.LocalPath;
#pragma warning restore CS8602 // Dereference of a possibly null reference.

                if(String.IsNullOrEmpty(page) == true || String.IsNullOrWhiteSpace(page) == true)
                {
                    page = "index.html;";
                }

                try
                {
                    TextReader textReader = new StreamReader(page);

                    string pageContent = textReader.ReadToEnd();

                    byte[] byteArrayOfContent = Encoding.UTF8.GetBytes(pageContent);

                    response.ContentLength64 = byteArrayOfContent.Length;

                    Stream stream = response.OutputStream;

                    stream.Write(byteArrayOfContent, 0, byteArrayOfContent.Length);

                    response.Close();
                }
                catch(Exception error)
                {
                    Console.WriteLine(error.Message);
                }
                

                

            }
            
        }
        

    }
    
}



