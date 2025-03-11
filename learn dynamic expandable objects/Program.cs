using System;
using System.Dynamic;
using System.Reflection.Metadata;

namespace learningDynamicExpandableObjexts;

public class CustomException : Exception
{
    public string description = "";

    public CustomException()
    {

    }
    public CustomException(string name)
    {
        
    }

    public CustomException(CustomException inner)
    {
        this.description = $"{inner.description}\n{inner.StackTrace}";
    }

}

public class ElementAllreadyExists : CustomException
{
    
    public ElementAllreadyExists(string name)
    {
        this.description = $"An element named \" {name} \" allready exists.";         
    }

    public ElementAllreadyExists(ElementAllreadyExists inner)
    {
       
    }
}

public class AttributeNotSet : CustomException
{
    public AttributeNotSet(string attributeName)
    {
        this.description = $"Unable to retrieve the value of attribute '{attributeName}' from element; attribute '{attributeName}' has not yet been set.";
    }

    public AttributeNotSet(AttributeNotSet exception)
    {

    }
}

public class ElementStringMethodNotInS : Exception
{
    public string? message;

    public ElementStringMethodNotInS(string name, bool invoke)
    {
        if(invoke == true)
        {
            this.message = $"Could not invoke '{name}'; no element string method '{name}' found in 'Program.S'.";
        }
        else
        {
            this.message = $"Could not retrieve the value of '{name}'; no element string method '{name}' found on 'Program.E'.";
        }
    }

    public ElementStringMethodNotInS(ElementStringMethodNotInS exception)
    {

    }
}

public class ElementInstanceNotInE : Exception
{
    public string? message;

    public ElementInstanceNotInE(string name)
    {
        this.message = $"Unable to access element '{name}'; no html element instance named '{name}' found in 'Program.E'.";
    }

    public ElementInstanceNotInE(ElementInstanceNotInE exception)
    {

    }
}

public class ElementStringMethods : DynamicObject
{
    public delegate string elementStringMethod(string nested);
    public readonly Dictionary<string, Delegate> elementStringMethods = new Dictionary<string, Delegate>();

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = 0;
        try
        {
            if(elementStringMethods.TryGetValue(binder.Name, out Delegate? value))
            {
                result = value;
                return true;
            }
            else
            {
                throw new ElementStringMethodNotInS(binder.Name, invoke: false);
            }
        }
        catch(ElementStringMethodNotInS exception)
        {
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
        }
        return false;
    }

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        // this one doesn't get an 'overwriting value' warning, as this get's overwritten on purpose everytime an attribute is updated
        elementStringMethods[binder.Name] = (Delegate)value;
        return true;
    }

    public override bool TryInvokeMember(InvokeMemberBinder binder, object?[]? args, out object? result)
    {
        result = 0;
        try
        {
            if(elementStringMethods.TryGetValue(binder.Name, out Delegate method))
            {
                //del.DynamicInvoke(args);
                result = method.DynamicInvoke(args);
                return true;
            }
            else
            {
                throw new ElementStringMethodNotInS(binder.Name, invoke: true);
            }
        }
        catch(ElementStringMethodNotInS exception)
        {
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
        }
        return false;
    }
}

public class ElementInstances : DynamicObject
{
    public readonly Dictionary<string, dynamic> elementInstances = new Dictionary<string, dynamic>();

    public override bool TryGetMember(GetMemberBinder binder, out object? element)
    {
        element = null;
        try
        {
            if(elementInstances.TryGetValue(binder.Name, out dynamic? result))
            {
                element = result;
                return true;
            }
            else
            {
                throw new ElementInstanceNotInE(binder.Name);
            }
            
        }
        catch(ElementInstanceNotInE exception)
        {
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
        }
        return false;
    }

    public override bool TrySetMember(SetMemberBinder binder, object? newValue)
    {
        elementInstances[binder.Name] = newValue;
        return true;
    }

}

class HtmlElement : DynamicObject
{
    protected bool isVoidElement;
    protected string name;
    protected string type;
    protected string openingString;
    protected string js;
    protected string closingString;

    public delegate string BuildElementString(string nested = "");

    public BuildElementString Build;

