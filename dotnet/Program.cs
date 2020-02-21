using Assinador.Configs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;

namespace assinador
{
    public class Program
    {
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
                    .ConfigureKestrel((_, options) =>
                    {
                        options.Limits.MaxRequestBodySize = 10 * 1024;
                        options.Listen(IPAddress.Loopback,
                            GetAvailablePort(19333),
                            listenOptions =>
                            listenOptions.UseHttps(certificateManager.certificate));
                    })
                    .UseStartup<Startup>();
            });

        public static int GetAvailablePort(int startingPort)
        {
            var properties = IPGlobalProperties.GetIPGlobalProperties();

            //getting active connections
            var tcpConnectionPorts = properties.GetActiveTcpConnections()
                .Where(n => n.LocalEndPoint.Port >= startingPort)
                .Select(n => n.LocalEndPoint.Port);

            //getting active tcp listners - WCF service listening in tcp
            var tcpListenerPorts = properties.GetActiveTcpListeners()
                .Where(n => n.Port >= startingPort)
                .Select(n => n.Port);

            //getting active udp listeners
            var udpListenerPorts = properties.GetActiveUdpListeners()
                .Where(n => n.Port >= startingPort)
                .Select(n => n.Port);

            var port = Enumerable.Range(startingPort, ushort.MaxValue)
                .Where(i => !tcpConnectionPorts.Contains(i))
                .Where(i => !tcpListenerPorts.Contains(i))
                .Where(i => !udpListenerPorts.Contains(i))
                .FirstOrDefault();

            return port;
        }

        private static string UnfoldException(Exception ex)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Message:");
            builder.AppendLine($"{ex.Message}");
            builder.AppendLine();
            builder.AppendLine("Stack:");
            builder.AppendLine($"{ex.StackTrace}");
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
