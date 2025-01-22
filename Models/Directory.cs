namespace TWG5000.Models {
	public class Directory {
		public string Title = "";
		public string description = "";
		public List<SubDirectory> subDirectories = new List<SubDirectory>();
		Dictionary<string, string> metainfo = new Dictionary<string, string>();
		public bool PasswordProtected = false;
		public Dictionary<string, string> passwords = new Dictionary<string, string>(); //the first string is password, and the second is user of the password, however its not used in the code (just for future use)

		public static Directory LoadDirectory(string path) {
			Directory directory = new Directory();
			//set the title to the name of the parent directory, eg if the path is "/galerie/stuzkovak/Photos" then the title will be stuzkovak
			directory.Title = new DirectoryInfo(path).Parent.Name;
			string pathWithoutPhotos = path.Substring(0, path.LastIndexOf(Path.DirectorySeparatorChar));

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
			string passwordFile = Path.Combine(pathWithoutPhotos, "password.csv");
			Console.WriteLine("Checking for password file: " + passwordFile);
			if(File.Exists(passwordFile)) {
				Console.WriteLine("password.csv found");
				directory.PasswordProtected = true;
				directory.passwords = File.ReadAllLines(passwordFile).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
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
