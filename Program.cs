using System.Reflection.PortableExecutable;
using TWG5000.Components;

namespace TWG5000 {
    public class Program {
		public static string rootPath = "";
		public static string rootPathWeb = "";
		public static string baseDirectory = AppContext.BaseDirectory;
		public static void Main(string[] args) {
			//check if file "startDir.txt" exists next to the program exe
			string rootPathFile = Path.Combine(baseDirectory, "rootPath.txt");
			if(System.IO.File.Exists(rootPathFile)) {
				Console.WriteLine("Root path found");
				rootPath = System.IO.File.ReadAllText(rootPathFile);
				Console.WriteLine(rootPath);
			}
			else {
				Console.BackgroundColor = ConsoleColor.Red;
				Console.ForegroundColor = ConsoleColor.White;
				Console.WriteLine("Root path not found");
				Console.ResetColor();
			}
			string rootPathWebFile = Path.Combine(baseDirectory, "rootPathWeb.txt");
			if(System.IO.File.Exists(rootPathWebFile)) {
				Console.WriteLine("Root path web found");
				rootPathWeb = System.IO.File.ReadAllText(rootPathWebFile);
				Console.WriteLine(rootPathWeb);
			}
			else {
				Console.BackgroundColor = ConsoleColor.Red;
				Console.ForegroundColor = ConsoleColor.White;
			}





			var builder = WebApplication.CreateBuilder(args);

			// Add CORS services
			builder.Services.AddCors(options => {
				options.AddDefaultPolicy(builder => {
					builder.AllowAnyOrigin()
						   .AllowAnyMethod()
						   .AllowAnyHeader();
				});
			});

			// Add services to the container.
			builder.Services.AddRazorComponents()
                .AddInteractiveServerComponents();
			builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
			builder.Services.AddScoped<RequestInfoService>();

			var app = builder.Build();

			app.UseMiddleware<RequestInfoMiddleware>();

			// Configure the HTTP request pipeline.
			if(!app.Environment.IsDevelopment()) {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseStaticFiles();
            app.UseAntiforgery();

            app.MapRazorComponents<App>()
                .AddInteractiveServerRenderMode();

            app.Run();
        }
    }
}
