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

		// Prefer Cloudflare's real client IP, then X-Forwarded-For, then remote address
		string ip = null;
		if(!string.IsNullOrEmpty(headers["CF-Connecting-IP"])) {
			ip = headers["CF-Connecting-IP"].ToString();
		}
		else if(!string.IsNullOrEmpty(headers["X-Forwarded-For"])) {
			// X-Forwarded-For can be a comma-separated list, take the first (original client)
			var xff = headers["X-Forwarded-For"].ToString();
			ip = xff.Split(',')[0].Trim();
		}
		else {
			ip = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
		}

		info.IpAddress = ip;
		info.UserAgent = headers["User-Agent"].ToString();
		info.Referer = headers["Referer"].ToString();
		info.Path = context.Request.Path;

		Console.ForegroundColor = ConsoleColor.Red;
		Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}]");
		Console.WriteLine("[DEBUG] Request info middleware ran:");
		Console.ResetColor();
		Console.WriteLine($"  IP: {info.IpAddress}");
		Console.WriteLine($"  UA: {info.UserAgent}");
		Console.WriteLine($"  Ref: {info.Referer}");

		// Store a copy for Blazor circuit access
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