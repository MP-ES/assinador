using System.Collections.Generic;

namespace Assinador.Models
{
    public class SignResponse
    {
        public byte[] Assinatura { get; set; }
        public byte[] SignCertificate { get; set; }
        public IList<byte[]> OtherCertificates { get; set; }
    }
}
