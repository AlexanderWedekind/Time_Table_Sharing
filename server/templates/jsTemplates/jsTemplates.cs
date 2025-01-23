

namespace templates
{
    struct jsTemplates
    {
        public static string LandingPageLogic()
        {
            string element = "";
            string path = Directory.GetCurrentDirectory() + "/templates/jsTemplates/templateFiles/landingPage.js";
            Console.WriteLine("js path: \" " + path + " \"");
            TextReader textReader = new StreamReader(path);
            element = textReader.ReadToEnd();
            return element; 
        }

        // public static string LogInPageLogic()
        // {

        // }

        // public static string ViewTimetablePageLogic()
        // {

        // }

        // public static string EditTimetablePageLogic()
        // {

        // }
    }
    
}