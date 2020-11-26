import * as React from "react";
import Head from "next/head";
import Image from "next/image";
import { Layout, } from "../../components/Layout";
import { SearchResponse } from "../api/search/[query]";
import { search } from "../../data/search";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { PageTitle } from "../../components/ui/headings";
import { Main } from "../../components/Main";
import { SessionPrompt } from "../../components/SessionPrompt";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Search: React.FC<Props> = (props) => {
  const books = props.GoodreadsResponse.search[0].results[0].work.map((work, i) => {
    return (
      <li key={work.id[0] + "_" + i}>
        <figure className="flex flex-col items-start sm:flex-row py-3">
          <Image
            src={work.best_book[0].image_url[0]}
            className="h-auto rounded-md"
            width={111}
            height={148}
          />
          <div className="flex flex-col px-3 items-start space-y-5">
            <dl className="">
              <dt className="sr-only">Title</dt>
              <dd className="text-lg">{work.best_book[0].title[0]}</dd>
              <dt className="sr-only">Author</dt>
              <dd className="">{work.best_book[0].author[0].name}</dd>
            </dl>
            <SessionPrompt prompt="Connect your Pod to list">
              Hi, you are logged in and can add this to your list as soon as I add that functionality for that.
            </SessionPrompt>
          </div>
        </figure>
      </li>
    );
  });

  return (
    <Layout>
      <Head>
        <title>Listomania search results</title>
      </Head>
      <Main>
        <PageTitle>Search results: {decodeURIComponent(props.GoodreadsResponse.search[0].query[0])}</PageTitle>
        <ul>
          {books}
        </ul>
      </Main>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<SearchResponse, { query: string }> = async (context) => {
  const query = context.params?.query;
  if (!query) {
    return {
      notFound: true,
    };
  }
  const searchResults = await search(decodeURIComponent(query));
  return {
    props: searchResults,
  };
}

export default Search;
