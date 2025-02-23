using System.ComponentModel;

namespace callMethodFromStruct;

public class ItemMethods
{
    public static (string opening, string closing) ComposeItemStrings(ref string opening, ref string closing, string name, Dictionary<string, string> attributeStrings)
    {
        opening = $"<{name}";
        foreach(var attribute in attributeStrings)
        {
            opening += $" {attribute.Key}=\"{attribute.Value}\"";
        }
        opening += ">";
        closing = $"</{name}>";
        return (opening, closing);
    }
}
class Item
{
    protected string name = "";
    protected string type = "";
    protected string firstString = "";
    protected string nestedString = "";
    protected string secondString = "";
    
    protected Dictionary<string, string> attributeStrings = new Dictionary<string, string>();

    public struct AttributeMethod
    {
        Item parent;
        string attributeName;
        public void Replace(string value)
        {
            if(parent.attributeStrings.ContainsKey(attributeName))
            {
                parent.attributeStrings[attributeName] = value;
                ItemMethods.ComposeItemStrings(opening: ref parent.firstString, closing: ref parent.secondString, name: parent.name, attributeStrings: parent.attributeStrings);
                Program.Items[parent.name] = parent.Build;
            }
            else
            {
                parent.attributeStrings.Add(attributeName, value);
                ItemMethods.ComposeItemStrings(opening: ref parent.firstString, closing: ref parent.secondString, name: parent.name, attributeStrings: parent.attributeStrings);
                Program.Items[parent.name] = parent.Build;
            }
        }
        public void Add(string value)
        {
            if(parent.attributeStrings.ContainsKey(attributeName))
            {
                parent.attributeStrings[attributeName] = parent.attributeStrings[attributeName] + value;
                ItemMethods.ComposeItemStrings(opening: ref parent.firstString, closing: ref parent.secondString, name: parent.name, attributeStrings: parent.attributeStrings);
                Program.Items[parent.name] = parent.Build;
            }
            else
            {
                parent.attributeStrings.Add(attributeName, value);
                ItemMethods.ComposeItemStrings(opening: ref parent.firstString, closing: ref parent.secondString, name: parent.name, attributeStrings: parent.attributeStrings);
                Program.Items[parent.name] = parent.Build;
            }
        }
        public AttributeMethod(string attributeName, Item parent)
        {
            this.attributeName = attributeName;
            this.parent = parent;
        }
    }
    public AttributeMethod style;
    public AttributeMethod onclick;
    public AttributeMethod onhover;
    
    protected string Build(string nested = "")
    {
        return firstString + nestedString + nested + secondString;
    }
    public Item(string type = "", string name = "")
    {
        this.name = name;
        this.type = type;
        if(name != "")
        {
            nestedString = $"<h1>My name is '{name}'</h1>";
        }
        style = new AttributeMethod("style", this);
        onclick = new AttributeMethod("onclick", this);
        onhover = new AttributeMethod("onhover", this);
        ItemMethods.ComposeItemStrings(opening: ref this.firstString, closing: ref this.secondString, this.name, this.attributeStrings);
        Program.Items[name] = this.Build;
    }
    
}

class Div : Item
{
    public Div(string name) : base(name: name, type: "div")
    {
       
    }
    public void Create(string name)
    {
        Div div = new Div(name);
        Program.Items[name] = div.Build;
    }
}

class P : Item
{

}

public class Program
{
    public delegate string Build(string nested = "");
    public static Dictionary<string, Build> Items = new Dictionary<string, Build>();
    public static void Main()
    {
        Div div1 = new Div("Cecil Beaton");
        div1.onhover.Add("first hover");
        div1.onhover.Replace("second hover");
        Div div2 = new Div("Ozzymandrius");
        div2.onclick.Add("I got");
        div2.onclick.Add("clicked");

        Console.WriteLine(Items["Cecil Beaton"](Items["Ozzymandrius"]()));
    }
}