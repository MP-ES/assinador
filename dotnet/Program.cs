using System;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;
using Assinador.Configs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace assinador
{
    public static class Program
    {
        private const int _DefaultPort = 19333;

        public static void Main()
        {
            try
            {
                var certMgr = new CertificateManager();
                certMgr.Check();
                CreateHostBuilder(certMgr).Build().Run();
            }
            catch (Exception ex)
            {
                Console.Write(UnfoldException(ex));
            }
        }

        public static IHostBuilder CreateHostBuilder(CertificateManager certificateManager) =>
            Host.CreateDefaultBuilder()
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseKestrel()
                    .ConfigureKestrel((context, options) =>
                    {
                        int.TryParse(context.Configuration["ASSINADOR_MPES_PORTA"], out var port);
                        options.Limits.MaxRequestBodySize = 10 * 1024;
                        options.Listen(IPAddress.Loopback,
                            port > 0 ? port : _DefaultPort,
                            listenOptions =>
                            listenOptions.UseHttps(certificateManager.certificate));
                    })
                    .UseStartup<Startup>();
            });

        private static string UnfoldException(Exception ex)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Message:");
            builder.AppendLine(ex.Message);
            builder.AppendLine();
            builder.AppendLine("Stack:");
            builder.AppendLine(ex.StackTrace);
            builder.AppendLine();
            if (ex.InnerException != null)
            {
                builder.AppendLine();
                builder.AppendLine("===> InnerExcepption:");
                builder.Append(UnfoldException(ex.InnerException));
            }
            return builder.ToString();
        }
    }
}
