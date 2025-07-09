using System.Net.Http;
using System.Text;

namespace TWG5000 {
	public static class AccessLogger {
		//line format:
		//YYYY-MM-DD HH:MM:SS|IPv4|hash(unused)|URL|Useragent|HTTP Referer|password|message
		public static void Log(string ip, string url, string useragent, string referer, string password, string message, DateTime time) {
			//string logLine = time.ToString("yyyy-MM-dd HH:mm:ss") + "|" + ip + "|unused|" + url + "|" + useragent + "|" + referer + "|" + password + "|" + message;
			StringBuilder logLine = new StringBuilder();
			Console.WriteLine("Logging access:");
			Console.WriteLine($"  IP: {ip}");
			Console.WriteLine($"  URL: {url}");
			Console.WriteLine($"  Useragent: {useragent}");
			Console.WriteLine($"  Referer: {referer}");
			logLine.Append("date>|" + time.ToString("yyyy-MM-dd HH:mm:ss") + "$|");
			logLine.Append("ip>|" + EscapeField(ip) + "$|");
			logLine.Append("url>|" + EscapeField(url) + "$|");
			logLine.Append("referer>|" + EscapeField(referer) + "$|");
			logLine.Append("password>|" + EscapeField(password) + "$|");
			logLine.Append("message>|" + EscapeField(message) + "$|");
			logLine.Append("useragent>|" + EscapeField(useragent) + "$|");


			string savePath = Program.rootPath + "\\access_log.txt";
			Console.WriteLine(savePath);
			Console.WriteLine(logLine.ToString());
			File.AppendAllText(savePath, logLine.ToString() + Environment.NewLine);

			// Send to PHP endpoint (fire and forget)
			_ = SendToPhpEndpointAsync(time, password, message);
		}
		public static void Log(string ip, string url, string useragent, string referer, string password, string message) {
			Log(ip, url, useragent, referer, password, message, DateTime.Now);
		}
		static string EscapeField(string value) => value?.Replace(">|", ">_PIPE_|").Replace("$|", "$_PIPE_|") ?? "";

		private static readonly HttpClient httpClient = new HttpClient();

		private static async Task SendToPhpEndpointAsync(DateTime time, string password, string message) {
			try {
				var values = new Dictionary<string, string> {
					{ "time", time.ToString("yyyy-MM-dd HH:mm:ss") },
					{ "password", password ?? "" },
					{ "message", message ?? "" }
				};
				var content = new FormUrlEncodedContent(values);
				await httpClient.PostAsync("https://tobikcze.eu/galerie/twgAccessLog.php", content);
			}
			catch(Exception ex) {
				Console.WriteLine("Failed to send log to PHP endpoint: " + ex.Message);
			}
		}
	}
}
