using System;

namespace Assinador.Extensions
{
    public static class DateTimeHelper
    {
        public static bool Between(this IComparable a, IComparable b, IComparable c)
        {
            return a.CompareTo(b) >= 0 && a.CompareTo(c) <= 0;
        }

    }
}
