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
		public static List<string> photoExtensions = new List<string> { ".jpg", ".jpeg", ".jxl", ".png", ".gif", ".bmp", ".tiff" };
		public string filePath = "";
		public string webPath = "";
		public string webPathTiny = "";
		public string webPathMedium = "";
		public string fileName = "";
		public string title = "";
		public string description = "";
		public string author = "";
		public List<string> keywords = new List<string>();

		public DateTime dateTaken;
		public DateTime dateDigitized;
		public DateTime dateModified; //date of the windows file modification
		public DateTime dateCreated;
		public DateTime dateEdited; //date of edit in photo editor like Lightroom

		public Size size = new Size(0, 0);
		public string exif = "";
		public Vector2 coordinates = new Vector2(0, 0);
		public string cameraModel = "";

		Dictionary<string, string> metainfo = new Dictionary<string, string>(); //external meta info from metainfo.csv
		IEnumerable<MetadataExtractor.Directory> directories;

		public static Photograph LoadPhotograph(string path) {
			Photograph photograph = new Photograph();
			FileInfo fileInfo = new FileInfo(path);
			photograph.fileName = fileInfo.Name;
			//load the exif from the file itself
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
						DateTime.TryParse(tag.Description, out photograph.dateTaken);
					}
					if(tag.Name == "Date/Time Digitized") {
						DateTime.TryParse(tag.Description, out photograph.dateDigitized);
					}
					if(tag.Name == "Date/Time") {
						DateTime.TryParse(tag.Description, out photograph.dateEdited);
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

			// Check if file metainfo.csv exists in the subdirectory
			string metainfoPath = Path.Combine(fileInfo.FullName + ".csv");
			if(File.Exists(metainfoPath)) {
				Console.WriteLine("metainfo found");
				photograph.metainfo = File.ReadAllLines(metainfoPath)
					.Select(line => line.Split(';'))
					.ToDictionary(line => line[0], line => line[1]);
			}
			if(photograph.metainfo.ContainsKey("title")) {
				photograph.title = photograph.metainfo["title"];
			}
			if(photograph.metainfo.ContainsKey("description")) {
				photograph.description = photograph.metainfo["description"];
			}
			if(photograph.metainfo.ContainsKey("author")) {
				photograph.author = photograph.metainfo["author"];
			}
			if(photograph.metainfo.ContainsKey("keywords")) {
				photograph.keywords = photograph.metainfo["keywords"].Split(',').ToList();
			}
			if(photograph.metainfo.ContainsKey("dateTaken")) {
				DateTime.TryParse(photograph.metainfo["dateTaken"], out photograph.dateTaken);
			}
			if(photograph.metainfo.ContainsKey("dateDigitized")) {
				DateTime.TryParse(photograph.metainfo["dateDigitized"], out photograph.dateDigitized);
			}
			if(photograph.metainfo.ContainsKey("dateModified")) {
				DateTime.TryParse(photograph.metainfo["dateModified"], out photograph.dateModified);
			}
			if(photograph.metainfo.ContainsKey("dateCreated")) {
				DateTime.TryParse(photograph.metainfo["dateCreated"], out photograph.dateCreated);
			}
			if(photograph.metainfo.ContainsKey("coordinates")) {
				string[] coordinates = photograph.metainfo["coordinates"].Split(',');
				if(coordinates.Length == 2) {
					float.TryParse(coordinates[0], out photograph.coordinates.X);
					float.TryParse(coordinates[1], out photograph.coordinates.Y);
				}
			}
			if(photograph.metainfo.ContainsKey("cameraModel")) {
				photograph.cameraModel = photograph.metainfo["cameraModel"];
			}

			photograph.filePath = path;
			string filePathWithoutRoot = path.Substring(PhotosPage.rootPath.Length);
			photograph.webPath = PhotosPage.rootPathWeb + "/" + filePathWithoutRoot.Replace('\\', '/');
			
			//check if files FILENAME_tiny.jpg and FILENAME_medium.jpg exist in directory "previews" next to the original file
			photograph.webPathMedium = photograph.webPath;
			photograph.webPathTiny = photograph.webPath;
			string previewsPath = Path.Combine(fileInfo.DirectoryName, "previews");
			string filePathWithoutRootWithoutFileName = filePathWithoutRoot.Substring(0, filePathWithoutRoot.Length - fileInfo.Name.Length);
			string previewWebPath = PhotosPage.rootPathWeb + "/" + filePathWithoutRootWithoutFileName.Replace('\\', '/') + "/previews/";
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
			//sort by date taken, if not available, by date digitized, if not available, by date modified, if not available, by date created
			photographs.Sort((a, b) => {
				if(a.dateTaken != DateTime.MinValue && b.dateTaken != DateTime.MinValue) {
					return a.dateTaken.CompareTo(b.dateTaken);
				}
				if(a.dateDigitized != DateTime.MinValue && b.dateDigitized != DateTime.MinValue) {
					return a.dateDigitized.CompareTo(b.dateDigitized);
				}
				if(a.dateModified != DateTime.MinValue && b.dateModified != DateTime.MinValue) {
					return a.dateModified.CompareTo(b.dateModified);
				}
				if(a.dateCreated != DateTime.MinValue && b.dateCreated != DateTime.MinValue) {
					return a.dateCreated.CompareTo(b.dateCreated);
				}
				return 0;
			});
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
