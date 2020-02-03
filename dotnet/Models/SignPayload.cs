namespace Assinador.Models
{
    public class SignPayload
    {
        public Token Token { get; set; }
        public byte[] Hash { get; set; }
        public string AlgoritmoHash { get; set; }
        public string EsquemaAssinatura { get; set; }
    }
}