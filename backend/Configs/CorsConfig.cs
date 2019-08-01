using Microsoft.Extensions.DependencyInjection;

namespace Assinador.Configs
{
    public static class CorsConfig
    {
        public static IServiceCollection ConfigureCors(this IServiceCollection services)
        {
            return services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder
                        .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithExposedHeaders(
                            "accept",
                            "content-type",
                            "content-disposition",
                            "content-length",
                            "origin");
                });
            });
        }
    }
}
