using System.Buffers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Assinador.Configs
{
    public static class WebApiConfig
    {
        public static IMvcCoreBuilder ConfigureWebApi(this IServiceCollection services)
        {
            var builder = services.AddMvcCore(options =>
            {
                options.ReturnHttpNotAcceptable = false;
                options.FormatterMappings.SetMediaTypeMappingForFormat("xml", "application/xml");
            });

            builder
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
                .AddMvcOptions(options =>
                    {
                        options.OutputFormatters.Add(new PascalCaseJsonProfileFormatter());
                    }
                )
                .AddAuthorization()
                .AddApiExplorer()
                .AddFormatterMappings()
                .AddJsonFormatters() // JSON Formater first for default
                .AddXmlSerializerFormatters(); // XML after JSON;

            return builder;
        }
    }

    public class PascalCaseJsonProfileFormatter : JsonOutputFormatter
    {
        public PascalCaseJsonProfileFormatter() : base(new JsonSerializerSettings { ContractResolver = new DefaultContractResolver() }, ArrayPool<char>.Shared)
        {
            SupportedMediaTypes.Clear();
            SupportedMediaTypes.Add(MediaTypeHeaderValue.Parse("application/json"));
        }
    }
}
