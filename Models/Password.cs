namespace TWG5000.Models {
	public class Password {
		public string password { get; set; } = "";
		public string User { get; set; } = "";
		public Password() {
		}
		public Password(string password, string User) {
			this.password = password;
			this.User = User;
		}

	}
}
