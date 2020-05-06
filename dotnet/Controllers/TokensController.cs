using Assinador.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Asn1;
using Pkcs7lib;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using Token = Assinador.Models.Token;

namespace Assinador.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TokensController : ControllerBase
    {
        private readonly string _libsPath;

        public TokensController(IConfiguration configuration)
        {
            _libsPath = configuration["LibsPath"];
        }

        [HttpGet]
        public IEnumerable<Token> Get()
        {
            var libraries = Directory.GetFiles(_libsPath ?? "libs/");
            var tokens = new List<Token>();
            foreach (var library in libraries)
            {
                try
                {
                    var explorer = new Pkcs11Explorer(library);
                    var libTokens = explorer.GetTokens();

                    tokens.AddRange(from token in libTokens
                                    let certs = explorer.GetCertificates(token)
                                    let icpBrasilCerts = certs.Where(c =>
                                        new X509Certificate2(c.Data).Extensions.Cast<X509Extension>()
                                            .Where(e => e.Oid.Value == "2.5.29.17")
                                            .Select(e => Asn1Object.FromByteArray(e.RawData).ToString())
                                            .FirstOrDefault(d => d.Contains("2.16.76.1.3.1")) != null)
                                    from cert in icpBrasilCerts
                                    let x509 = new X509Certificate2(cert.Data)
                                    let expires = x509.NotAfter.ToString("dd/MM/yyyy")
                                    select new Token(library, token.SerialNumber, token.Label, cert.Id, cert.Label,
                                        $"{cert.Label} {expires}", DateTime.Now.Between(x509.NotBefore, x509.NotAfter)));
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Ocoreu o seguinte erro ao carregar a biblioteca '{library}':");
                    Console.Write(ex.Message);
                    continue;
                }
            }
            return tokens
                .OrderBy(t => t.DisplayName)
                .ThenByDescending(t => t.Valid);
        }
    }
}
