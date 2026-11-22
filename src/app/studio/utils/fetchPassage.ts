/**
 * Manages Blackout's passage requests.
 * Fetches a random passage from the passage API.
 */

/**
 * Requests a random passage from the passage API.
 *
 * @returns The passage text.
 * @throws If the API request fails.
 */
export default async function fetchPassage(): Promise<string> {
  const response = await fetch("/api/passage");

  if (!response.ok) {
    throw new Error("Failed to load fragment");
  }

  return response.text();
}
