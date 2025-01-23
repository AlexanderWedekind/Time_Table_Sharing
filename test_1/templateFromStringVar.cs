

namespace stringVarTemplate
{
    public class stringVarTemplate
    {
        public static string template =
        """
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>Hello World! from string variable</h1>
        </body>
        </html>
        """
        ;

        public static string StringFromMethod()
        {
            return
            """
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <h1>Hello World! from Method return value</h1>
            </body>
            </html>
            """;
        }
    }
}