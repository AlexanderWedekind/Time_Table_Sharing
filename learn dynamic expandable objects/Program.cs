using System;
using System.Dynamic;

namespace learningDynamicExpandableObjexts;

public class ElementAllreadyExists : Exception
{
    public string? message;
    public ElementAllreadyExists(string name)
    {
        this.message = $"An element named \" {name} \" allready exists.";
    }
}

public class AttributeNotSet : Exception
{
    public string? message;

    public AttributeNotSet(string attributeName)
    {
        this.message = $"Unable to retrieve the value of attribute '{attributeName}' from element; attribute '{attributeName}' has not yet been set.";
    }
}

public class ElementStringMethodNotInE : Exception
{
    public string? message;

    public ElementStringMethodNotInE(string name, bool invoke)
    {
        if(invoke == true)
        {
            this.message = $"Could not invoke '{name}'; no element string method '{name}' found in 'Program.E'.";
        }
        else
        {
            this.message = $"Could not retrieve the value of '{name}'; no element string method '{name}' found on 'Program.E'.";
        }
    }
}

public class ElementInstanceNotInElements : Exception
{
    public string? message;

    public ElementInstanceNotInElements(string name)
    {
        this.message = $"Unable to access element '{name}'; no html element instance named '{name}' found in 'Program.elements'.";
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
                throw new ElementStringMethodNotInE(binder.Name, invoke: false);
            }
        }
        catch(ElementStringMethodNotInE exception)
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
                throw new ElementStringMethodNotInE(binder.Name, invoke: true);
            }
        }
        catch(ElementStringMethodNotInE exception)
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
                throw new ElementInstanceNotInElements(binder.Name);
            }
            
        }
        catch(ElementInstanceNotInElements exception)
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
        elementAttributes[binder.Name] = Convert.ToString(value);
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
            if(elementAttributes.TryGetValue(binder.Name, out string? value))
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
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}, at {exception.TargetSite}.");
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
    public HtmlElement(string name, string type = "html")
    {
        this.type = type;
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

class Div : HtmlElement
{
    public static void New(string name)
    {
        try
        {
            if(Program.E.elementInstances.TryGetValue(name, out object? element))
            {
                throw new ElementAllreadyExists(name);
            }
            else
            {
                Program.E.elementInstances[name] = new Div(name);
                Console.WriteLine($"Created new element '{name}'; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
            }
        }
        catch(ElementAllreadyExists exception)
        {
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
        };
        
    }
    public Div(string name = "", string type = "div") : base(name: name, type: type)
    {
       
    }
}

class P : HtmlElement
{
    public static void New(string name)
    {
        try
        {
            if(Program.E.elementInstances.TryGetValue(name, out object? value))
            {
                throw new ElementAllreadyExists(name);
            }
            else
            {
                Program.E.elementInstances[name] = new P(name);
                Console.WriteLine($"Created new element '{name}'; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
            }
        }
        catch(ElementAllreadyExists exception)
        {
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
        }
    }

    public P(string name = "", string type = "p") : base(name: name, type: type)
    {

    }
}

class H1 : HtmlElement
{
    public static void New(string name)
    {
        try
        {
            if(Program.E.elementInstances.TryGetValue(name, out object? element))
            {
                throw new ElementAllreadyExists(name);
            }
            else
            {
                Program.E.elementInstances[name] = new H1(name);
                Console.WriteLine($"Created new element '{name}'; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
            }
        }
        catch(ElementAllreadyExists exception)
        {
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
        };
        
    }
    public H1(string name = "", string type = "h1") : base(name: name, type: type)
    {
       
    }
}

class Img : HtmlElement
{
    public static void New(string name)
    {
        try
        {
            if(Program.E.elementInstances.TryGetValue(name, out object? element))
            {
                throw new ElementAllreadyExists(name);
            }
            else
            {
                Program.E.elementInstances[name] = new Img(name);
                Console.WriteLine($"Created new element \" {name} \"; added object '{name}' to 'Program.E'; added string method 'string {name}(string nested)' to 'Program.S'.");
            }
        }
        catch(ElementAllreadyExists exception)
        {
            Console.WriteLine($"{exception.message}\nAt: {exception.StackTrace}.");
        };
        
    }
    public Img(string name = "", string type = "img") : base(name: name, type: type)
    {
       
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
        "void types from here-on",
        "img",
        "link",
        "br",
        "hr",
        "input",
        "source",
        "area",
        "base",
        "col",
        "embed",
        "img",
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
        Div.New("house");
        E.house.style = "color: red";
        Img.New("mac");
        Console.WriteLine(E.house.Build(E.mac.Build()));
        Console.WriteLine(S.house("a nested string"));
    }
}