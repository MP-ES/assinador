using Microsoft.AspNetCore.Mvc;

namespace Assinador.Controllers
{
    [Produces("application/json")]
    [Route("health")]
    public class StatusController : Controller
    {
        [HttpGet]
        public string Get()
        {
            return "Alive!";
        }
    }
}