    protected readonly Dictionary<string, string> elementAttributes = new Dictionary<string, string>();

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        elementAttributes[binder.Name.ToLower()] = Convert.ToString(value);
        OpeningString();
        BuildElementStringMethod();
        AddStringMethodToElementStringMethods();
        return true;
    }

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = null;
        try
        {
            if(elementAttributes.TryGetValue(binder.Name.ToLower(), out string? value))
            {
                result = value;
                return true;
            }
            else
            {
                throw new AttributeNotSet(binder.Name);
            }
        }
        catch(AttributeNotSet exception)
        {
            Console.WriteLine($"{exception.description}\nAt: {exception.StackTrace}, at {exception.TargetSite}.");
        }
        return true;
    }

    protected void OpeningString()
    {
        this.openingString = $"<{this.type}";
        foreach(var attribute in elementAttributes)
        {
            if(attribute.Key == "js" && attribute.Value is string value)
            {
                if(this.isVoidElement == false)
                {
                    this.js = $"<script>{value}</script>";
                }
                else
                {
                    this.openingString += $" {attribute.Key}='{attribute.Value}'";
                }
                
            }
            else if(attribute.Value is string nonJsValue)
            {
                this.openingString += $" {attribute.Key}='{nonJsValue}'";
            }
        }
        if(this.isVoidElement == true)
        {
            this.openingString += " />";
        }
        else
        {
            this.openingString += ">";
        }
    }

    protected void ClosingString()
    {
        this.closingString = $"</{this.type}>";
    }

    public void BuildElementStringMethod()
    {
        if(this.isVoidElement == true)
        {
            this.Build = (string nested = "") => { return $"{openingString}"; };
        }
        else
        {
            this.Build = (string nested = "") => { return $"{this.openingString}{nested}{this.js}{this.closingString}"; };
        }
    }

    private void AddStringMethodToElementStringMethods()
    {   
        Program.S.elementStringMethods[this.name] = this.Build;
    }
    public HtmlElement(string name, bool isVoid, string type = "html")
    {
        this.type = type;
        this.isVoidElement = isVoid;
        this.name = name;
        int voidIndex = Types.elementTypesList.Length;
        for(int i = 0; i < Types.elementTypesList.Length; i++)
        {
            if(Types.elementTypesList[i] == "void types from here-on")
            {
                voidIndex = i;
            }
            if(Types.elementTypesList[i] == this.type)
            {
                if(i > voidIndex)
                {
                    this.isVoidElement = true;
                }
                else
                {
                    this.isVoidElement = false;
                }
            }
            
        };
        this.OpeningString();
        this.ClosingString();
        this.BuildElementStringMethod();
        this.AddStringMethodToElementStringMethods();
    }
}

// class Div : HtmlElement
// {
//     public static void New(string name)
//     {
//         try
//         {
//             if(Program.E.elementInstances.TryGetValue(name, out object? element))
//             {
//                 throw new ElementAllreadyExists(name);
//             }
//             else
//             {
//                 Program.E.elementInstances[name] = new Div(name);
//                 Console.WriteLine($"Created new element '{name}'; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
//             }
//         }
//         catch(ElementAllreadyExists exception)
//         {
//             Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
//         };
        
//     }
//     public Div(string name = "", bool isVoid = false, string type = "div") : base(name: name, isVoid: isVoid, type: type)
//     {
       
//     }
// }

// class P : HtmlElement
// {
//     public static void New(string name)
//     {
//         try
//         {
//             if(Program.E.elementInstances.TryGetValue(name, out object? value))
//             {
//                 throw new ElementAllreadyExists(name);
//             }
//             else
//             {
//                 Program.E.elementInstances[name] = new P(name);
//                 Console.WriteLine($"Created new element '{name}'; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
//             }
//         }
//         catch(ElementAllreadyExists exception)
//         {
//             Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
//         }
//     }

//     public P(string name = "", bool isVoid = false, string type = "p") : base(name: name, isVoid: isVoid, type: type)
//     {

//     }
// }

// class H1 : HtmlElement
// {
//     public static void New(string name)
//     {
//         try
//         {
//             if(Program.E.elementInstances.TryGetValue(name, out object? element))
//             {
//                 throw new ElementAllreadyExists(name);
//             }
//             else
//             {
//                 Program.E.elementInstances[name] = new H1(name);
//                 Console.WriteLine($"Created new element '{name}'; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
//             }
//         }
//         catch(ElementAllreadyExists exception)
//         {
//             Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
//         };
        
//     }
//     public H1(string name = "", bool isVoid = false, string type = "h1") : base(name: name, isVoid: isVoid, type: type)
//     {
       
//     }
// }

// class Img : HtmlElement
// {
//     public static void New(string name)
//     {
//         try
//         {
//             if(Program.E.elementInstances.TryGetValue(name, out object? element))
//             {
//                 throw new ElementAllreadyExists(name);
//             }
//             else
//             {
//                 Program.E.elementInstances[name] = new Img(name);
//                 Console.WriteLine($"Created new element \" {name} \"; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
//             }
//         }
//         catch(ElementAllreadyExists exception)
//         {
//             Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
//         };
        
//     }
//     public Img(string name = "", bool isVoid = true, string type = "img") : base(name: name, isVoid: isVoid, type: type)
//     {
       
//     }
// }

