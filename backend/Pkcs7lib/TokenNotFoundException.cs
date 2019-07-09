using System;

namespace Pkcs7lib
{
    /// <summary>
    /// Exception indicating that requested token was not found
    /// </summary>
    public class TokenNotFoundException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the TokenNotFoundException class
        /// </summary>
        public TokenNotFoundException()
            : base()
        {

        }

        /// <summary>
        /// Initializes a new instance of the TokenNotFoundException class with a specified error message
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        public TokenNotFoundException(string message)
            : base(message)
        {

        }

        /// <summary>
        /// Initializes a new instance of the TokenNotFoundException class with a specified error message and a reference to the inner exception that is the cause of this exception
        /// </summary>
        /// <param name="message">The error message that explains the reason for the exception</param>
        /// <param name="innerException">The exception that is the cause of the current exception, or a null reference if no inner exception is specified.</param>
        public TokenNotFoundException(string message, Exception innerException)
            : base(message, innerException)
        {

        }
    }
}
