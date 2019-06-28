using System;
using System.Linq;
using System.Net;
using Assinador.Configs;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace Assinador
{
    public class Program
    {
        const string cert_name = "local.pfx";

        public static void Main(string[] args)
        {
            if (!Certificate.Verify(cert_name))
                Certificate.Install(cert_name);

            if (!Certificate.Verify(cert_name))
                return;

            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            var apiPort = findArgValue<int>(args, "port");
            if (apiPort > 0)
                return WebHost.CreateDefaultBuilder(args)
                    .UseContentRoot(AppDomain.CurrentDomain.BaseDirectory)
                    .UseKestrel()
                    .ConfigureKestrel((context, options) =>
                                        {
                                            options.Listen(IPAddress.Loopback, apiPort, listenOptions =>
                                            {
                                                listenOptions.UseHttps(cert_name);
                                            });
                                        })
                    .UseStartup<Startup>();

            return WebHost.CreateDefaultBuilder(args)
                .UseContentRoot(AppDomain.CurrentDomain.BaseDirectory)
                .UseStartup<Startup>();
        }

        private static T findArgValue<T>(string[] args, string argName)
        {
            var value = args.FirstOrDefault(a => a.ToUpper().Contains(argName.ToUpper()));
            if (string.IsNullOrWhiteSpace(value))
                return default(T);
            else
                return (T)Convert.ChangeType(value.Replace($"{argName}=", ""), typeof(T));
        }
    }
}
