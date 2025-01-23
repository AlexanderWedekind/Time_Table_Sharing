using MyTimeDiarySharingServer;
using templates;

namespace elements
{
    public class Elements
    {
        public string landingPage = "";  
        public string div = "";

        public string Element(string elementType, string style, string id, string elementClass, string js, string nested)
        {
            return $"<{elementType} {style} {id} {elementClass}>{nested}<script>{js}</script></{elementType}>";
        }

        public string Div(string style, string id, string elementClass, string js, string nested)
        {
            return $"<div {style} {id} {elementClass}>{nested}<script>{js}</script></div>";
        }

        public string P(string style, string id, string elementClass, string js, string nested)
        {
            return $"<p {style} {id} {elementClass}>{nested}<script>{js}</script></p>";
        }

        

        public string LandingPage(string pageTitle, string bodyId, string bodyClass, string js, string nested)
            {
                return
                $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{pageTitle}</title>
                <link rel="stylesheet" href="landingPage.css">
                </head>
                <body {bodyId}{bodyClass}>
                {nested}
                <script>{js}</script>
                </body>
                </html>
                """;
            }      
        public Elements()
        {
            landingPage = templates.templates.AnyOneFile(MyTimeDiarySharingServer.Listener.absolutePathsPrepend + "/server/templates/htmlTemplates/templateFiles/landingPage.html");

            
        }
        
    }
}