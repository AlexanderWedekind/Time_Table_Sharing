

namespace templates
{
    struct templates
    {
        public static string AnyOneFile(string path)
        {
            string content = "";
            string filePath = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().Length - Directory.GetCurrentDirectory().Substring(Directory.GetCurrentDirectory().LastIndexOf("\\") + 1).Length) + path;
            Console.WriteLine("'AnyOneFile()' preparing to retrieve file: \" " + filePath + " \"");
            TextReader textReader = new StreamReader(filePath);
            content = textReader.ReadToEnd();
            return content;
        }
    }
}