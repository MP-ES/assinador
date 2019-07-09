namespace Assinador.Models
{
    public class TokenDTO
    {
        public TokenDTO(string libraryPath, string serialNumber, string label, string displayName)
        {
            LibraryPath = libraryPath;
            SerialNumber = serialNumber;
            Label = label;
            DisplayName = displayName;
        }

        public string LibraryPath { get; set; }
        public string SerialNumber { get; set; }
        public string Label { get; set; }
        public string Password { get; set; }
        public string DisplayName { get; set; }
    }
}