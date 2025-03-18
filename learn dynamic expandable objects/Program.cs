using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Dynamic;
using System.Reflection.Metadata;
using System.Runtime.ExceptionServices;
using System.Text.RegularExpressions;

namespace learningDynamicExpandableObjexts;

public class WarningMessage
{
    public static string ElementAllreadyExists(string name)
    {
        return $"An element named '{name}' already exists; by creating another one, you are replacing the original '{name}' with the new '{name}'.";
    }

    public static string ChangedElementName(string name)
    {
        return $"Note: non-letter and non-number chars stripped from element-name '{name}'; element is called '{Regex.Replace(name, @"[^a-z^A-Z^0-9]", "")}'.";
    }

    public static string AttributeNotSet(string elementName, string attributeName)
    {
        return $"Unable to retrieve the value of attribute '{attributeName}' from element '{elementName}'; attribute '{attributeName}' has not yet been set.";
    }

    public static string ElementStringMethodNotInS(string elementName, bool invoke)
    {
        if(invoke == true)
        {
            return $"Could not invoke '{elementName}'; no element string method '{elementName}' found in 'Program.S'.";
        }
        else
        {
            return $"Could not retrieve the value of '{elementName}'; no element string method '{elementName}' found on 'Program.S'.";
        }
    }

    public static string ElementNotInE(string elementName)
    {
        return $"Unable to access element '{elementName}'; no html element instance named '{elementName}' found in 'Program.E'.";
    }

    public static string AttributeValueOverwrittenNotice(string elementName, string attributeName)
    {
        return $"Value of attribute '{attributeName}' on element '{elementName}' overwritten. To concatenate use: 'E.{elementName}.{attributeName} = E.{elementName}.{attributeName} + <YOUR VALUE>'";
    }

    public static string TryingToSetAttributeToNonStringValue(string elementName, string attributeName)
    {
        return $"'{elementName}.{attributeName}' must be a string value.";        
    }

    public static void Print(string message)
    {
        Console.ForegroundColor = ConsoleColor.DarkYellow;
        string oneIndent = "  ";
        string indent = "  ";
        string lineNumber;
        string characterNumber;
        //string writeNext;
        StackTrace stackTrace = new StackTrace(true);
        Console.WriteLine("Please note:");
        Console.ResetColor();
        Console.WriteLine($"{indent}{message}");
        foreach(StackFrame frame in stackTrace.GetFrames())
        {
            indent = indent + oneIndent;
            if(frame.GetFileLineNumber() == 0)
            {
                lineNumber = "'not determined'";
            }
            else
            {
                lineNumber = Convert.ToString(frame.GetFileLineNumber());
            }
            if(frame.GetFileColumnNumber() == 0)
            {
                characterNumber = "not determined";
            }
            else
            {
                characterNumber = Convert.ToString(frame.GetFileColumnNumber());
            }
            // writeNext = $"{indent}in file: {frame.GetFileName()}, in: {frame.GetMethod().Name}, at line: {lineNumber}, at character: {characterNumber}.";
            // foreach(char character in writeNext)
            // {
            //     if(character == '\n')
            //     {
            //         Console.Write($"character{indent}");
            //     }
            //     else
            //     {
            //         Console.Write(character);
            //     }
            // }
            Console.WriteLine($"{indent}in file: {frame.GetFileName()}, in: {frame.GetMethod().Name}, at line: {lineNumber}, at character: {characterNumber}.");
        };
    }
}

