public static class Utils {
	public static string GetUserIpAddress(HttpContext context) {
		if(context == null) {
			Console.WriteLine("\u001b[31m[ERROR] HttpContext is null in GetUserIpAddress\u001b[0m");
			return "Unknown";
		}

		var headers = context.Request?.Headers;

		if(headers == null) {
			Console.WriteLine("\u001b[31m[ERROR] HttpContext.Request.Headers is null in GetUserIpAddress\u001b[0m");
			return "Unknown";
		}

		if(!string.IsNullOrEmpty(headers["CF-CONNECTING-IP"])) {
			return headers["CF-CONNECTING-IP"];
		}

		if(!string.IsNullOrEmpty(headers["X-Forwarded-For"])) {
			return headers["X-Forwarded-For"];
		}

		var ip = context.Connection?.RemoteIpAddress?.ToString();

		if(ip == null) {
			Console.WriteLine("\u001b[31m[ERROR] context.Connection.RemoteIpAddress is null in GetUserIpAddress\u001b[0m");
			return "Unknown";
		}

		return ip;
	}

}