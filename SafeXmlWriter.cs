using System.Text;
using System.Xml;
using System.Globalization;

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

		for(int i = 0; i < xml.Length;) {
			int codePoint = char.ConvertToUtf32(xml, i);
			int charLen = char.IsSurrogatePair(xml, i) ? 2 : 1;

			if(IsLegalXmlChar(codePoint)) {
				buffer.Append(char.ConvertFromUtf32(codePoint));
			}
			else {
				Console.WriteLine("Illegal XML character: " + codePoint);
				Console.WriteLine("Index: " + i);
			}

			i += charLen;
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