public class NewElement
{
    public static void Element(string name, bool isVoid, string type)
    {
        if(Program.E.elementInstances.TryGetValue(name.ToLower(), out object? result))
        {
            throw new ElementAllreadyExists(name);
        }
        else
        {
            Program.E.elementInstances[name.ToLower()] = new HtmlElement(name: name, isVoid: isVoid, type: type);
        }
       
    }

    public static void Div(string name, bool isVoid = false, string type = "div")
    {
       
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void P(string name, bool isVoid = false, string type = "p")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Button(string name, bool isVoid = false, string type = "button")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void A(string name, bool isVoid = false, string type = "a")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void H1(string name, bool isVoid = false, string type = "h1")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void H2(string name, bool isVoid = false, string type = "h2")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void H3(string name, bool isVoid = false, string type = "h3")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Form(string name, bool isVoid = false, string type = "form")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Ul(string name, bool isVoid = false, string type = "ul")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Ol(string name, bool isVoid = false, string type = "ol")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Li(string name, bool isVoid = false, string type = "li")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Table(string name, bool isVoid = false, string type = "table")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Th(string name, bool isVoid = false, string type = "th")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Tr(string name, bool isVoid = false, string type = "tr")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Td(string name, bool isVoid = false, string type = "td")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Img(string name, bool isVoid = true, string type = "img")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Label(string name, bool isVoid = false, string type = "label")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Link(string name, bool isVoid = true, string type = "link")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Br(string name, bool isVoid = true, string type = "br")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Hr(string name, bool isVoid = true, string type = "hr")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Input(string name, bool isVoid = true, string type = "input")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Source(string name, bool isVoid = true, string type = "source")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Area(string name, bool isVoid = true, string type = "area")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Base(string name, bool isVoid = true, string type = "base")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Col(string name, bool isVoid = true, string type = "col")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Embed(string name, bool isVoid = true, string type = "embed")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Meta(string name, bool isVoid = true, string type = "meta")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Track(string name, bool isVoid = true, string type = "track")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }

    public static void Wbr(string name, bool isVoid = true, string type = "wbr")
    {
        Element(name: name, isVoid: isVoid, type: type);
    }
}



public struct Types
{
    public static string[] elementTypesList =
    {
        "div",
        "p",
        "h1",
        "h2",
        "h3",
        "a",
        "button",
        "form",
        "ul",
        "ol",
        "li",
        "table",
        "tr",
        "td",
        "th",
        "label",
        "void types from here-on",
        "img",
        "link",
        "br",
        "hr",
        "area",
        "base",
        "col",
        "embed",
        "input",
        "meta",
        "source",
        "track",
        "wbr"
    };

    public static string[] attributesList =
    {
        "lang",
        "rel",
        "tabindex",
        "style",
        "class",
        "id",
        "title",
        "charset",
        "cols",
        "colspan",
        "data-",
        "href",
        "hreflang",
        "target",
        "src",
        "alt",
        "width",
        "height",
        "onclick",
        "onsubmit",
        "method",
        "action",
        "value",
        "name",
        "onscroll",
        "type",
        "onsearch",
        "oncopy",
        "onselect",
        "draggable",
        "dropzone",
        "contenteditable",
        "hidden",
    };

    public static string[,] attributesAllowedList = new string[attributesList.Length, elementTypesList.Length + 2];
    static void MakeAttributesAlloweList()
    {
        for(int i = 0; i < attributesList.Length; i++)
        {
            for(int j = 0; j < elementTypesList.Length + 2; j++)
            {
                if(j == 0)
                {
                    attributesAllowedList[i, j] = attributesList[i];
                }
                if(j == 1)
                {
                    switch(attributesList[i])
                    {
                        case "href":
                            attributesAllowedList[i, j] = "not global";
                            j ++;
                            attributesAllowedList[i, j] = "a";
                            break;
                    }
                }
                attributesAllowedList[i, j] = "";
                
            }
        }
    }
    
    public static string Div = elementTypesList[0];
    static string P = elementTypesList[1];
    static string H1 = elementTypesList[2];
    static string H2 = elementTypesList[3];
    static string H3 = elementTypesList[4];
    static string A = elementTypesList[5];
}

public class Program
{
    public static dynamic S = new ElementStringMethods();
    public static dynamic E = new ElementInstances();
    
    public static void Main()
    {
        try
        {
            NewElement.Div("house");
            E.house.style = "color: red";
            E.house.Style = "color:";
            E.house.style = E.house.style + " blue";
            NewElement.Img("mac");
            NewElement.Div("house");
            E.mac.source = "\"a picture of Mac\"";
            Console.WriteLine(S.house(S.mac("a nested string")));
        }
        catch(CustomException exception)
        {
            Console.WriteLine(exception.description + exception.StackTrace);
        }
    }
}