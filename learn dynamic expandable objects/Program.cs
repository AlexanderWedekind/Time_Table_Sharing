using System.Dynamic;

namespace learningDynamicExpandableObjexts;



class HtmlElement : DynamicObject
{
    protected string name;
    protected string type;
    protected string openingString;
    protected string middleString;
    protected string closingString;

    protected string style;

     
}

public class Program
{
    public static void Main()
    {
        HtmlElement Div = new HtmlElement();
        Div.name = "style";
    }
}