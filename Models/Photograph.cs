using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.Numerics;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using TWG5000.Components.Pages;
using static System.Net.Mime.MediaTypeNames;
using Image = System.Drawing.Image;
using Directory = System.IO.Directory;
namespace TWG5000.Models {
	public class Photograph {
		public static List<string> photoExtensions = new List<string> { ".jpg", ".jpeg", ".jxl", ".png", ".gif", ".bmp", ".tiff", ".glb"};
		public string filePath = "";
		public string webPath = "";
		public string webPathTiny = "";
		public string webPathMedium = "";
		public string fileName = "";
		public string title = "";
		public string description = "";
		public string author = "";
		public List<string> keywords = new List<string>();
		public bool is3D = false;

        public DateTime dateTaken = new DateTime(0);
		public DateTime dateDigitized = new DateTime(0);
		public DateTime dateModified = new DateTime(0); //date of the windows file modification
		public DateTime dateCreated = new DateTime(0);
		public DateTime dateEdited = new DateTime(0); //date of edit in photo editor like Lightroom

		public Size size = new Size(0, 0);
		public string exif = "";
		public Vector2 coordinates = new Vector2(0, 0);
		public string cameraModel = "";

		List<Metainfo> metainfo = new List<Metainfo>(); //external meta info from metainfo.csv
		IEnumerable<MetadataExtractor.Directory> directories = new List<MetadataExtractor.Directory>();

