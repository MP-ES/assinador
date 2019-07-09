using System;
using System.Security.Cryptography.X509Certificates;

namespace Assinador.Configs
{
    public static class Certificate
    {
        public static bool Verify(string name, string password = null)
        {
            var collection = new X509Certificate2Collection();
            collection.Import(name, password, X509KeyStorageFlags.PersistKeySet);
            foreach (var certificate in collection)
                if (!certificate.Verify()) return false;
            return true;
        }

        public static bool Install(string name, string password = null)
        {
            try
            {
                var collection = new X509Certificate2Collection();
                collection.Import(name, password, X509KeyStorageFlags.PersistKeySet);
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

        public static bool Remove(string name, string password = null)
        {
            try
            {
                var collection = new X509Certificate2Collection();
                collection.Import(name, password, X509KeyStorageFlags.PersistKeySet);
                var store = new X509Store(StoreName.Root, StoreLocation.CurrentUser);
                store.Open(OpenFlags.ReadWrite);
                foreach (var certificate in collection)
                {
                    store.Remove(certificate);
                }
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