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

        [ObfuscationAttribute(Exclude = true)]
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .ConfigureSwaggerDocumentation()
                .ConfigureCors()
                .ConfigureWebApi();
        }

        [ObfuscationAttribute(Exclude = true)]
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();
            else
                app.UseHsts();

            app
                .UseCors()
                .UseHttpsRedirection()
                .UseMvc()
                .UseSwaggerDocumentation(env);
        }
    }
}