public class ElementStringMethods : DynamicObject
{
    public delegate string elementStringMethod(string nested);
    public readonly Dictionary<string, Delegate> elementStringMethods = new Dictionary<string, Delegate>();

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = 0;
        if(elementStringMethods.TryGetValue(binder.Name, out Delegate? value))
        {
            result = value;
            return true;
        }
        else
        {
            WarningMessage.Print(WarningMessage.ElementStringMethodNotInS(elementName: binder.Name, invoke: false));
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
        if(elementStringMethods.TryGetValue(binder.Name, out Delegate method))
        {
            //del.DynamicInvoke(args);
            result = method.DynamicInvoke(args);
            return true;
        }
        else
        {
            WarningMessage.Print(WarningMessage.ElementStringMethodNotInS(elementName: binder.Name, invoke: true));
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
        if(elementInstances.TryGetValue(binder.Name, out dynamic? result))
        {
            element = result;
            return true;
        }
        else
        {
            WarningMessage.Print(WarningMessage.ElementNotInE(elementName: binder.Name));
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
    public bool isVoidElement;
    public string name;
    public string type;
    protected string openingString;
    public string js;
    protected string closingString;

    public delegate string BuildElementString(string nested = "");

    public BuildElementString Build;

    protected readonly Dictionary<string, string> elementAttributes = new Dictionary<string, string>();

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        string newValue = "";       
        try
        {
            newValue = Convert.ToString(value);
        }
        catch(Exception ex)
        {
            WarningMessage.Print(WarningMessage.TryingToSetAttributeToNonStringValue(attributeName: binder.Name.ToLower(), elementName: this.name));
        }

        if(value.GetType() != typeof(String))
        {
            return false;
        }
        else
        {
            if(elementAttributes.TryGetValue(binder.Name.ToLower(), out string? result))
            {
                if(result.Length < newValue.Length)
                {
                    for(int i = 0; i < newValue.Length - result.Length; i++)
                    {
                        if(newValue.Substring(i, result.Length) == result)
                        {
                            elementAttributes[binder.Name.ToLower()] = newValue;
                            OpeningString();
                            BuildElementStringMethod();
                            AddStringMethodToElementStringMethods();
                            return true;
                        }
                    }
                }
                if(result != newValue)
                {
                    elementAttributes[binder.Name.ToLower()] = newValue;
                    OpeningString();
                    BuildElementStringMethod();
                    AddStringMethodToElementStringMethods();
                    WarningMessage.Print(WarningMessage.AttributeValueOverwrittenNotice(elementName: this.name, attributeName: binder.Name.ToLower()));
                    return true;
                }
            }
        }
        elementAttributes[binder.Name.ToLower()] = Convert.ToString(value);
        OpeningString();
        BuildElementStringMethod();
        AddStringMethodToElementStringMethods();
        return true;
    }

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = null;
        if(elementAttributes.TryGetValue(binder.Name.ToLower(), out string? value))
        {
            result = value;
            return true;
        }
        else
        {
            WarningMessage.Print(WarningMessage.AttributeNotSet(elementName: this.name, attributeName: binder.Name.ToLower()));
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

    private void RetrieveJsFromFile()
    {

    }

    private void RetrieveCssFromFile()
    {

    }

    private void MakeJsFile()
    {
        Directory.CreateDirectory($"{Directory.GetCurrentDirectory()}/JsAndCss/{this.name}");
        if(File.Exists($"{Directory.GetCurrentDirectory()}/JsAndCss/{this.name}/Js.js") == false)
        {
            StreamWriter writer = new StreamWriter(Directory.GetCurrentDirectory() + $"/JsAndCss/{this.name}/{this.name}.js");
        }
        
    }

    private void MakeCssFile()
    {

    }

    public HtmlElement(string name, bool isVoid, string type = "html")
    {
        this.type = type;
        this.isVoidElement = isVoid;
        this.name = $"{Regex.Replace(name, @"[^a-z^A-Z^0-9]", "")}";
        if(this.name != name)
        {
            WarningMessage.Print(WarningMessage.ChangedElementName(this.name));
        }
        
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
        this.MakeJsFile();
        this.MakeCssFile();
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
        string newName = $"{Regex.Replace(name, @"[^a-z^A-Z^0-9]", "")}";
        if(newName != name)
        {
            WarningMessage.Print(WarningMessage.ChangedElementName(name: name));
        }
        if(Program.E.elementInstances.TryGetValue(newName, out object? result))
        {
            WarningMessage.Print(WarningMessage.ElementAllreadyExists(newName));
        }
        Program.E.elementInstances[newName] = new HtmlElement(name: newName, isVoid: isVoid, type: type);
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
        NewElement.Div("hou/se");
        NewElement.Div("house");
        E.house.style = "color: red";
        E.house.Style = "color:";
        E.house.style = E.house.style + " blue";
        NewElement.Img("mac");
        E.mac.source = "\"a picture of Mac\"";
        Console.WriteLine(S.house(S.mac("a nested string")));    
    }
}