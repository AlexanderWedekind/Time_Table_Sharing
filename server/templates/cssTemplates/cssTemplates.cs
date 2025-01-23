

namespace templates
{
    struct cssTemplates
    {
        public static string LandingPageCss()
        {
            string element = "";
            string path = Directory.GetCurrentDirectory() + "/templates/cssTemplates/templateFiles/landingPage.css";
            Console.WriteLine("css path: \" " + path + " \"");
            TextReader textReader = new StreamReader(path);
            element = textReader.ReadToEnd();
            return element;
        }

        // public static string LogInPageCss()
        // {

        // }

        // public static string ViewTimetablePageCss()
        // {

        // }

        // public static string EditTimetablePageCss()
        // {

        // }
    }
}