		public static Photograph LoadPhotograph(string path) {
			Photograph photograph = new Photograph();
			FileInfo fileInfo = new FileInfo(path);
			photograph.fileName = fileInfo.Name;
			//load the exif from the file itself
			if(fileInfo.Name.Contains(".glb")) {
				Console.WriteLine("Skipping exif for embed file: " + path);
				Console.WriteLine("Skipping exif for embed file: " + path);
				Console.WriteLine("Skipping exif for embed file: " + path);
				Console.WriteLine("Skipping exif for embed file: " + path);
				Console.WriteLine("Skipping exif for embed file: " + path);
				//read the content of the file and store it in the embedCode
				photograph.size = new Size(1600, 1200);
				photograph.is3D = true;
				goto skipmeta;
			}
			Console.WriteLine("Loading exif from file: " + path);
			photograph.directories = ImageMetadataReader.ReadMetadata(path);
			foreach(MetadataExtractor.Directory directory in photograph.directories) {
				photograph.exif += directory.Name + "\n";
				//Console.WriteLine(directory.Name);
				foreach(Tag tag in directory.Tags) {
					if(tag.Name == "Red TRC") {
						photograph.exif += "Red TRC SKIPPED\n";
						continue;
					};
					if(tag.Name == "Green TRC") {
						photograph.exif += "Green TRC SKIPPED\n";
						continue;
					};
					if(tag.Name == "Blue TRC") {
						photograph.exif += "Blue TRC SKIPPED\n";
						continue;
					};
					photograph.exif += tag.Name + ": " + tag.Description + "\n";
					//Console.WriteLine(tag.Name + ": " + tag.Description);

					if(tag.Name == "Date/Time Original") {
						Console.WriteLine("Date/Time Original: " + tag.Description);
						DateTime.TryParseExact(tag.Description, "yyyy:MM:dd HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out photograph.dateTaken);
					}
					if(tag.Name == "Date/Time Digitized") {
						DateTime.TryParseExact(tag.Description, "yyyy:MM:dd HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out photograph.dateDigitized);
					}
					if(tag.Name == "Date/Time") {

						DateTime.TryParseExact(tag.Description, "yyyy:MM:dd HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out photograph.dateEdited);
					}

					//parse coordinates
					if(tag.Name == "GPS Latitude") {
						ParseGpsCoordinates(photograph, directory);
					}


				}
				photograph.exif += "\n";
			}


			Console.WriteLine("Exif loaded");
            //load size
            photograph.size = GetSize(path);
			Console.WriteLine("Size loaded: " + photograph.size.Width + "x" + photograph.size.Height);

        skipmeta:
			// Check if file metainfo.csv exists in the subdirectory
			string metainfoPath = Path.Combine(fileInfo.FullName + ".csv");
			if(File.Exists(metainfoPath)) {
				Console.WriteLine("metainfo found");
				photograph.metainfo = File.ReadAllLines(metainfoPath)
					.Select(line => {
						var parts = line.Split(';');
						return new Metainfo(parts[0], parts[1]);
					}).ToList();
			}
			var titleMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "title");
			if(titleMeta != null && titleMeta.Value.Length > 0) {
				photograph.title = titleMeta.Value;
			}
			var descriptionMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "description");
			if(descriptionMeta != null && descriptionMeta.Value.Length > 0) {
				photograph.description = descriptionMeta.Value;
			}
			var authorMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "author");
			if(authorMeta != null && authorMeta.Value.Length > 0) {
				photograph.author = authorMeta.Value;
			}
			var keywordsMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "keywords");
			if(keywordsMeta != null && keywordsMeta.Value.Length > 0) {
				photograph.keywords = keywordsMeta.Value.Split(',').ToList();
			}
			var dateTakenMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "dateTaken");
			if(dateTakenMeta != null && dateTakenMeta.Value.Length > 0) {
				DateTime.TryParseExact(dateTakenMeta.Value, "yyyy-MM-dd_HH-mm-ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out photograph.dateTaken);
			}
			var dateDigitizedMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "dateDigitized");
			if(dateDigitizedMeta != null && dateDigitizedMeta.Value.Length > 0) {
				DateTime.TryParseExact(dateDigitizedMeta.Value, "yyyy-MM-dd_HH-mm-ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out photograph.dateDigitized);
			}
			var dateModifiedMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "dateModified");
			if(dateModifiedMeta != null && dateModifiedMeta.Value.Length > 0) {
				DateTime.TryParseExact(dateModifiedMeta.Value, "yyyy-MM-dd_HH-mm-ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out photograph.dateModified);
			}
			var dateCreatedMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "dateCreated");
			if(dateCreatedMeta != null && dateCreatedMeta.Value.Length > 0) {
				DateTime.TryParseExact(dateCreatedMeta.Value, "yyyy-MM-dd_HH-mm-ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out photograph.dateCreated);
			}
			var coordinatesMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "coordinates");
			if(coordinatesMeta != null && coordinatesMeta.Value.Length > 1) {
				photograph.coordinates = new Vector2(0, 0);
				string[] coordinates = coordinatesMeta.Value.Split(',');
				if(coordinates.Length == 2) {
					float.TryParse(coordinates[0], out photograph.coordinates.X);
					float.TryParse(coordinates[1], out photograph.coordinates.Y);
				}
			}
			var cameraModelMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "cameraModel");
			if(cameraModelMeta != null && cameraModelMeta.Value.Length > 0) {
				photograph.cameraModel = cameraModelMeta.Value;
			}
			photograph.filePath = path;
			string filePathWithoutRoot = path.Substring(Program.rootPath.Length);
			photograph.webPath = Program.rootPathWeb + "/" + filePathWithoutRoot.Replace('\\', '/');
			
			//check if files FILENAME_tiny.jpg and FILENAME_medium.jpg exist in directory "previews" next to the original file
			photograph.webPathMedium = photograph.webPath;
			photograph.webPathTiny = photograph.webPath;
			string previewsPath = Path.Combine(fileInfo.DirectoryName, "previews");
			string filePathWithoutRootWithoutFileName = filePathWithoutRoot.Substring(0, filePathWithoutRoot.Length - fileInfo.Name.Length);
			string previewWebPath = Program.rootPathWeb + "/" + filePathWithoutRootWithoutFileName.Replace('\\', '/') + "/previews/";
			string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileInfo.Name);
			if(System.IO.Directory.Exists(previewsPath)) {
				string tinyPath = Path.Combine(previewsPath, fileNameWithoutExtension + "_tiny.jpg");
				if(File.Exists(tinyPath)) {
					photograph.webPathTiny = previewWebPath + fileNameWithoutExtension + "_tiny.jpg";
				}
				string mediumPath = Path.Combine(previewsPath, fileNameWithoutExtension + "_medium.jpg");
				if(File.Exists(mediumPath)) {
					photograph.webPathMedium = previewWebPath + fileNameWithoutExtension + "_medium.jpg";
				}
			}


			Console.WriteLine("photograph webpath: " + photograph.webPath);
			return photograph;
		}

		public static Size GetSize(string fullPath) {
			Size size = new Size(0, 0);
			using(Stream stream = File.OpenRead(fullPath)) {
				using(Image sourceImage = Image.FromStream(stream, false, false)) {
					size.Width = sourceImage.Width;
					size.Height = sourceImage.Height;
				}
			}
			return size;
		}
		public string GetCoordinatesDecimalString() {
			if(coordinates.X == 0) return "";
			return coordinates.X + ", " + coordinates.Y;
		}
		public string GetCoordinatesDegreeString() {
			if(coordinates.X == 0 && coordinates.Y == 0) return "";

			string latitude = ConvertDecimalToDMS(coordinates.X, true);
			string longitude = ConvertDecimalToDMS(coordinates.Y, false);

			return $"{latitude}, {longitude}";
		}
		public static List<Photograph> SortPhotoGraphByDate(List<Photograph> photographs) {
			//sort by date taken
			photographs.Sort((x, y) => DateTime.Compare(x.dateTaken, y.dateTaken));
			return photographs;
		}

		private static void ParseGpsCoordinates(Photograph photograph, MetadataExtractor.Directory directory) {
			string latitudeRef = directory.Tags.FirstOrDefault(t => t.Name == "GPS Latitude Ref")?.Description ?? string.Empty;
			string latitude = directory.Tags.FirstOrDefault(t => t.Name == "GPS Latitude")?.Description ?? string.Empty;
			string longitudeRef = directory.Tags.FirstOrDefault(t => t.Name == "GPS Longitude Ref")?.Description ?? string.Empty;
			string longitude = directory.Tags.FirstOrDefault(t => t.Name == "GPS Longitude")?.Description ?? string.Empty;

			if(!string.IsNullOrEmpty(latitude) && !string.IsNullOrEmpty(longitude) &&
				!string.IsNullOrEmpty(latitudeRef) && !string.IsNullOrEmpty(longitudeRef)) {
				photograph.coordinates.X = ConvertGpsToDecimal(latitude, latitudeRef);
				photograph.coordinates.Y = ConvertGpsToDecimal(longitude, longitudeRef);
			}
		}

		private static float ConvertGpsToDecimal(string coordinate, string direction) {
			string[] parts = coordinate.Split(new char[] { '°', '\'', '"' }, StringSplitOptions.RemoveEmptyEntries);
			if(parts.Length != 3) return 0;

			float degrees = float.Parse(parts[0], CultureInfo.InvariantCulture);
			float minutes = float.Parse(parts[1], CultureInfo.InvariantCulture);
			float seconds = float.Parse(parts[2].Replace(',', '.'), CultureInfo.InvariantCulture);

			float decimalCoordinate = degrees + (minutes / 60) + (seconds / 3600);
			if(direction == "S" || direction == "W") {
				decimalCoordinate *= -1;
			}

			return decimalCoordinate;
		}
		private string ConvertDecimalToDMS(float decimalCoordinate, bool isLatitude) {
			string direction;
			if(isLatitude) {
				direction = decimalCoordinate >= 0 ? "N" : "S";
			}
			else {
				direction = decimalCoordinate >= 0 ? "E" : "W";
			}

			decimalCoordinate = Math.Abs(decimalCoordinate);
			int degrees = (int)decimalCoordinate;
			decimalCoordinate = (decimalCoordinate - degrees) * 60;
			int minutes = (int)decimalCoordinate;
			float seconds = (decimalCoordinate - minutes) * 60;

			return $"{degrees}° {minutes}' {seconds:0.##}\" {direction}";
		}
	}
}
