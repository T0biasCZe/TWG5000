namespace TWG5000 {
	public static class AccessLogger {
		//line format:
		//YYYY-MM-DD HH:MM:SS|IPv4|hash(unused)|URL|Useragent|HTTP Referer|password|message
		public static void Log(string ip, string url, string useragent, string referer, string password, string message) {
			string logLine = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "|" + ip + "|unused|" + url + "|" + useragent + "|" + referer + "|" + password + "|" + message;
			string savePath = Program.rootPath + "\\access_log.txt";
			Console.WriteLine(savePath);
			Console.WriteLine(logLine);
			File.AppendAllText(savePath, logLine + Environment.NewLine);
		}
	}
}
