using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
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
        public IEnumerable<Token> Get()
        {
            var libraries =
                Directory.GetFiles($"Lib/{_plataform.ToString().ToLower()}/");
            var tokens = new List<Token>();
            foreach (var library in libraries)
            {
                var explorer = new Pkcs11Explorer(library);
                var libTokens = explorer.GetTokens();
                tokens.AddRange(libTokens);
            }
            return tokens;
        }
    }
}