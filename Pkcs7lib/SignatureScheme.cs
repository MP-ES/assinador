namespace Pkcs7lib
{
    /// <summary>
    /// RSA signature schemes defined in RFC 8017
    /// </summary>
    public enum SignatureScheme
    {
        /// <summary>
        /// RSASSA-PKCS1-v1_5 scheme
        /// </summary>
        RSASSA_PKCS1_v1_5,

        /// <summary>
        /// RSASSA-PSS scheme
        /// </summary>
        RSASSA_PSS
    }
}
