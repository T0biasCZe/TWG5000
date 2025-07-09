public class RequestInfoService {
	public string IpAddress { get; set; } = "Unknown";
	public string UserAgent { get; set; } = "Unknown";
	public string Referer { get; set; } = "Unknown";
	public string Path { get; set; } = "/";
}

public class RequestInfoMiddleware {
	private readonly RequestDelegate _next;

	public RequestInfoMiddleware(RequestDelegate next) {
		_next = next;
	}

	public async Task InvokeAsync(HttpContext context, RequestInfoService info) {
		var headers = context.Request.Headers;


		/*var path = context.Request.Path.ToString();
		if(path.StartsWith("/_blazor") || path.StartsWith("/_framework") || path.StartsWith("/_vs") || path.StartsWith("/_content")) {
			Console.WriteLine($"Skipping request info middleware for path: {path}");
			await _next(context);
			//return;
		}*/

		// Prefer Cloudflare's real client IP, then X-Forwarded-For, then remote address
		string ip = null;
		if(!string.IsNullOrEmpty(headers["CF-Connecting-IP"])) {
			ip = headers["CF-Connecting-IP"].ToString();
		}
		else if(!string.IsNullOrEmpty(headers["X-Forwarded-For"])) {
			var xff = headers["X-Forwarded-For"].ToString();
			ip = xff.Split(',')[0].Trim();
		}
		else {
			ip = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
		}

		info.IpAddress = ip;
		info.UserAgent = headers.UserAgent.ToString();
		info.Referer = headers.Referer.ToString();
		info.Path = context.Request.Path;

		// Save info to cookies (HttpOnly: false so JS can read them)
		context.Response.Cookies.Append("TWG_IP", info.IpAddress, new CookieOptions { HttpOnly = false, SameSite = SameSiteMode.Lax });
		context.Response.Cookies.Append("TWG_UA", info.UserAgent, new CookieOptions { HttpOnly = false, SameSite = SameSiteMode.Lax });
		context.Response.Cookies.Append("TWG_Ref", info.Referer, new CookieOptions { HttpOnly = false, SameSite = SameSiteMode.Lax });
		context.Response.Cookies.Append("TWG_Path", info.Path, new CookieOptions { HttpOnly = false, SameSite = SameSiteMode.Lax });

		Console.ForegroundColor = ConsoleColor.Red;
		Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}]");
		Console.WriteLine("[DEBUG] Request info middleware ran:");
		Console.ResetColor();
		Console.WriteLine($"  IP: {info.IpAddress}");
		Console.WriteLine($"  UA: {info.UserAgent}");
		Console.WriteLine($"  Ref: {info.Referer}");
		Console.WriteLine($"  Path: {info.Path}");

		// Store a copy for Blazor circuit access (optional, but not reliable in Blazor Server)
		var infoCopy = new RequestInfoService {
			IpAddress = info.IpAddress,
			UserAgent = info.UserAgent,
			Referer = info.Referer,
			Path = info.Path
		};
		context.Items["RequestInfo"] = infoCopy;

		await _next(context);
	}
}