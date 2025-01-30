using MyTimeDiarySharingServer;
using templates;

namespace elements
{
    public class HtmlElement
    {
        string elementType = "";
        string js = "";
        string style = "";

        Dictionary<string, string> attributes = new Dictionary<string, string>();
        
        string Build(string nested)
        {
            return Elements.HtmlElementString(elementType: elementType, attributes: attributes, nested: nested, js: js);           
        }
        HtmlElement(string type)
        {
            elementType = type;
        }
    }

    public struct ElementType
    {
        public ElementType()
        {
            string div = "div";
            string a = "a";
            string h1 = "h1";
            string h2 = "h2";
            string h3 = "h3";
            string h4 = "h4";
            string h5 = "h5";
            string h6 = "h6";
            string p = "p";
            string ul = "ul";
            string ol = "ol";
            string li = "li";
            string button = "button";
            string form = "form";
            string input = "input";
            string label = "label"; 
        }        
    }

    

    public class Elements
    {
        
        public string landingPage = "";

        


                //arguments:
        
        //elementType
        //nested
        //js

        // global attributes:

        //style
        //id
        //class
        //js
        //data-* (data passed to element for use by it's js)
        //title (displays on hover)
        //lang
        //tabindex
        //onclick
        //onmouseover
        //hidden
        //draggable
        //contenteditable
        //accesskey

        //element specific attributes:

        //<a>
            //href
            //target  (_blank, _self)
        //button
            //


        public Dictionary<string, string> ElementAttributes = new Dictionary<string, string>();

        public Dictionary<string, string> AddAttributes()
        {
            Dictionary<string, string> attributes = new Dictionary<string, string>();
            return attributes;
        }

        public static bool AttributeIsValid(string elementType, string attributeAllowed)
        {
            bool valid = false;
            
            switch(attributeAllowed)
            {
                case "all":
                    valid = true;
                    break;
                default:
                    if(attributeAllowed == elementType)
                    {
                        valid = true;
                    }
                    break;
            }

            return valid;
        }
        
        public static string HtmlElementString(string elementType, Dictionary<string, string> attributes, string nested = "", string js = "")
        {
            string thisElementType = elementType.ToLower();
            
            bool isVoid = false;

            string elementString = "";
            string openingTag = "";
            string buildingOpeningTag = $"<{thisElementType}";
            string closingTag = $"</{thisElementType}>";

            switch(thisElementType)
            {
                case "img":
                    isVoid = true;
                    break;
                case "input":
                    isVoid = true;
                    break;
                case "meta":
                    isVoid = true;
                    break;
                case "link":
                    isVoid = true;
                    break;
                case "hr":
                    isVoid = true;
                    break;
                case "source":
                    isVoid = true;
                    break;
                case "area":
                    isVoid = true;
                    break;
                case "col":
                    isVoid = true;
                    break;
                case "embed":
                    isVoid = true;
                    break;
                case "br":
                    isVoid = true;
                    break;
                default:
                    break;
            }

            switch(isVoid)
            {
                case true:

                    foreach(var attribute in attributes)
                    {
                        if(attribute.Key.ToLower() == thisElementType || attribute.Key.ToLower() == "all")
                        {
                            buildingOpeningTag = buildingOpeningTag + " " + $"{attribute.Value}";
                        }
                        else
                        {
                            Console.WriteLine($"Incorrect html syntax:\nA \" {thisElementType} \" element can't have attribute \" {attribute.Value} \"");
                        }
                    }

                    elementString = buildingOpeningTag + ">";
                    return elementString;

                case false:

                    foreach(var attribute in attributes)
                    {
                        if(attribute.Key.ToLower() == thisElementType || attribute.Key.ToLower() == "all")
                        {
                            buildingOpeningTag = buildingOpeningTag + " " + $"{attribute.Value}";
                        }
                        else
                        {
                            Console.WriteLine($"Incorrect html syntax:\nA \" {thisElementType} \" element can't have attribute \" {attribute.Value} \"");
                        }
                    }

                    openingTag = buildingOpeningTag + ">";
                    elementString = openingTag + $"{nested}<script>{js}</script>" + closingTag;

                    return elementString;
                    ///$"<{thisElementType} {style} {id} {elementClass}>{nested}<script>{js}</script></{thisElementType}>";
            }
            
        }


        

        public string LandingPage(string pageTitle,string style, string bodyId, string bodyClass, string js, string nested)
            {
                return
                $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{pageTitle}</title>
                <style>{style}</style>
                </head>
                <body {bodyId} {bodyClass}>
                {nested}
                <script>{js}</script>
                </body>
                </html>
                """;
            }      
        public Elements()
        {
            ElementType elementType = new ElementType();
            landingPage = templates.templates.AnyOneFile(MyTimeDiarySharingServer.Listener.absolutePathsPrepend + "/server/templates/htmlTemplates/templateFiles/landingPage.html");

            
        }
        
    }
}