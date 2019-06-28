namespace Assinador.Models
{
    public class ArquivoAssinado
    {
        public int Id { get; set; }
        public bool Assinado { get; set; }
        public byte[] Assinatura { get; set; }
        public string Error { get; set; }
    }
}