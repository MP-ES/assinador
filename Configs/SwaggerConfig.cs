using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace Assinador.Configs
{
    public static class SwaggerConfig
    {
        public static IServiceCollection ConfigureSwaggerDocumentation(this IServiceCollection services)
        {
            return services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new Info
                    {
                        Title = "Assinador.mpes",
                        Version = "v1"
                    });
                    c.CustomSchemaIds(x => x.FullName);
                });
        }

        public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseSwagger(c => { c.RouteTemplate = "api/{documentName}/swagger.json"; });

            if (env.IsDevelopment())
            {
                app.UseSwaggerUI(c =>
               {
                   c.SwaggerEndpoint("/api/v1/swagger.json", "Assinador.mpes API");
                   c.DocExpansion(DocExpansion.None);
               });
            }

            return app;
        }
    }
}
