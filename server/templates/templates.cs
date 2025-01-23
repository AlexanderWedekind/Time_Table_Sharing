

namespace templates
{
    struct templates
    {
        public static string AnyOneFile(string filePath)
        {
            string content = "";
            Console.WriteLine("'AnyOneFile()' preparing to retrieve file: \" " + filePath + " \"");
            TextReader textReader = new StreamReader(filePath);
            content = textReader.ReadToEnd();
            return content;
        }
    }
}