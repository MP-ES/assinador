namespace Assinador.Models
{
    public class Token
    {
        public Token() { }

        public Token(string libraryPath,
            string serialNumber,
            string label,
            string certId,
            string certLabel,
            string displayName,
            bool valid = true)
        {
            LibraryPath = libraryPath;
            SerialNumber = serialNumber;
            Label = label;
            CertId = certId;
            CertLabel = certLabel;
            DisplayName = displayName;
            Valid = valid;
        }

        public string LibraryPath { get; set; }
        public string SerialNumber { get; set; }
        public string Label { get; set; }
        public string CertLabel { get; set; }
        public string CertId { get; set; }
        public string Password { get; set; }
        public string DisplayName { get; set; }
        public bool Valid { get; set; }
    }
}
