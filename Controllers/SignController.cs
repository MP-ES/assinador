using Assinador.Models;
using Microsoft.AspNetCore.Mvc;
using Pkcs7lib;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;

namespace Assinador.Controllers
{
    [Route("api/sign")]
    public class SignController : Controller
    {
        [HttpPost]
        public IEnumerable<ArquivoAssinado> SignFiles([FromBody] Parametro bodyContent)
        {
            using (var pkcs7SignatureGenerator =
                        new Pkcs7SignatureGenerator(bodyContent.token.LibraryPath,
                                                    bodyContent.token.SerialNumber,
                                                    bodyContent.token.Label,
                                                    bodyContent.token.Password))
            {
                var arquivosAssinados = new List<ArquivoAssinado>();

                var signingCertificate = pkcs7SignatureGenerator.GetSigningCertificate();
                var otherCertificates = pkcs7SignatureGenerator.GetAllCertificates();
                var certPath = CertUtils.BuildCertPath(signingCertificate, otherCertificates, true);
                var bouncyCertificate = CertUtils.ToBouncyCastleObject(signingCertificate);

                foreach (var arquivo in bodyContent.files)
                {
                    try
                    {
                        var hashOid = Oid.FromFriendlyName(arquivo.AlgoritmoHash.ToLower(), OidGroup.HashAlgorithm);
                        var digest = HashAlgorithmUtils.GetDigest(hashOid);
                        var signature =
                                pkcs7SignatureGenerator.GenerateDetachedSignature(
                                    arquivo.Hash,
                                    hashOid.Value,
                                    digest,
                                    bouncyCertificate,
                                    certPath);

                        arquivosAssinados.Add(new ArquivoAssinado
                        {
                            Id = arquivo.Id,
                            Assinado = true,
                            Assinatura = signature
                        });
                    }
                    catch (Exception ex)
                    {
                        arquivosAssinados.Add(new ArquivoAssinado
                        {
                            Id = arquivo.Id,
                            Assinado = false,
                            Error = ex.ToString()
                        });
                    }
                }

                return arquivosAssinados;
            }
        }
    }
}
