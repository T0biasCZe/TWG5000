namespace TWG5000.Models {
	public class Metainfo {
		public string Key { get; set; } = "";
		public string Value { get; set; } = "";
		public Metainfo() { }
		public Metainfo(string key, string value) {
			this.Key = key;
			this.Value = value;
		}
	}
}
