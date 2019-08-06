using System;
using System.Net;
using System.Runtime.InteropServices;
using Assinador.Configs;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace Assinador
{
    public class Program
    {
        static string cert_name = "local.pfx";

        public static void Main(string[] args)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                if (!Certificate.Verify(cert_name))
                    Certificate.Install(cert_name);
                if (!Certificate.Verify(cert_name))
                    return;
            }
            BuildWebHost().Run();
        }

        public static IWebHost BuildWebHost() => WebHost
            .CreateDefaultBuilder()
            .UseContentRoot(AppDomain.CurrentDomain.BaseDirectory)
            .UseKestrel()
            .ConfigureKestrel((context, options) =>
            {
                options.Listen(IPAddress.Loopback, 19333, listenOptions =>
                {
                    listenOptions.UseHttps(cert_name);
                });
            })
            .UseStartup<Startup>()
            .Build();
    }
}
