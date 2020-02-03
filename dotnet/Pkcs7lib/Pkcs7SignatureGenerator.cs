using System;
using System.Collections.Generic;
using Net.Pkcs11Interop.Common;
using Net.Pkcs11Interop.HighLevelAPI;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using BCX509 = Org.BouncyCastle.X509;

namespace Pkcs7lib
{
    /// <summary>
    /// PKCS#7 signature creator that uses RSA private key stored on PKCS#11 compatible device.
    /// In multithreaded environment one instance of this class should be reused by all the threads.
    /// </summary>
    public class Pkcs7SignatureGenerator : IDisposable
    {
        #region Variables
        private static Pkcs11InteropFactories _factories = new Pkcs11InteropFactories();

        /// <summary>
        /// Flag indicating whether instance has been disposed
        /// </summary>
        private bool _disposed = false;

        /// <summary>
        /// High level PKCS#11 wrapper
        /// </summary>
        private IPkcs11Library _pkcs11 = null;

        /// <summary>
        /// Logical reader with token used for signing
        /// </summary>
        private ISlot _slot = null;

        /// <summary>
        /// Master session where user is logged in
        /// </summary>
        private ISession _session = null;

        /// <summary>
        /// Handle of private key used for signing 
        /// </summary>
        private IObjectHandle _privateKeyHandle = null;

        /// <summary>
        /// Identifier (value of CKA_ID attribute) of the private key used for signing
        /// </summary>
        private string _ckaId = null;

        /// <summary>
        /// Hash algorihtm used for the signature creation
        /// </summary>
        private HashAlgorithm _hashAlgorihtm = HashAlgorithm.SHA256;

        /// <summary>
        /// Raw data of certificate related to private key used for signing
        /// </summary>
        private byte[] _signingCertificate = null;

        /// <summary>
        /// Raw data of all certificates stored in device
        /// </summary>
        private List<byte[]> _allCertificates = null;

        #endregion

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the Pkcs7Signature class
        /// </summary>
        /// <param name="libraryPath">Path to the unmanaged PCKS#11 library</param>
        /// <param name="tokenSerial">Serial number of the token (smartcard) that contains signing key. May be null if tokenLabel is specified.</param>
        /// <param name="tokenLabel">Label of of the token (smartcard) that contains signing key. May be null if tokenSerial is specified.</param>
        /// <param name="pin">PIN for the token (smartcard)</param>
        /// <param name="ckaLabel">Label (value of CKA_LABEL attribute) of the private key used for signing. May be null if ckaId is specified.</param>
        /// <param name="ckaId">Hex encoded string with identifier (value of CKA_ID attribute) of the private key used for signing. May be null if ckaLabel is specified.</param>
        /// <param name="hashAlgorihtm">Hash algorihtm used for the signature creation</param>
        /// <param name="signatureScheme">Signature scheme used for the signature creation</param>
        public Pkcs7SignatureGenerator(
            string libraryPath,
            string tokenSerial,
            string tokenLabel,
            string pin,
            string ckaId)
        {
            var hashAlgorihtm = HashAlgorithm.SHA256;

            try
            {
                if (string.IsNullOrEmpty(libraryPath))
                    throw new ArgumentNullException("libraryPath");

                _pkcs11 = _factories.Pkcs11LibraryFactory.LoadPkcs11Library(_factories, libraryPath, AppType.MultiThreaded);
                _slot = FindSlot(tokenSerial, tokenLabel);

                if (_slot == null)
                    throw new TokenNotFoundException(string.Format("Token with serial \"{0}\" and label \"{1}\" was not found", tokenSerial, tokenLabel));

                _session = _slot.OpenSession(SessionType.ReadOnly);
                _session.Login(CKU.CKU_USER, pin);
                _ckaId = ckaId;
                _privateKeyHandle = FindPrivateKey(_ckaId);

                if (!Enum.IsDefined(typeof(HashAlgorithm), hashAlgorihtm))
                    throw new ArgumentException("Invalid hash algorithm specified");

                _hashAlgorihtm = hashAlgorihtm;
            }
            catch
            {
                if (_session != null)
                {
                    _session.Dispose();
                    _session = null;
                }

                if (_pkcs11 != null)
                {
                    _pkcs11.Dispose();
                    _pkcs11 = null;
                }

                throw;
            }
        }

        #endregion

        #region Certificates

