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
using MediaInfo.DotNetWrapper;
using MediaInfo.DotNetWrapper.Enumerations;

using System.Text.RegularExpressions;
namespace TWG5000.Models {
	public class Photograph {
		public static List<string> photoExtensions = new List<string> { ".jpg", ".jpeg", ".jxl", ".png", ".mpo", ".gif", ".bmp", ".tiff", ".glb"};
		public static List<string> audioExtensions = new List<string> { ".wav" };
		public static List<string> videoExtensions = new List<string> { ".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv" };
		public string filePath = "";
		public string webPath = "";
		public string webPathTiny = "";
		public string webPathMedium = "";
		public string audioPath = ""; //path to audio file for Samsung sound photo (if exists)
		public string fileName = "";
		public string fileNameWithoutExtension => Path.GetFileNameWithoutExtension(filePath);
		public string title = "";
		public string description = "";
		public string author = "";
		public List<string> keywords = new List<string>();
		public bool is3D = false;
		public bool isNsfw = false;
		public bool isLivePhoto = false;
		public bool isVideo = false;
		public bool hasGif = false;
		public bool hasJpg = false;
		public bool hasMpo = false;

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

		public static Photograph LoadPhotograph(string path, bool enable3ds, bool enablelive, bool extractwav) {
			Photograph photograph = new Photograph();
			FileInfo fileInfo = new FileInfo(path);
			photograph.fileName = fileInfo.Name;
			//if the enable3ds flag is set, if the file is jpg or mpo, check if  .gif file with the same name exists, and if yes, skip the .jpg or .mpo
			if(enable3ds) {
				Console.WriteLine("Enable nintendo 3ds support enabled"); 
				if(fileInfo.Extension == ".jpg" || fileInfo.Extension == ".jpeg" || fileInfo.Extension == ".mpo" || fileInfo.Extension == ".MPO" || fileInfo.Extension == ".JPEG" || fileInfo.Extension == ".JPG") {
					string gifPath = Path.ChangeExtension(fileInfo.FullName, ".gif");
					if(File.Exists(gifPath)) {
						Console.WriteLine("Skipping jpg/mpo file because gif file exists: " + path);
						return null;
					}
				}
			}
			if(enablelive) {
				Console.WriteLine("Enable live photo enabled");
				//if the enablelive flag is set, if the file is .mov, check if .jpg file with the same name exists, and if yes, skip the .mov
				if(videoExtensions.Contains(fileInfo.Extension.ToLower())) {
					string jpgPath = Path.ChangeExtension(fileInfo.FullName, ".jpg");
					string jpegPath = Path.ChangeExtension(fileInfo.FullName, ".jpeg");
					if(File.Exists(jpgPath) || File.Exists(jpegPath)) {
						Console.WriteLine("Skipping mov file because jpg file exists: " + path);
						return null;
					}

				}
				//if the file is .jpg, check if .mov file with the same name exists, and if yes, set the isLivePhoto flag to true
				if(fileInfo.Extension == ".jpg" || fileInfo.Extension == ".jpeg" || fileInfo.Extension == ".JPEG" || fileInfo.Extension == ".JPG") {
					Console.WriteLine("live photo enabled and jpg found");
					string movPath = Path.ChangeExtension(fileInfo.FullName, ".mov");
					if(File.Exists(movPath)) {
						Console.WriteLine("Live photo found: " + path);
						photograph.isLivePhoto = true;
					}
				}
			}

			//Video detection
			
			if(videoExtensions.Contains(fileInfo.Extension.ToLower())) {
				if(enablelive){
					string jpgPath = Path.ChangeExtension(fileInfo.FullName, ".jpg");
					string jpegPath = Path.ChangeExtension(fileInfo.FullName, ".jpeg");
					if(File.Exists(jpgPath) || File.Exists(jpegPath)) {
						Console.WriteLine("Skipping video file because jpg file exists: " + path);
						return null;
					}
				}
				Console.WriteLine("Video file found: " + path);
				photograph.isVideo = true;
				photograph.size = new Size(1920, 1080);
			}

			if(extractwav && fileInfo.Extension == ".jpg") {
				Console.WriteLine("Extracting wav from jpg: " + path);
				if(WavExtractor.ExtractWavFromFile(path)) {
				Console.WriteLine("Wav extracted successfully from jpg: " + path);
				}
				else {
					Console.WriteLine("jpg doesnt have .wav in it");
				}
			}

			//check if there is an audio file with the same name as the photograph in the same directory but with an audio extension
			foreach(string audioExtension in audioExtensions) {
				string audioFilePath = Path.ChangeExtension(fileInfo.FullName, audioExtension);
				if(File.Exists(audioFilePath)) {
					Console.WriteLine("Audio file found: " + audioFilePath);
					//photograph.audioPath = audioFilePath;
					photograph.audioPath = Program.rootPathWeb + "/" + audioFilePath.Substring(Program.rootPath.Length).Replace('\\', '/');
					break;
				}
			}


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
			string metadataImageFile = path;
			if(enable3ds && fileInfo.Extension == ".gif") {
				photograph.hasGif = true;
				//check if there is .jpg file with the same name in the directory, if yes, load the exif from the .jpg file, if not, check if there is .mpo file with the same name in the directory, if yes, load the exif from the .mpo file
				string jpgPath = Path.ChangeExtension(fileInfo.FullName, ".jpg");
				string jpegPath = Path.ChangeExtension(fileInfo.FullName, ".jpeg");
				string mpoPath = Path.ChangeExtension(fileInfo.FullName, ".mpo");
				if(File.Exists(mpoPath)) {
					Console.WriteLine("Loading exif from mpo file: " + mpoPath);
					metadataImageFile = mpoPath;
				} 
				else if(File.Exists(jpgPath)) {
					Console.WriteLine("Loading exif from jpg file: " + jpgPath);
					metadataImageFile = jpgPath;
					photograph.hasJpg = true;
				}
				else if(File.Exists(jpegPath)) {
					Console.WriteLine("Loading exif from jpeg file: " + jpegPath);
					metadataImageFile = jpegPath;
					photograph.hasJpg = true;
				}
				if(File.Exists(mpoPath)){
					photograph.hasMpo = true;
				}
			}

			photograph.directories = ImageMetadataReader.ReadMetadata(metadataImageFile);
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
					if(tag.Name == "Make"){
						photograph.cameraModel = tag.Description;
					}
					if(tag.Name == "Model"){
						photograph.cameraModel += " " + tag.Description;
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
			//parse "nfsw" from metainfo
			var nsfwMeta = photograph.metainfo.FirstOrDefault(m => m.Key == "nsfw");
			if(nsfwMeta != null && nsfwMeta.Value.Length > 0) {
				photograph.isNsfw = nsfwMeta.Value == "true";
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

			if(photograph.dateTaken == new DateTime(0)) {
				Console.WriteLine($"No date taken found in exif with photo {photograph.fileName}, trying to parse from filename");
				photograph.dateTaken = ParseCustomDateTime(fileInfo.Name) ?? new DateTime(0);
			}

			if(photograph.dateTaken == new DateTime(0)) {
				//get the date from file modification time
				Console.WriteLine($"No date taken found in exif or filename with photo {photograph.fileName}, using file modification time");
				photograph.dateTaken = fileInfo.LastWriteTime;
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
			if(photograph.webPath.Contains(".gif", StringComparison.OrdinalIgnoreCase)) {
				if(System.IO.Directory.Exists(previewsPath)) {
					string tinyPath = Path.Combine(previewsPath, fileNameWithoutExtension + "_tiny.gif");
					if(File.Exists(tinyPath)) {
						photograph.webPathTiny = previewWebPath + fileNameWithoutExtension + "_tiny.gif";
					}
					string mediumPath = Path.Combine(previewsPath, fileNameWithoutExtension + "_medium.gif");
					if(File.Exists(mediumPath)) {
						photograph.webPathMedium = previewWebPath + fileNameWithoutExtension + "_medium.gif";
					}
				}
			}

			if(photograph.isVideo) {
				string tinyPath = Path.Combine(previewsPath, fileNameWithoutExtension + "_thumb.jpg");
				if(File.Exists(tinyPath)) {
					photograph.webPathTiny = previewWebPath + fileNameWithoutExtension + "_thumb.jpg";
				}
				else{
					photograph.webPathTiny = "/gfx/video.png"; //default thumbnail for videos
				}
				string mediumPath = Path.Combine(previewsPath, fileNameWithoutExtension + "_medium.mp4");
				if(File.Exists(mediumPath)) {
					photograph.webPathMedium = previewWebPath + fileNameWithoutExtension + "_medium.mp4";
				}
				else{
					photograph.webPathMedium = photograph.webPath; //default thumbnail for videos
				}
			}



			Console.WriteLine("photograph webpath: " + photograph.webPath);
			return photograph;
		}
		private const int exifOrientationID = 0x112; //274
		public static Size GetSize(string fullPath) {
			Size size = new Size(0, 0);
			if(photoExtensions.Contains(Path.GetExtension(fullPath).ToLower())){
				using(Stream stream = File.OpenRead(fullPath)) {
					using(Image sourceImage = Image.FromStream(stream, false, false)) {
						int Width = sourceImage.Width;
						int Height = sourceImage.Height;

						if(sourceImage.PropertyIdList.Contains(exifOrientationID)){
							PropertyItem propertyItem = sourceImage.GetPropertyItem(exifOrientationID);
							int orientation = propertyItem.Value[0];
							if(orientation >= 5 && orientation <= 8) {
								Width = sourceImage.Height;
								Height = sourceImage.Width;
							}
						}

						size.Width = Width;
						size.Height = Height;
					}
				}
			}
			else if(videoExtensions.Contains(Path.GetExtension(fullPath).ToLower())) {
				try {
					using(var mediaInfo = new MediaInfo.DotNetWrapper.MediaInfo()) {
						mediaInfo.Open(fullPath);

						string widthStr = mediaInfo.Get(StreamKind.Video, 0, "Width");
						string heightStr = mediaInfo.Get(StreamKind.Video, 0, "Height");

						if(int.TryParse(widthStr, out int width) && int.TryParse(heightStr, out int height)) {
							size.Width = width;
							size.Height = height;
						}

						mediaInfo.Close();
					}
				}
				catch(Exception ex) {
					Console.ForegroundColor = ConsoleColor.Red;
					Console.WriteLine("MediaInfo error: " + ex.Message);
					Console.ResetColor();	
				}
			}
			else{
				Console.ForegroundColor = ConsoleColor.Yellow;
				Console.WriteLine("WARNING FILE IS NOT PHOTO OR VIDEO: " + fullPath);
				Console.WriteLine("WARNING FILE IS NOT PHOTO OR VIDEO: " + fullPath);
				Console.WriteLine("WARNING FILE IS NOT PHOTO OR VIDEO: " + fullPath);
				Console.WriteLine("WARNING FILE IS NOT PHOTO OR VIDEO: " + fullPath);
				Console.WriteLine("WARNING FILE IS NOT PHOTO OR VIDEO: " + fullPath);
				Console.ResetColor();
			}
			if(size.Width == 0 || size.Height == 0) {
				Console.ForegroundColor = ConsoleColor.Red;
				Console.WriteLine("ERROR: Size could not be determined for file: " + fullPath);
				Console.WriteLine("ERROR: Size could not be determined for file: " + fullPath);
				Console.WriteLine("ERROR: Size could not be determined for file: " + fullPath);
				Console.WriteLine("ERROR: Size could not be determined for file: " + fullPath);
				Console.WriteLine("ERROR: Size could not be determined for file: " + fullPath);
				Console.ResetColor();
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

		public static DateTime? ParseCustomDateTime(string input) {
			Match match = Regex.Match(input, @"(\d{8})_(\d{6})");

			if(match.Success) {
				string datePart = match.Groups[1].Value;
				string timePart = match.Groups[2].Value;
				string dateTimeString = $"{datePart}_{timePart}";

				if(DateTime.TryParseExact(dateTimeString, "yyyyMMdd_HHmmss",
										   CultureInfo.InvariantCulture,
										   DateTimeStyles.None,
										   out DateTime parsedDate)) {
					return parsedDate;
				}
			}
			return null;
		}
	}
}
