/**
 * Blackout's passage API.
 * Fetches a random passage from a Project Gutenberg book for use in the Studio.
 */

type GutenbergBook = {
  /** File formats and download URLs for the book. */
  formats: Record<string, string>;
};

/**
 * Selects a random English-language book from Gutendex and extracts
 * a 200-word passage from its text.
 *
 * @returns A response containing the passage.
 */
export async function GET() {
  const passageLength = 200;
  const textFormat = "text/plain; charset=utf-8";

  const booksResponse = await fetch("https://gutendex.com/books/?languages=en");
  const booksData = await booksResponse.json();

  const booksWithText = booksData.results.filter(
    (book: GutenbergBook) => book.formats[textFormat],
  );

  const randomBookIndex = Math.floor(Math.random() * booksWithText.length);
  const selectedBook = booksWithText[randomBookIndex];
  const bookTextUrl = selectedBook.formats[textFormat];

  const bookResponse = await fetch(bookTextUrl);
  const bookText = await bookResponse.text();
  const words = bookText.split(/\s+/);

  const maxStartIndex = words.length - passageLength;
  const startIndex = Math.floor(Math.random() * maxStartIndex);

  const passage = words.slice(startIndex, startIndex + passageLength).join(" ");

  return new Response(passage);
}
