import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For now, we'll use a simple text extraction approach
    // In production, you might want to use a library like pdf-parse
    try {
      // Install pdf-parse: npm install pdf-parse
      const pdfParse = require('pdf-parse');
      
      const data = await pdfParse(buffer);
      const text = data.text;

      // Clean and limit the text
      const cleanedText = text
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 characters

      return NextResponse.json({
        success: true,
        text: cleanedText,
      });
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      
      // Fallback: return a message if pdf-parse is not installed
      if (parseError.code === 'MODULE_NOT_FOUND') {
        return NextResponse.json({
          success: true,
          text: '[Resume uploaded - PDF parsing library not installed. Install pdf-parse package for full functionality]',
        });
      }

      return NextResponse.json(
        { success: false, error: 'Failed to parse PDF' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
