public static class Utils {
	public static string GetUserIpAddress(HttpContext context) {
		// Check CF-Connecting-IP header
		if(!string.IsNullOrEmpty(context.Request.Headers["CF-CONNECTING-IP"]))
			return context.Request.Headers["CF-CONNECTING-IP"];

		// Check X-Forwarded-For header
		if(!string.IsNullOrEmpty(context.Request.Headers["X-Forwarded-For"]))
			return context.Request.Headers["X-Forwarded-For"];

		// Fallback to RemoteIpAddress
		return context.Connection.RemoteIpAddress?.ToString();
	}

}