import { FC, FormEventHandler, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SubmitButton, TextField } from "./ui/forms";

export const Layout: FC = (props) => {
  const route = useRouter();
  const [searchQuery, setSearchQuery] = useState(route.pathname === "/search/[query]" ? route.query.query : "");

  const onSearch: FormEventHandler = (e) => {
    e.preventDefault();

    route.push(`/search/${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <header className="bg-gray-50">
        <div className="container mx-auto flex px-5">
          <h1 className="py-8 text-2xl">
            <Link href="/">
              Listomania
            </Link>
          </h1>
          <form
            onSubmit={onSearch}
            className="flex items-center px-5 w-full space-x-3"
          >
            <label htmlFor="searchQuery" className="sr-only">Search:</label>
            <TextField
              id="searchQuery"
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full p-3"
            />
            <SubmitButton
              value="Search"
              className="p-3"
            />
          </form>
        </div>
      </header>
      <main className="container mx-auto">
        {props.children}
      </main>
    </>
  );
};