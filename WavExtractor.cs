namespace TWG5000 {
	public class WavExtractor {
		/// <summary>
		/// Scans the given file for an embedded WAV track by locating the "RIFF" header,
		/// then reads the next 4 bytes to determine the WAV chunk size (file size minus 8),
		/// and finally extracts only the WAV data. The output file is placed in the same folder
		/// as the input, with the same filename and a .wav extension.
		/// </summary>
		/// <param name="filePath">Path to the input file (e.g., a Sound &amp; Shot JPEG).</param>
		public static bool ExtractWavFromFile(string filePath) {
			if(!File.Exists(filePath)) {
				Console.WriteLine("File not found: " + filePath);
				return false;
			}

			try {
				// Read the entire file into memory.
				byte[] fileData = File.ReadAllBytes(filePath);
				ReadOnlySpan<byte> fileSpan = fileData.AsSpan();

				// Define the RIFF header as a byte array.
				ReadOnlySpan<byte> riffHeader = new byte[] { (byte)'R', (byte)'I', (byte)'F', (byte)'F' };

				// Efficiently search for the RIFF header using Span.IndexOf.
				int startIndex = fileSpan.IndexOf(riffHeader);
				if(startIndex == -1) {
					Console.WriteLine("No embedded WAV (RIFF header) found in the file.");
					return false;
				}

				// Ensure there are at least 8 bytes available to read the chunk size.
				if(fileData.Length < startIndex + 8) {
					Console.WriteLine("Insufficient data after RIFF header to determine WAV size.");
					return false;
				}

				// According to the RIFF/WAV format:
				// - Bytes 0-3 are "RIFF".
				// - Bytes 4-7 (little-endian) give the chunk size.
				// The total WAV size is then (chunk size + 8) bytes.
				int chunkSize = BitConverter.ToInt32(fileData, startIndex + 4);
				int wavTotalSize = chunkSize + 8;

				int availableBytes = fileData.Length - startIndex;
				if(wavTotalSize > availableBytes) {
					Console.WriteLine("Warning: The WAV data appears to be truncated. Extracting available data.");
					wavTotalSize = availableBytes;
				}

				// Extract exactly the WAV data.
				byte[] wavData = new byte[wavTotalSize];
				Array.Copy(fileData, startIndex, wavData, 0, wavTotalSize);

				// Create output file path: same base filename with .wav extension.
				string directory = Path.GetDirectoryName(filePath);
				string fileNameWithoutExt = Path.GetFileNameWithoutExtension(filePath);
				string outputFilePath = Path.Combine(directory, fileNameWithoutExt + ".wav");

				File.WriteAllBytes(outputFilePath, wavData);
				Console.WriteLine("WAV file extracted successfully to: " + outputFilePath);
				return true;
			}
			catch(Exception ex) {
				Console.ForegroundColor = ConsoleColor.Red;
				Console.WriteLine("--------------------------------");
				Console.WriteLine("Error during extraction:\n" + ex.Message);
				Console.WriteLine("--------------------------------");
				Console.ResetColor();
				return false;
			}
		}
	}
}
