using System;
using Net.Pkcs11Interop.HighLevelAPI;

namespace Pkcs7lib
{
    /// <summary>
    /// PKCS#11 token (smartcard)
    /// </summary>
    public class Token
    {
        /// <summary>
        /// PKCS#11 slot
        /// </summary>
        internal ISlot Slot = null;

        /// <summary>
        /// Token manufacturer
        /// </summary>
        public string ManufacturerId { get; set; }

        /// <summary>
        /// Token model
        /// </summary>
        public string Model { get; set; }

        /// <summary>
        /// Token serial number
        /// </summary>
        public string SerialNumber { get; set; }

        /// <summary>
        /// Token label
        /// </summary>
        public string Label { get; set; }

        public string LibraryPath { get; set; }
        public string Password { get; set; }

        /// <summary>
        /// Intitializes class instance
        /// </summary>
        /// <param name="slot">PKCS#11 slot</param>
        /// <param name="manufacturerId">Token manufacturer</param>
        /// <param name="model">Token model</param>
        /// <param name="serialNumber">Token serial number</param>
        /// <param name="label">Token label</param>
        internal Token(ISlot slot, string manufacturerId, string model, string serialNumber, string label, string libraryPath, string password = null)
        {
            if (slot == null)
                throw new ArgumentNullException("slot");

            Slot = slot;
            ManufacturerId = manufacturerId;
            Model = model;
            SerialNumber = serialNumber;
            Label = label;
            LibraryPath = libraryPath;
            Password = password;
        }

        public Token() { }
    }
}
