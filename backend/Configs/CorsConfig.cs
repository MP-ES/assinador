using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Assinador.Configs
{
    public static class CorsConfig
    {
        public static IServiceCollection ConfigureCors(this IServiceCollection services, string policyName)
        {
            return services.AddCors(o => o.AddPolicy(policyName, builder =>
            {
                builder.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithExposedHeaders("accept", "content-type", "content-disposition", "content-length", "content-range", "origin", "x-api-version");
            }));
        }

        public static IApplicationBuilder UseCorsConfiguration(this IApplicationBuilder app, string policyName)
        {
            return app.UseCors(policyName);
        }
    }
}
