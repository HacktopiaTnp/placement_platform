import { NextResponse } from "next/server";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import PDFParser from "pdf2json";

export const runtime = 'nodejs';

export async function POST(req) {
  let tempFilePath = null;
  
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer and save temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create temporary file
    tempFilePath = join(tmpdir(), `resume-${Date.now()}.pdf`);
    writeFileSync(tempFilePath, buffer);

    // Parse PDF
    const pdfParser = new PDFParser();
    
    const pdfText = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", pdfData => {
        try {
          // Extract text from all pages
          let fullText = '';
          
          if (pdfData.Pages && pdfData.Pages.length > 0) {
            pdfData.Pages.forEach(page => {
              if (page.Texts && page.Texts.length > 0) {
                page.Texts.forEach(textObj => {
                  if (textObj.R && textObj.R.length > 0) {
                    textObj.R.forEach(r => {
                      if (r.T) {
                        try {
                          // Decode URI component (pdf2json encodes text)
                          fullText += decodeURIComponent(r.T) + ' ';
                        } catch (e) {
                          // If decoding fails, use raw text
                          fullText += r.T.replace(/%20/g, ' ') + ' ';
                        }
                      }
                    });
                  }
                });
                fullText += '\n'; // Add newline after each text block
              }
            });
          }
          
          // Fallback to getRawTextContent if custom extraction fails
          if (!fullText.trim()) {
            fullText = pdfParser.getRawTextContent();
          }
          
          resolve(fullText);
        } catch (err) {
          // If all else fails, try getRawTextContent
          try {
            resolve(pdfParser.getRawTextContent());
          } catch {
            reject(err);
          }
        }
      });
      
      pdfParser.loadPDF(tempFilePath);
    });

    // Clean up temp file
    if (tempFilePath) {
      unlinkSync(tempFilePath);
    }

    console.log('Extracted text length:', pdfText.length);
    console.log('First 200 chars:', pdfText.substring(0, 200));

    // Clean and limit the text
    const cleanedText = pdfText
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000);

    console.log('Cleaned text length:', cleanedText.length);

    return NextResponse.json({
      success: true,
      text: cleanedText,
    });
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    
    // Clean up temp file on error
    if (tempFilePath) {
      try { unlinkSync(tempFilePath); } catch {}
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to parse PDF: ' + error.message },
      { status: 500 }
    );
  }
}
