using System;
using System.Collections.Generic;
using Net.Pkcs11Interop.Common;
using Net.Pkcs11Interop.HighLevelAPI;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;

namespace Pkcs7lib
{
    /// <summary>
    /// Explores devices accessible via PKCS#11 interface
    /// </summary>
    public class Pkcs11Explorer : IDisposable
    {
        /// <summary>
        /// Flag indicating whether instance has been disposed
        /// </summary>
        private bool _disposed = false;
        private readonly string _libraryPath;

        /// <summary>
        /// High level PKCS#11 wrapper
        /// </summary>
        private IPkcs11Library _pkcs11Library = null;

        private Pkcs11InteropFactories factories = new Pkcs11InteropFactories();

        /// <summary>
        /// Initializes a new instance of the Pkcs11Explorer class
        /// </summary>
        /// <param name="libraryPath">Path to the unmanaged PCKS#11 library</param>
        public Pkcs11Explorer(string libraryPath)
        {
            if (string.IsNullOrEmpty(libraryPath))
                throw new ArgumentNullException("libraryPath");

            _libraryPath = libraryPath;
            _pkcs11Library = factories.Pkcs11LibraryFactory.LoadPkcs11Library(factories, libraryPath, AppType.MultiThreaded);
        }

        /// <summary>
        /// Gets list of tokens (smartcards) accessible via PKCS#11 interface
        /// </summary>
        /// <returns></returns>
        public List<Token> GetTokens()
        {
            if (this._disposed)
                throw new ObjectDisposedException(this.GetType().FullName);

            List<Token> tokens = new List<Token>();

            List<ISlot> slots = _pkcs11Library.GetSlotList(SlotsType.WithTokenPresent);
            foreach (ISlot slot in slots)
            {
                ITokenInfo tokenInfo = null;

                try
                {
                    tokenInfo = slot.GetTokenInfo();
                }
                catch (Pkcs11Exception ex)
                {
                    if (ex.RV != CKR.CKR_TOKEN_NOT_RECOGNIZED && ex.RV != CKR.CKR_TOKEN_NOT_PRESENT)
                        throw;
                }

                if (tokenInfo != null)
                    tokens.Add(new Token(slot, tokenInfo.ManufacturerId, tokenInfo.Model, tokenInfo.SerialNumber, tokenInfo.Label, _libraryPath));
            }

            return tokens;
        }

        public List<Certificate> GetCertificates(Token token)
        {
            var certificates = new List<Certificate>();

            using var session = token.Slot.OpenSession(SessionType.ReadOnly);
            var searchTemplate = new List<IObjectAttribute>
            {
                factories.ObjectAttributeFactory.Create(CKA.CKA_CLASS, CKO.CKO_CERTIFICATE),
                factories.ObjectAttributeFactory.Create(CKA.CKA_CERTIFICATE_TYPE, CKC.CKC_X_509)
            };

            var foundObjects = session.FindAllObjects(searchTemplate);
            if (foundObjects.Count < 1)
                throw new ObjectNotFoundException("Nenhum certificado encontrado");
            else
            {
                var certAttributes = new List<CKA>
                {
                    CKA.CKA_ID,
                    CKA.CKA_LABEL,
                    CKA.CKA_VALUE
                };
                foreach (var foundObject in foundObjects)
                {
                    var objectAttributes = session.GetAttributeValue(foundObject, certAttributes);

                    string ckaId = ConvertUtils.BytesToHexString(objectAttributes[0].GetValueAsByteArray());
                    string ckaLabel = objectAttributes[1].GetValueAsString();
                    byte[] ckaValue = objectAttributes[2].GetValueAsByteArray();

                    certificates.Add(new Certificate(ckaId, ckaLabel, ckaValue));
                }
            }

            return certificates;
        }

        #region IDisposable

        /// <summary>
        /// Disposes object
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes object
        /// </summary>
        /// <param name="disposing">Flag indicating whether managed resources should be disposed</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!this._disposed)
            {
                // Dispose managed objects
                if (disposing)
                {
                    if (_pkcs11Library != null)
                    {
                        _pkcs11Library.Dispose();
                        _pkcs11Library = null;
                    }
                }

                // Dispose unmanaged objects

                _disposed = true;
            }
        }

        /// <summary>
        /// Class destructor that disposes object if caller forgot to do so
        /// </summary>
        ~Pkcs11Explorer()
        {
            Dispose(false);
        }

        #endregion
    }
}