        /// <summary>
        /// Gets the raw data of certificate related to private key used for signing
        /// </summary>
        /// <returns>Raw data of certificate related to private key used for signing</returns>
        public byte[] GetSigningCertificate()
        {
            if (this._disposed)
                throw new ObjectDisposedException(this.GetType().FullName);

            // Don't read certificate from token if it has already been read
            if (_signingCertificate == null)
            {
                using(var session = _slot.OpenSession(SessionType.ReadOnly))
                {
                    // Obtem label e ID da chave privada
                    var keyAttributes = new List<CKA>();
                    keyAttributes.Add(CKA.CKA_ID);
                    keyAttributes.Add(CKA.CKA_LABEL);
                    var keyObjectAttributes = session.GetAttributeValue(_privateKeyHandle, keyAttributes);
                    var ckaId = keyObjectAttributes[0].GetValueAsByteArray();
                    var ckaLabel = keyObjectAttributes[1].GetValueAsString();

                    var searchTemplate = new List<IObjectAttribute>();
                    searchTemplate.Add(_factories.ObjectAttributeFactory.Create(CKA.CKA_CLASS, CKO.CKO_CERTIFICATE));
                    searchTemplate.Add(_factories.ObjectAttributeFactory.Create(CKA.CKA_CERTIFICATE_TYPE, CKC.CKC_X_509));
                    if (!string.IsNullOrEmpty(ckaLabel))
                        searchTemplate.Add(_factories.ObjectAttributeFactory.Create(CKA.CKA_LABEL, ckaLabel));
                    if (ckaId != null)
                        searchTemplate.Add(_factories.ObjectAttributeFactory.Create(CKA.CKA_ID, ckaId));

                    var foundObjects = session.FindAllObjects(searchTemplate);
                    if (foundObjects.Count < 1)
                        throw new ObjectNotFoundException(string.Format("Certificate with label \"{0}\" and id \"{1}\" was not found", ckaLabel, (ckaId == null) ? null : ConvertUtils.BytesToHexString(ckaId)));
                    else if (foundObjects.Count > 1)
                        throw new ObjectNotFoundException(string.Format("More than one certificate with label \"{0}\" and id \"{1}\" was found", ckaLabel, (ckaId == null) ? null : ConvertUtils.BytesToHexString(ckaId)));

                    var attributes = new List<CKA>();
                    attributes.Add(CKA.CKA_VALUE);

                    var certificateAttributes = session.GetAttributeValue(foundObjects[0], attributes);
                    _signingCertificate = certificateAttributes[0].GetValueAsByteArray();
                }
            }

            return _signingCertificate;
        }

        /// <summary>
        /// Gets the raw data of all certificates stored in device
        /// </summary>
        /// <returns>Raw data of all certificates stored in device</returns>
        public List<byte[]> GetAllCertificates()
        {
            if (this._disposed)
                throw new ObjectDisposedException(this.GetType().FullName);

            // Don't read certificates from token if they have already been read
            if (_allCertificates == null)
            {
                List<byte[]> certificates = new List<byte[]>();

                using(var session = _slot.OpenSession(SessionType.ReadOnly))
                {
                    var searchTemplate = new List<IObjectAttribute>();
                    searchTemplate.Add(_factories.ObjectAttributeFactory.Create(CKA.CKA_CLASS, CKO.CKO_CERTIFICATE));
                    searchTemplate.Add(_factories.ObjectAttributeFactory.Create(CKA.CKA_CERTIFICATE_TYPE, CKC.CKC_X_509));

                    var attributes = new List<CKA>();
                    attributes.Add(CKA.CKA_VALUE);

                    var foundObjects = session.FindAllObjects(searchTemplate);
                    foreach (var foundObject in foundObjects)
                    {
                        var objectAttributes = session.GetAttributeValue(foundObject, attributes);
                        certificates.Add(objectAttributes[0].GetValueAsByteArray());
                    }
                }

                _allCertificates = certificates;
            }

            return _allCertificates;
        }

        #endregion

        public byte[] GenerateSignature(byte[] data, string hashOid)
        {
            IDigest hashGenerator = HashAlgorithmUtils.GetHashGenerator(_hashAlgorihtm);
            byte[] signedAttributesDigest = ComputeDigest(hashGenerator, data);
            byte[] digestInfo = CreateDigestInfo(signedAttributesDigest, hashOid);
            byte[] signature = null;
            using(var session = _slot.OpenSession(SessionType.ReadOnly))
            {
                using var mechanism = _factories.MechanismFactory.Create(CKM.CKM_RSA_PKCS);
                signature = session.Sign(mechanism, _privateKeyHandle, digestInfo);
            }
            return signature;
        }

        #region Private methods

