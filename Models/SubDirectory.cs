
namespace TWG5000.Models {
	public class SubDirectory {
		public string name = "";
		public string description = "";
		public string path = "";
		public int sortIndex = -1;
		public List<Photograph> photographs = new List<Photograph>();
		Dictionary<string, string> metainfo = new Dictionary<string, string>();

		public static SubDirectory LoadSubDirectory(string path) {
			Console.WriteLine("Loading subdirectory: " + path);
			SubDirectory subDirectory = new SubDirectory();
			subDirectory.name = new DirectoryInfo(path).Name;
			subDirectory.path = path;

			// Check if file metainfo.csv exists in the subdirectory
			string metainfoPath = Path.Combine(path, "metainfo.csv");
			if(File.Exists(metainfoPath)) {
				Console.WriteLine("metainfo.csv found");
				subDirectory.metainfo = File.ReadAllLines(metainfoPath)
					.Select(line => line.Split(';'))
					.ToDictionary(line => line[0], line => line[1]);
			}
			if(subDirectory.metainfo.ContainsKey("title")) {
				Console.WriteLine("title found");
				subDirectory.name = subDirectory.metainfo["title"];
			}
			if(subDirectory.metainfo.ContainsKey("description")) {
				Console.WriteLine("description found");
				subDirectory.description = subDirectory.metainfo["description"];
			}
			if(subDirectory.metainfo.ContainsKey("sortIndex")) {
				Console.WriteLine("sortIndex found");
				int.TryParse(subDirectory.metainfo["sortIndex"], out subDirectory.sortIndex);
			}

			// Load photographs
			DirectoryInfo directoryInfo = new DirectoryInfo(path);
			foreach(string extension in Photograph.photoExtensions) {
				Console.WriteLine("Loading photographs with extension: " + extension);
				foreach(FileInfo fileInfo in directoryInfo.GetFiles($"*{extension}")) {
					Console.WriteLine("\n\nLoading photograph: " + fileInfo.Name);
					Photograph photograph = Photograph.LoadPhotograph(fileInfo.FullName);
					subDirectory.photographs.Add(photograph);
				}
			}
			Console.WriteLine("Subdirectory loaded, returning...");
			return subDirectory;
		}
	}
}
