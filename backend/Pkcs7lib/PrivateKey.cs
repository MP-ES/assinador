using Org.BouncyCastle.Crypto;

namespace Pkcs7lib
{
    /// <summary>
    /// Represents private key accessible via PKCS#11 interface
    /// </summary>
    public class PrivateKey
    {
        /// <summary>
        /// Hex encoded string with identifier (value of CKA_ID attribute) of the private key
        /// </summary>
        private string _id = null;

        /// <summary>
        /// Hex encoded string with identifier (value of CKA_ID attribute) of the private key
        /// </summary>
        public string Id
        {
            get
            {
                return _id;
            }
        }

        /// <summary>
        /// Label (value of CKA_LABEL attribute) of the private key
        /// </summary>
        private string _label = null;

        /// <summary>
        /// Label (value of CKA_LABEL attribute) of the private key
        /// </summary>
        public string Label
        {
            get
            {
                return _label;
            }
        }

        /// <summary>
        /// Public part of the key. May be null for unsupported key types.
        /// </summary>
        private AsymmetricKeyParameter _publicKey = null;

        /// <summary>
        /// Public part of the key. May be null for unsupported key types.
        /// </summary>
        public AsymmetricKeyParameter PublicKey
        {
            get
            {
                return _publicKey;
            }
        }

        /// <summary>
        /// Intitializes class instance
        /// </summary>
        /// <param name="id">Hex encoded string with identifier (value of CKA_ID attribute) of the private key</param>
        /// <param name="label">Label (value of CKA_LABEL attribute) of the private key</param>
        /// <param name="publicKey">Public part of the key or null for unsupported key types</param>
        internal PrivateKey(string id, string label, AsymmetricKeyParameter publicKey)
        {
            _id = id;
            _label = label;
            _publicKey = publicKey;
        }
    }
}
