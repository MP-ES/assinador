using System.Reflection;
using Assinador.Configs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Assinador
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        private const string _cors_policy_name = "assinador_cors_policy";

        [ObfuscationAttribute(Exclude = true)]
        public void ConfigureServices(IServiceCollection services)
        {
            services.ConfigureSwaggerDocumentation();
            services.ConfigureCors(_cors_policy_name);
            services.ConfigureWebApi();
            
        }

        [ObfuscationAttribute(Exclude = true)]
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseCorsConfiguration(_cors_policy_name);
            app.UseHttpsRedirection();
            app.UseMvc()
                .UseSwaggerDocumentation(env);
        }
    }
}
