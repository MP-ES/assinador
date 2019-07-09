using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using Assinador.Models;
using Microsoft.AspNetCore.Mvc;
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
                    tokens.Add(new TokenDTO(library, token.SerialNumber, token.Label, certs.Last().Label));
                }
            }
            return tokens;
        }
    }
}