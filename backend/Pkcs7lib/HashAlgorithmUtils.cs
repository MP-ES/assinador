using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;

namespace Pkcs7lib
{
    /// <summary>
    /// Utility class for HashAlgorithm enum
    /// </summary>
    public static class HashAlgorithmUtils
    {
        /// <summary>
        /// Returns value of micalg (Message Integrity Check Algorithm) parameter for specified hash algorithm as defined in RFC 5751 section 3.4.3.2
        /// </summary>
        /// <param name="hashAlgorithm">Hash algorithm</param>
        /// <returns>Value of micalg parameter for specified hash algorithm</returns>
        public static string GetHashMicalgName(HashAlgorithm hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
                case HashAlgorithm.SHA1:
                    return "sha-1";
                case HashAlgorithm.SHA256:
                    return "sha-256";
                case HashAlgorithm.SHA384:
                    return "sha-384";
                case HashAlgorithm.SHA512:
                    return "sha-512";
                default:
                    throw new NotSupportedException("Unsupported hash algorithm");
            }
        }

        /// <summary>
        /// Returns OID of specified hash algorithm
        /// </summary>
        /// <param name="hashAlgorithm">Hash algorithm</param>
        /// <returns>OID of specified hash algorithm</returns>
        public static string GetHashOid(HashAlgorithm hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
                case HashAlgorithm.SHA1:
                    return OID.SHA1;
                case HashAlgorithm.SHA256:
                    return OID.SHA256;
                case HashAlgorithm.SHA384:
                    return OID.SHA384;
                case HashAlgorithm.SHA512:
                    return OID.SHA512;
                default:
                    throw new NotSupportedException("Unsupported hash algorithm");
            }
        }

        /// <summary>
        /// Returns implementation of specified hash algorithm
        /// </summary>
        /// <param name="hashAlgorithm">Hash algorithm</param>
        /// <returns>Implementation of specified hash algorithm</returns>
        public static IDigest GetHashGenerator(HashAlgorithm hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
                case HashAlgorithm.SHA1:
                    return new Sha1Digest();
                case HashAlgorithm.SHA256:
                    return new Sha256Digest();
                case HashAlgorithm.SHA384:
                    return new Sha384Digest();
                case HashAlgorithm.SHA512:
                    return new Sha512Digest();
                default:
                    throw new NotSupportedException("Unsupported hash algorithm");
            }
        }

        public static IDigest GetDigest(System.Security.Cryptography.Oid hashOid)
        {
            switch (hashOid.FriendlyName.ToLower())
            {
                case "md2":
                    return new MD2Digest();
                case "md4":
                    return new MD4Digest();
                case "md5":
                    return new MD5Digest();
                case "null":
                    return new NullDigest();
                case "sha1":
                    return new Sha1Digest();
                case "sha256":
                    return new Sha256Digest();
                case "sha384":
                    return new Sha384Digest();
                case "sha512":
                    return new Sha512Digest();
                default:
                    throw new NotSupportedException("Unsupported hash algorithm");
            }
        }
    }
}
