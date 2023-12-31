import React, { useState } from "react";
import "./Search.css";
import { useQuery, gql } from "@apollo/client";
import Pagination from "@mui/material/Pagination";
import Story from "./Story";
import { FetchResult, Post } from "./Types";
import { GET_POST_INVENTORY } from "../queries/Queries";

//pageSize is the max number of stories per page
const pageSize = 10;

export function Search() {
  //useStates for input search text, selected tags and sort
  const [searchText, setSearchText] = React.useState<string>("");
  const [selects, setSelects] = React.useState<string>("");
  const [sortFilter, setsortFilter] = React.useState<string>("");
  const [input, setInput] = React.useState<string>("");

  //useStates for pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [offset, setOffset] = React.useState(0);

  //Hook to get data from the database via backend
  const { loading, data, refetch } = useQuery<FetchResult>(GET_POST_INVENTORY, {
    variables: {
      tag: selects,
      limit: pageSize,
      offset: 0,
      keepPreviousData: true,
      input: input,
      sortBy: sortFilter,
    },
  });

  /*updates the offset and refetches the data with this offset 
  (the data for the next page)*/
  const handlePageClick = (event: React.ChangeEvent<unknown>, page: number) => {
    setPageNumber(page);
    let newOffset = (page - 1) * pageSize;
    setOffset(newOffset);

    refetch({
      tag: selects,
      sortBy: sortFilter,
      limit: pageSize,
      offset: newOffset,
      input: input,
      keepPreviousData: true,
    });
  };

  //handel click on search-button
  const handleOnClick = (ev: any) => {
    //prevent refreash caused by form
    ev.preventDefault();
    setInput(searchText);
  };

  return (
    <div className="parent-div light-pink-border">
      <header className="header blue-border">
        <h1>Fantastic short stories</h1>
        <p className="p-header">Search among hundreds of titles</p>
      </header>

      <section className="search-section blue-border">
        <form
          className="search-form grid-container-search-form yellow-border"
          action="search-form"
        >
          <label
            className="search-label grid-element-one purple-border"
            htmlFor=""
          >
            Search by title
          </label>
          <input
            data-testid="search-input"
            className="search-input grid-element-two purple-border"
            type="text"
            placeholder=" Search..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
          <div className="grid-element-three purple-border">
            <button
              data-testid="search-button"
              className="search-btn"
              onClick={handleOnClick}
              font-style="Gill Sans"
            >
              Search
            </button>
          </div>
        </form>
      </section>
      <section className="select-section blue-border ">
        <div className="grid-container-select-section yellow-border">
          <div className="grid-element-picture purple-border">
            <img
              src={process.env.PUBLIC_URL + "/stories.svg"}
              alt="Books"
            ></img>
          </div>
          <div className="grid-element-one column purple-border">
            <label className="filter-label red-border" htmlFor="filter">
              Filter stories{" "}
            </label>
            <select
              data-testid="filter-select"
              className="filter-select red-border"
              name="filter"
              id="filter-drop-down"
              value={selects}
              onChange={(e) => {
                setSelects(e.target.value);
              }}
            >
              <option value="">Select one</option>
              <option value="history">History</option>
              <option value="crime">Crime</option>
              <option value="english">English</option>
              <option value="love">Love</option>
              <option value="fiction">Fiction</option>
              <option value="french">French</option>
              <option value="classic">Classic</option>
              <option value="magical">Magical</option>
              <option value="mystery">Mystery</option>
              <option value="american">American</option>
            </select>
          </div>
          <div className="grid-element-two column purple-border">
            <label className="sort-label red-border" htmlFor="sort">
              Sort stories
            </label>
            <select
              data-testid="sort-select"
              className="sort-select red-border"
              id="sort-drop-down"
              value={sortFilter}
              onChange={(e) => {
                setsortFilter(e.target.value);
              }}
            >
              <option value="">Select one</option>
              <option value="asc">From least to most likes</option>
              <option value="descending">From most to least likes</option>
            </select>
          </div>
        </div>
      </section>
      <section className="result-section blue-border">
        <div className="result-label-div yellow-border ">
          <label className="result-label ">Results from search</label>
        </div>
        {loading ? (
          <h3>Loading...</h3>
        ) : (
          <div className="all-stories-div">
            {!data && (
              <p className="not-found story-div light-gray-border">
                No stories available
              </p>
            )}
            {data && data.getPost.posts?.length === 0 && (
              <p className="not-found story-div light-gray-border">
                Found no stories matching your search and choice of filter
              </p>
            )}
            {data &&
              data.getPost.posts.map((inventory) => (
                <Story key={inventory.id} inventory={inventory} />
              ))}
          </div>
        )}
        <div className="pagination-div yellow-border">
          <Pagination
            data-testid="pagination"
            count={data && Math.ceil(data.getPost.count / pageSize)}
            onChange={(event, page) => handlePageClick(event, page)}
            className="paginationItemStyle red-border"
          />
        </div>
      </section>
    </div>
  );
}
export default Search;
