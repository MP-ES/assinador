using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Pkcs7lib;

namespace Assinador.Controllers
{
    [Produces("application/json")]
    [Route("api/tokens")]
    public class TokensController : Controller
    {
        static IReadOnlyList<string> _libraries =
            new string[] {
                "Lib/aetpkss1.dll",
                "Lib/eps2003csp11.dll",
                "Lib/eToken.dll"
            };

        [HttpGet]
        public IEnumerable<Token> Get()
        {
            var tokens = new List<Token>();
            foreach (var library in _libraries)
            {
                var explorer = new Pkcs11Explorer(library);
                var libTokens = explorer.GetTokens();
                tokens.AddRange(libTokens);
            }
            return tokens;
        }
    }
}
