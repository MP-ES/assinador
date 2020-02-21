using Assinador.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger _logger;

        public TokensController(IConfiguration configuration, ILogger<TokensController> logger)
        {
            _libsPath = configuration["LibsPath"];
            _logger = logger;
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

                    foreach (var token in libTokens)
                    {
                        var certs = explorer.GetCertificates(token);
                        var icpBrasilCerts = certs.Where(c =>
                            new X509Certificate2(c.Data)
                            .Extensions
                            .Cast<X509Extension>()
                            .Where(e => e.Oid.Value == "2.5.29.17")
                            .Select(e => Asn1Object.FromByteArray(e.RawData).ToString())
                            .FirstOrDefault(d => d.Contains("2.16.76.1.3.1")) != null);

                        foreach (var cert in icpBrasilCerts)
                        {
                            var x509 = new X509Certificate2(cert.Data);
                            var expires = x509.NotAfter.ToString("dd/MM/yyyy");
                            tokens.Add(new Token(
                                library,
                                token.SerialNumber,
                                token.Label,
                                cert.Id,
                                cert.Label,
                                $"{cert.Label} {expires}",
                                DateTime.Now.Between(x509.NotBefore, x509.NotAfter)
                            ));
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Ocoreu o seguinte erro ao carregar a biblioteca '{library}': {ex.Message}");
                    continue;
                }
            }
            return tokens
                .OrderBy(t => t.DisplayName)
                .ThenByDescending(t => t.Valid);
        }
    }
}
