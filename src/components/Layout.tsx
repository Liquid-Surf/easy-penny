import { FC, FormEventHandler, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SubmitButton, TextField } from "./ui/forms";

export const Layout: FC = (props) => {
  const route = useRouter();
  const [searchQuery, setSearchQuery] = useState(route.pathname === "/search/[query]" ? route.query.query : "");
  const [isLoading, setIsLoading] = useState(false);

  const onSearch: FormEventHandler = (e) => {
    e.preventDefault();

    const listener1 = () => setIsLoading(true);
    const listener2 = () => {
      setIsLoading(false);
      route.events.off("routeChangeStart", listener1);
      route.events.off("routeChangeComplete", listener2);
    };
    route.events.on("routeChangeStart", listener1);
    route.events.on("routeChangeComplete", listener2);
    route.push(`/search/${encodeURIComponent(searchQuery)}`);
  };

  const submitClassName = isLoading ? "animate-pulse p-3" : "p-3";

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
              className={submitClassName}
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