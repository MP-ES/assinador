using System;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;
using Assinador.Configs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
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
                        bool.TryParse(context.Configuration["ASSINADOR_MPES_HTTP"], out var http);
                        int.TryParse(context.Configuration["ASSINADOR_MPES_PORTA"], out var port);
                        int.TryParse(context.Configuration["ASSINADOR_MPES_HTTP_VERSAO"], out var version);
                        options.Limits.MaxRequestBodySize = 10 * 1024;
                        options.Limits.MaxConcurrentConnections = 100;
                        options.Limits.MaxConcurrentUpgradedConnections = 100;
                        options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
                        options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(1);
                        if (http)
                        {
                            options.Listen(IPAddress.Loopback, port > 0 ? port : _DefaultPort);
                        }
                        else
                        {
                            options.Listen(IPAddress.Loopback,
                                port > 0 ? port : _DefaultPort,
                                listenOptions =>
                                {
                                    listenOptions.UseHttps(certificateManager.certificate);
                                    listenOptions.Protocols = GetHttpProtocolVersion(version);
                                });
                        }
                    })
                    .UseStartup<Startup>();
            });

        private static HttpProtocols GetHttpProtocolVersion(int version)
        {
            if (version < 0)
                return HttpProtocols.None;
            if (version == 1)
                return HttpProtocols.Http1;
            if (version == 3)
                return HttpProtocols.Http1AndHttp2;
            return HttpProtocols.Http2;
        }

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
