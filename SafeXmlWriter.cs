using System.Text;
using System.Xml;

public class SafeXmlWriter : XmlTextWriter {
	public SafeXmlWriter(Stream stream, Encoding encoding) : base(stream, encoding) { }

	public override void WriteString(string text) {
		base.WriteString(SanitizeXmlString(text));
	}

	private string SanitizeXmlString(string xml) {
		if(string.IsNullOrEmpty(xml)) {
			return xml;
		}

		var buffer = new StringBuilder(xml.Length);

		foreach(char c in xml) {
			if(IsLegalXmlChar(c)) {
				buffer.Append(c);
			}
			else {
				Console.WriteLine("Illegal XML character: " + c);
				//print where the illegal character was
				Console.WriteLine("Index: " + xml.IndexOf(c));
			}
		}

		return buffer.ToString();
	}

	private bool IsLegalXmlChar(int character) {
		return
		(
			character == 0x9 /* == '\t' == 9   */          ||
			character == 0xA /* == '\n' == 10  */          ||
			character == 0xD /* == '\r' == 13  */          ||
			(character >= 0x20 && character <= 0xD7FF) ||
			(character >= 0xE000 && character <= 0xFFFD) ||
			(character >= 0x10000 && character <= 0x10FFFF)
		);
	}
}