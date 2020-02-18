using Assinador.Models;
using Microsoft.AspNetCore.Mvc;
using Pkcs7lib;
using System.Security.Cryptography;

namespace Assinador.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SignController : ControllerBase
    {
        [HttpPost]
        public SignResponse Post([FromBody] SignPayload payload)
        {
            var response = new SignResponse();

            using(var pkcs7SignatureGenerator =
                new Pkcs7SignatureGenerator(payload.Token.LibraryPath,
                    payload.Token.SerialNumber,
                    payload.Token.Label,
                    payload.Token.Password,
                    payload.Token.CertId))
            {
                var hashOid = Oid.FromFriendlyName(payload.AlgoritmoHash.ToLower(), OidGroup.HashAlgorithm);
                var signature = pkcs7SignatureGenerator.GenerateSignature(payload.Hash, hashOid.Value);
                var signCertificate = pkcs7SignatureGenerator.GetSigningCertificate();
                var otherCertificates = pkcs7SignatureGenerator.GetAllCertificates();

                response.SignCertificate = signCertificate;
                response.OtherCertificates = otherCertificates;
                response.Assinatura = signature;
            }

            return response;
        }
    }
}
