namespace Assinador.Models
{
    public class Arquivo
    {
        public int Id { get; set; }
        public byte[] Hash { get; set; }
        public string AlgoritmoHash { get; set; }
    }
}