namespace Assinador.Models
{
    using Pkcs7lib;
    public class Parametro
    {
        public Token token { get; set; }
        public Arquivo[] files { get; set; }
    }
}