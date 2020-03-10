using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using Assinador.Extensions;

namespace Assinador.Configs
{
    public class CertificateManager
    {
        private readonly X509Certificate2Collection collection = new X509Certificate2Collection();
        public readonly X509Certificate2 certificate;
        private readonly byte[] rootCABuffer;

        public CertificateManager()
        {
            var cert_resource = "assinador.certificates.linux.localhost.pfx";
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                const string root_resource = "assinador.certificates.linux.localhost-root-ca.crt";
                var streamRoot = typeof(CertificateManager)
                    .Assembly
                    .GetManifestResourceStream(root_resource);
                var bufferRoot = new byte[streamRoot.Length];
                streamRoot.Read(bufferRoot, 0, (int)streamRoot.Length);
                rootCABuffer = bufferRoot;
                collection.Import(bufferRoot, null, X509KeyStorageFlags.PersistKeySet);
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                cert_resource = "assinador.certificates.win.localhost.pfx";
            }

            var streamCertificate = typeof(CertificateManager)
                .Assembly
                .GetManifestResourceStream(cert_resource);
            var bufferCertificate = new byte[streamCertificate.Length];
            streamCertificate.Read(bufferCertificate, 0, (int)streamCertificate.Length);
            collection.Import(bufferCertificate, null, X509KeyStorageFlags.PersistKeySet);

            if (collection.Count > 0)
                certificate = collection[collection.Count - 1];
        }

        public void Check()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                if (!Verify())
                    Install();
                if (!Verify())
                    return;
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                var certPath = Path.Join("/",
                    "etc",
                    "pki",
                    "ca-trust",
                    "source",
                    "anchors",
                    "root-localhost-ca.crt");
                if (!File.Exists(certPath))
                {
                    File.WriteAllBytes(certPath, rootCABuffer);
                    $"chmod 0755 {certPath}".Bash();
                    "update-ca-trust".Bash();
                }
            }
        }

        public bool Verify()
        {
            foreach (var certificate in collection)
            {
                if (!certificate.Verify())
                    return false;
            }
            return true;
        }

        public bool Install()
        {
            try
            {
                var store = new X509Store(StoreName.Root, StoreLocation.CurrentUser);
                store.Open(OpenFlags.ReadWrite);
                foreach (var certificate in collection)
                    store.Add(certificate);
                store.Close();
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex);
                return false;
            }
        }
    }
}