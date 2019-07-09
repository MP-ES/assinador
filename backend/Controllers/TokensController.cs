using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using Assinador.Models;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1;
using Pkcs7lib;

namespace Assinador.Controllers
{
    [Produces("application/json")]
    [Route("api/tokens")]
    public class TokensController : Controller
    {
        static OSPlatform _plataform =
            RuntimeInformation.IsOSPlatform(OSPlatform.Linux) ?
            OSPlatform.Linux :
            RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ?
            OSPlatform.OSX : OSPlatform.Windows;

        [HttpGet]
        public IEnumerable<TokenDTO> Get()
        {
            var libraries =
                Directory.GetFiles($"Lib/{_plataform.ToString().ToLower()}/");
            var tokens = new List<TokenDTO>();
            foreach (var library in libraries)
            {
                var explorer = new Pkcs11Explorer(library);
                var libTokens = explorer.GetTokens();

                foreach (var token in libTokens)
                {
                    var priv = new List<PrivateKey>();
                    var certs = new List<Certificate>();
                    explorer.GetTokenObjects(token, false, null, out priv, out certs);
                    var cert = certs.FirstOrDefault(c =>
                        new X509Certificate2(c.Data)
                        .Extensions.Cast<X509Extension>()
                        .Where(e => e.Oid.Value == "2.5.29.17")
                        .Select(e => Asn1Object.FromByteArray(e.RawData).ToString())
                        .FirstOrDefault(d => d.Contains("2.16.76.1.3.1")) != null);

                    if (cert != null)
                        tokens.Add(new TokenDTO(library, token.SerialNumber, token.Label, cert.Label));
                }
            }
            return tokens;
        }
    }
}
