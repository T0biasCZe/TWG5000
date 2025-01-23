using System.Text;
using System.Xml.Serialization;

namespace TWG5000.Models {
	public class Directory {
		public string Title = "";
		public string description = "";
		public List<SubDirectory> subDirectories = new List<SubDirectory>();
		List<Metainfo> metainfo = new List<Metainfo>();
		public bool PasswordProtected = false;
		public List<Password> passwords = new List<Password>();

		public static Directory LoadDirectory(string path) {
            Directory directory = new Directory();
            //set the title to the name of the parent directory, eg if the path is "/galerie/stuzkovak/Photos" then the title will be stuzkovak
            directory.Title = new DirectoryInfo(path).Parent.Name;

            string pathWithoutPhotos = path.Substring(0, path.LastIndexOf(Path.DirectorySeparatorChar));
            //check if there is file "enableCache" in the parent directory
            string enableCachePath = Path.Combine(pathWithoutPhotos, "enableCache");
            bool enableCache = File.Exists(enableCachePath);
            string cachePath = Path.Combine(pathWithoutPhotos, "directorycache.xml");
            if(enableCache) {
                Console.WriteLine("Cache is enabled");
                //check if directorycache.xml exists in the directory
                if(File.Exists(cachePath)) {
                    Console.WriteLine("directorycache.xml found");
					Console.WriteLine("Loading directory from cache...");
                    XmlSerializer serializer = new XmlSerializer(typeof(Directory));
                    using(FileStream fileStream = new FileStream(cachePath, FileMode.Open)) {
                        directory = (Directory)serializer.Deserialize(fileStream);
                    }
                    return directory;
                }
            }

			Console.WriteLine("Cache is disabled or not found, loading directory from files...");
            //check if file metainfo.csv exists in the directory
            string metainfoPath = Path.Combine(path, "metainfo.csv");
			if(File.Exists(metainfoPath)) {
				Console.WriteLine("metainfo.csv found");
				var tempMetainfo = File.ReadAllLines(metainfoPath).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
				foreach(var item in tempMetainfo) {
					if(string.IsNullOrEmpty(item.Key) || string.IsNullOrEmpty(item.Value)) continue; //skip empty lines
					directory.metainfo.Add(new Metainfo(item.Key, item.Value));
				}
			}
			if(directory.metainfo.Any(m => m.Key == "title")) {
				Console.WriteLine("title found");
				directory.Title = directory.metainfo.First(m => m.Key == "title").Value;
			}
			if(directory.metainfo.Any(m => m.Key == "description")) {
				Console.WriteLine("description found");
				directory.description = directory.metainfo.First(m => m.Key == "description").Value;
			}
			string passwordFile = Path.Combine(pathWithoutPhotos, "password.csv");
			Console.WriteLine("Checking for password file: " + passwordFile);
			if(File.Exists(passwordFile)) {
				Console.WriteLine("password.csv found");
				directory.PasswordProtected = true;
				var tempPasswords = File.ReadAllLines(passwordFile).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
				foreach(var item in tempPasswords) {
					directory.passwords.Add(new Password(item.Key, item.Value));
				}
			}

			DirectoryInfo directoryInfo = new DirectoryInfo(path);
			foreach(DirectoryInfo subDirectoryInfo in directoryInfo.GetDirectories()) {
				Console.WriteLine("subdirectory found: " + subDirectoryInfo.Name);
				SubDirectory subDirectory = SubDirectory.LoadSubDirectory(subDirectoryInfo.FullName);
				directory.subDirectories.Add(subDirectory);
			}
			Console.WriteLine("Directory loaded, returning...");
			if(enableCache) {
				Console.WriteLine("Saving directory to cache...");
				XmlSerializer serializer = new XmlSerializer(typeof(Directory));
				using(FileStream fileStream = new FileStream(cachePath, FileMode.Create)) {
					using(SafeXmlWriter writer = new SafeXmlWriter(fileStream, Encoding.UTF8)) {
						serializer.Serialize(writer, directory);
					}
				}
				Console.WriteLine("Directory saved to cache");
			}
			return directory;
		}
	}
}
