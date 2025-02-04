

using System.Diagnostics;
using System.Net;
using System.Text;
using stringVarTemplate;

namespace test_1
{
    public class Program
    {
        public static Dictionary <string, string> paths = new Dictionary<string, string>();

        public static void AddPaths()
        {
            paths.Add("/fetched_file_from_path", "/template.html");
            paths.Add("/string_variable", "/string_variable");
            paths.Add("/string_returned_from_method", "/from_method");
        }

        public static (bool success, string matchedPath) MatchUrlToPath(string url, Dictionary<string, string> paths)
        {
            bool success = false;
            string matchedPath = "/";
            foreach(var entry in paths)
            {
                if(url == entry.Key)
                {
                    matchedPath = entry.Value;
                    success = true;
                }
            }
            return (success, matchedPath);
        }

        public static void AnnounceTestChoices()
        {
            Console.WriteLine("\nTo test and view speeds of different ways of generating and serving html templates, choose a url (hold CONTROL and click)");
            foreach(var entry in paths)
            {
                Console.WriteLine(baseUrl + entry.Key.Substring(1));
            }
        }

        public static void BreakFileLineByLine()
        {
            TextReader textReader = new StreamReader(Directory.GetCurrentDirectory() + "/template.html");
            int nrOfLinesRead = 0;
            while(textReader.ReadLine() != null)
            {
                nrOfLinesRead++;
            }
            Console.WriteLine($"template.html contains {nrOfLinesRead} lines.");
            textReader.Close();
            string[] lines = new string[nrOfLinesRead];
            nrOfLinesRead = 0;
            TextReader textReader1 = new StreamReader(Directory.GetCurrentDirectory() + "/template.html");
            string line = "";
            int readLineIndex = 0;
            do
            {
                line = textReader1.ReadLine();
                Console.WriteLine(line);
                nrOfLinesRead++;
                Console.WriteLine($"number of lines read: {nrOfLinesRead}");
                if(line != null)
                {
                    lines[readLineIndex] = line;
                    readLineIndex++;
                    int linesCounter = 0;
                    Console.WriteLine("lines-array so far:");
                    foreach(string item in lines)
                    {
                        Console.WriteLine($"lines[{linesCounter}]: {item}");
                        linesCounter++;
                    }
                }
            }
            while(line != null);
            int counter = 1;
            foreach(string entry in lines)
            {
                string title = $"templateLine{counter}.html";
                TextWriter textWriter = new StreamWriter(Directory.GetCurrentDirectory() + "/lineTemplates/" + title);
                textWriter.WriteLine(entry);
                textWriter.Close();
                counter++;
            }
        }

        public static string testCase = "";
        public static string nextTestUrl = "";
        public static string baseUrl = "http://localhost:8080/";
        public static void Main()
        {
            AddPaths();
            BreakFileLineByLine();
            HttpListener listener = new HttpListener();
            listener.Prefixes.Add("http://localhost:8080/");
            listener.Prefixes.Add("http://127.0.0.1:8080/");
            listener.Start();

            Console.WriteLine("Server is listening...");
            AnnounceTestChoices();

            while(true)
            {
                HttpListenerContext context = listener.GetContext();

                Stopwatch completeRequestProcessingTime = new Stopwatch();
                Stopwatch singleTemplateGenerationTime = new Stopwatch();
                Stopwatch multipleTemplateGenerationTime = new Stopwatch();
                completeRequestProcessingTime.Start();

                HttpListenerRequest request = context.Request;
                HttpListenerResponse response = context.Response;

                string responseContent = "";

                Console.WriteLine("Request url: \" " + request.Url + " \"");

                switch(request.Url.LocalPath)
                {
                    case "/fetched_file_from_path":
                        testCase = "a file, using streamreader and the file's path,";
                        TextReader textReader = new StreamReader(Directory.GetCurrentDirectory() + "/template.html");
                        responseContent = textReader.ReadToEnd();
                        break;
                    case "/string_variable":
                        testCase = "a string variable that was declared and initialised at compile/startup time";    
                        responseContent = stringVarTemplate.stringVarTemplate.template;
                        break;
                    case "/string_returned_from_method":
                        testCase = "the return value of a method that runs at runtime";
                        responseContent = stringVarTemplate.stringVarTemplate.StringFromMethod();
                        break;
                    default:
                        Console.WriteLine("No path found for this url.");
                        break;
                }

                byte[] bytes = Encoding.UTF8.GetBytes(responseContent);
                response.ContentLength64 = bytes.Length;
                Stream stream = response.OutputStream;
                stream.Write(bytes, 0, bytes.Length);
                response.Close();

                completeRequestProcessingTime.Stop();
                long time = completeRequestProcessingTime.ElapsedMilliseconds;
                Console.WriteLine($"Fetching response content from {testCase} completed in  ->( {time} )<-  milliseconds.");
                AnnounceTestChoices();
            }
        }
    }
}