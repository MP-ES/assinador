using System.Reflection;
using Assinador.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Assinador.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;

        public HealthController(ILogger<HealthController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public Health Get()
        {
            var version = $"{Assembly.GetEntryAssembly().GetName().Version.Major}.{Assembly.GetEntryAssembly().GetName().Version.Minor}.{Assembly.GetEntryAssembly().GetName().Version.Revision}";
            return new Health
            {
                Version = version
            };
        }
    }
}
