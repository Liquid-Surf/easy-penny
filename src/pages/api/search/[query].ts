import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { parseStringPromise } from 'xml2js';

export interface SearchResponse {
  GoodreadsResponse: {
    search: [{
      query: [string];
      results: [{ work: Array<{
        id: [string];
        best_book: [{
          id: [string];
          title: [string];
          author: [{ id: [string]; name: [string]; }];
          image_url: [string];
          small_image_url: [string];
        }];
      }> }];
    }];
  };
}

const handler: NextApiHandler<SearchResponse> = async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).send("Please provide a search term." as any);
  }
  const response = await fetch(`https://www.goodreads.com/search/index.xml?key=${process.env.GOODREADS_API_KEY}&q=${encodeURIComponent(query)}`);
  const rawXml = await response.text();
  const xml: SearchResponse = await parseStringPromise(rawXml);
  res.status(200).json(xml);
}

export default handler;
