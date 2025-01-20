namespace TWG5000.Models {
	public class Directory {
		public string Title = "";
		public string description = "";
		public List<SubDirectory> subDirectories = new List<SubDirectory>();
		Dictionary<string, string> metainfo = new Dictionary<string, string>();

		public static Directory LoadDirectory(string path) {
			Directory directory = new Directory();
			directory.Title = new DirectoryInfo(path).Name;
			//check if file metainfo.csv exists in the directory
			string metainfoPath = Path.Combine(path, "metainfo.csv");
			if(File.Exists(metainfoPath)) {
				Console.WriteLine("metainfo.csv found");
				directory.metainfo = File.ReadAllLines(metainfoPath).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
			}
			if(directory.metainfo.ContainsKey("title")) {
				Console.WriteLine("title found");
				directory.Title = directory.metainfo["title"];
			}
			if(directory.metainfo.ContainsKey("description")) {
				Console.WriteLine("description found");
				directory.description = directory.metainfo["description"];
			}

			DirectoryInfo directoryInfo = new DirectoryInfo(path);
			foreach(DirectoryInfo subDirectoryInfo in directoryInfo.GetDirectories()) {
				Console.WriteLine("subdirectory found: " + subDirectoryInfo.Name);
				SubDirectory subDirectory = SubDirectory.LoadSubDirectory(subDirectoryInfo.FullName);
				directory.subDirectories.Add(subDirectory);
			}
			Console.WriteLine("Directory loaded, returning...");
			return directory;
		}
	}
}
