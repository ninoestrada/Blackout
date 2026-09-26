export async function GET() {
  // Get a List of Books from Gutendex
  const response = await fetch("https://gutendex.com/books/?languages=en");

  const data = await response.json();

  type GutenbergBook = {
    formats: Record<string, string>;
  };

  // Keep Books with Plain-Text 
  const booksWithText = data.results.filter(
    (book: GutenbergBook) => book.formats["text/plain; charset=utf-8"],
  );

  // Pick Random Book
  const randomIndex = Math.floor(Math.random() * booksWithText.length);
  const book = booksWithText[randomIndex];

  // Get Book's URL
  const textUrl = book.formats["text/plain; charset=utf-8"];

  // Fetch Book
  const textResponse = await fetch(textUrl);
  const bookText = await textResponse.text();

  // Split Book into Words
  const words = bookText.split(/\s+/);

  // Pick Random Starting Point
  const passageLength = 200;
  const maxStart = words.length - passageLength;
  const randomStart = Math.floor(Math.random() * maxStart);

  // Grab 200 Words
  const passage = words
    .slice(randomStart, randomStart + passageLength)
    .join(" ");

  // Return the Passage
  return new Response(passage);
}