        /// <summary>
        /// Finds slot containing the token that matches specified criteria
        /// </summary>
        /// <param name="tokenSerial">Serial number of token that should be found</param>
        /// <param name="tokenLabel">Label of token that should be found</param>
        /// <returns>Slot containing the token that matches specified criteria</returns>
        private ISlot FindSlot(string tokenSerial, string tokenLabel)
        {
            if (this._disposed)
                throw new ObjectDisposedException(this.GetType().FullName);

            if (string.IsNullOrEmpty(tokenSerial) && string.IsNullOrEmpty(tokenLabel))
                throw new ArgumentException("Token serial and/or label has to be specified");

            var slots = _pkcs11.GetSlotList(SlotsType.WithTokenPresent);
            foreach (var slot in slots)
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

                if (tokenInfo == null)
                    continue;

                if (!string.IsNullOrEmpty(tokenSerial))
                    if (0 != String.Compare(tokenSerial, tokenInfo.SerialNumber, StringComparison.InvariantCultureIgnoreCase))
                        continue;

                if (!string.IsNullOrEmpty(tokenLabel))
                    if (0 != String.Compare(tokenLabel, tokenInfo.Label, StringComparison.InvariantCultureIgnoreCase))
                        continue;

                return slot;
            }

            return null;
        }

        /// <summary>
        /// Finds private key that matches specified criteria
        /// </summary>
        /// <param name="ckaLabel">Label (value of CKA_LABEL attribute) of the private key</param>
        /// <param name="ckaId">Identifier (value of CKA_ID attribute) of the private key</param>
        /// <returns>Handle of private key that matches specified criteria</returns>
        private IObjectHandle FindPrivateKey(string ckaId)
        {
            if (this._disposed)
                throw new ObjectDisposedException(this.GetType().FullName);

            using(var session = _slot.OpenSession(SessionType.ReadOnly))
            {
                var searchTemplate = new List<IObjectAttribute>()
                {
                _factories.ObjectAttributeFactory.Create(CKA.CKA_CLASS, CKO.CKO_PRIVATE_KEY),
                _factories.ObjectAttributeFactory.Create(CKA.CKA_KEY_TYPE, CKK.CKK_RSA)
                };
                if (!string.IsNullOrWhiteSpace(ckaId))
                    searchTemplate.Add(_factories.ObjectAttributeFactory.Create(CKA.CKA_ID, ConvertUtils.HexStringToBytes(ckaId)));

                var foundObjects = session.FindAllObjects(searchTemplate);
                if (foundObjects.Count < 1)
                    throw new ObjectNotFoundException("Private key not found");
                else if (foundObjects.Count > 1)
                    throw new ObjectNotFoundException("More than one private key was found");

                return foundObjects[0];
            }
        }

        /// <summary>
        /// Creates PKCS#1 DigestInfo
        /// </summary>
        /// <param name="hash">Hash value</param>
        /// <param name="hashOid">Hash algorithm OID</param>
        /// <returns>DER encoded PKCS#1 DigestInfo</returns>
        private static byte[] CreateDigestInfo(byte[] hash, string hashOid)
        {
            DigestInfo digestInfo = new DigestInfo(
                algID: new AlgorithmIdentifier(
                    algorithm : new DerObjectIdentifier(hashOid),
                    parameters : DerNull.Instance
                ),
                digest : hash
            );

            return digestInfo.GetDerEncoded();
        }

        /// <summary>
        /// Computes hash of the data
        /// </summary>
        /// <param name="digest">Hash algorithm implementation</param>
        /// <param name="data">Data that should be processed</param>
        /// <returns>Hash of data</returns>
        private static byte[] ComputeDigest(IDigest digest, byte[] data)
        {
            if (digest == null)
                throw new ArgumentNullException("digest");

            if (data == null)
                throw new ArgumentNullException("data");

            byte[] hash = new byte[digest.GetDigestSize()];

            digest.Reset();
            digest.BlockUpdate(data, 0, data.Length);
            digest.DoFinal(hash, 0);

            return hash;
        }

        #endregion

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
                    _allCertificates = null;
                    _signingCertificate = null;
                    _hashAlgorihtm = HashAlgorithm.SHA512;
                    _ckaId = null;
                    _privateKeyHandle = null;

                    if (_session != null)
                    {
                        try
                        {
                            _session.Logout();
                        }
                        catch
                        {
                            // Any exceptions can be safely ignored here
                        }

                        _session.Dispose();
                        _session = null;
                    }

                    _slot = null;

                    if (_pkcs11 != null)
                    {
                        _pkcs11.Dispose();
                        _pkcs11 = null;
                    }
                }

                // Dispose unmanaged objects

                _disposed = true;
            }
        }

        /// <summary>
        /// Class destructor that disposes object if caller forgot to do so
        /// </summary>
        ~Pkcs7SignatureGenerator()
        {
            Dispose(false);
        }

        #endregion
    }
}
