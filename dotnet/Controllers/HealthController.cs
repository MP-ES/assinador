using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace Assinador.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return new ObjectResult(new
            {
                Version = $"{Assembly.GetEntryAssembly().GetName().Version.Major}.{Assembly.GetEntryAssembly().GetName().Version.Minor}.{Assembly.GetEntryAssembly().GetName().Version.Revision}"
            });
        }
    }
}
