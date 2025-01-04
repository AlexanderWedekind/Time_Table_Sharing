

using System.Linq.Expressions;

namespace templates
{
    struct htmlTemplates
    {
        //     public static string AnyOneElement()
        // {
            
        // }
        public static string LandingPageTemplate()
        {
            string element = "";
            string path = Directory.GetCurrentDirectory() + "/templates/htmlTamplates/templateFiles/landingPage.html";
            Console.WriteLine("html path: \" " + path + " \"");
            TextReader textReader = new StreamReader(path);
            element = textReader.ReadToEnd();
            return element;
        }

        // public static string LogInPageTemplate()
        // {

        // }

        // public static string ViewTimetablePageTemplate()
        // {

        // }

        // public static string EditTimetablePageTemplate()
        // {
            
        // }
    }
    
}