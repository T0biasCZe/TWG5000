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

		info.IpAddress =
			!string.IsNullOrEmpty(headers["CF-Connecting-IP"]) ? headers["CF-Connecting-IP"].ToString() :
			!string.IsNullOrEmpty(headers["X-Forwarded-For"]) ? headers["X-Forwarded-For"].ToString() :
			context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

		info.UserAgent = headers["User-Agent"].ToString();
		info.Referer = headers["Referer"].ToString();
		info.Path = context.Request.Path;

		//Console.ForegroundColor = ConsoleColor.Red;
		//Console.WriteLine("[DEBUG] Request info middleware ran:");
		//Console.ResetColor();
		//Console.WriteLine($"  IP: {info.IpAddress}");
		//Console.WriteLine($"  UA: {info.UserAgent}");
		//Console.WriteLine($"  Ref: {info.Referer}");

		await _next(context);
	}
}