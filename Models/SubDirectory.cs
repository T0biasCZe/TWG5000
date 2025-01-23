
namespace TWG5000.Models {
	public class SubDirectory {
		public string name = "";
		public string description = "";
		public string path = "";
		public int sortIndex = -1;
		public List<Photograph> photographs = new List<Photograph>();
		List<Metainfo> metainfo = new List<Metainfo>();

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
					.Select(line => {
						var parts = line.Split(';');
						return new Metainfo(parts[0], parts[1]);
					}).ToList();
			}

			var titleMeta = subDirectory.metainfo.FirstOrDefault(m => m.Key == "title");
			if(titleMeta != null && titleMeta.Value.Length > 0) {
				Console.WriteLine("title found");
				subDirectory.name = titleMeta.Value;
			}

			var descriptionMeta = subDirectory.metainfo.FirstOrDefault(m => m.Key == "description");
			if(descriptionMeta != null && descriptionMeta.Value.Length > 0) {
				Console.WriteLine("description found");
				subDirectory.description = descriptionMeta.Value;
			}

			var sortIndexMeta = subDirectory.metainfo.FirstOrDefault(m => m.Key == "sortIndex");
			if(sortIndexMeta != null && sortIndexMeta.Value.Length > 0) {
				Console.WriteLine("sortIndex found");
				int.TryParse(sortIndexMeta.Value, out subDirectory.sortIndex);
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
