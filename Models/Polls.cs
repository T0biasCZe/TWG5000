using System.Xml.Serialization;

namespace TWG5000.Models {

	public static class Polls {
		public static List<Poll> PollList = null;
		public static void LoadPolls() {
			var path = Path.Combine(AppContext.BaseDirectory, "polls", "polls.xml");
			//if file ./polls/polls.xml exists, load it into PollList
			if(File.Exists(path)) {
				Console.WriteLine("SOUBOR ./polls/polls.xml existuje, načítám");
				var xml = File.ReadAllText(path);
				// Deserialize the XML into PollList
				var serializer = new System.Xml.Serialization.XmlSerializer(typeof(List<Poll>));
				using(var reader = new StringReader(xml)) {
					PollList = (List<Poll>)serializer.Deserialize(reader);
				}
				Console.WriteLine("Načteno " + PollList.Count + " anket.");
			}
			else {
				PollList = new List<Poll>();
			}
		}
		public static void SavePolls() {
			var path = Path.Combine(AppContext.BaseDirectory, "polls", "polls.xml");
			var dir = Path.GetDirectoryName(path);
			if(!System.IO.Directory.Exists(dir)) {
				System.IO.Directory.CreateDirectory(dir);
			}
			var serializer = new System.Xml.Serialization.XmlSerializer(typeof(List<Poll>));
			using(var writer = new StreamWriter(path)) {
				serializer.Serialize(writer, PollList);
			}
			Console.WriteLine("Uloženo " + PollList.Count + " anket do " + path);
		}

	}

	public class Poll {
		public int PollID { get; set; }
		public string Title { get; set; } = string.Empty;
		public List<string> Options { get; set; } = new List<string>();
		public string defaultOption { get; set; } = string.Empty;

		// This is the property that will be serialized to XML
		[System.Xml.Serialization.XmlArray("Dates")]
		[System.Xml.Serialization.XmlArrayItem("Date")]
		public List<string> DatesString { get; set; } = new List<string>();

		// This property is ignored by XML and is used in your code
		[System.Xml.Serialization.XmlIgnore]
		public List<DateOnly> Dates {
			get => DatesString.Select(s =>
			{
				try { return DateOnly.ParseExact(s, "yyyy-MM-dd", null); }
				catch { return DateOnly.MinValue; }
			}).Where(d => d != DateOnly.MinValue).ToList();
			set => DatesString = value?.Select(d => d.ToString("yyyy-MM-dd")).ToList() ?? new List<string>();
		}

		public bool vypsatJenDen = false;
		public List<Voter> Voters { get; set; } = new List<Voter>();
	}
	public class Voter {
		public string Username { get; set; } = string.Empty;
		public string LoginToken { get; set; } = string.Empty; //SHA256 hash of the username and password
		public List<PollDen> PollDny { get; set; } = new List<PollDen>();

		public Voter() {
		}
		public Voter(string username, string heslo, List<PollDen> pollDny) {
			Username = username;
			PollDny = pollDny;
			//generate login token as SHA256 hash of username and password
			using(var sha256 = System.Security.Cryptography.SHA256.Create()) {
				var bytes = System.Text.Encoding.UTF8.GetBytes(username + heslo);
				var hash = sha256.ComputeHash(bytes);
				LoginToken = Convert.ToBase64String(hash);
			}
		}
	}
	public class PollDen {
		[XmlIgnore]
		public DateOnly den {
			get {
				if(DateOnly.TryParseExact(denString, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var date)) {
					return date;
				}
				return DateOnly.MinValue; // or throw an exception if preferred
			}
			set { denString = value.ToString("yyyy-MM-dd"); }
		}
		public string denString = "";
		public string vybranaMoznost = string.Empty;
	}
}
