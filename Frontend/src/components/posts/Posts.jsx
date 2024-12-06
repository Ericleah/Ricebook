import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import "./posts.scss";
import Post from "../post/Post";
import Share from "../share/Share";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../reducer/authReducer";
import { setPosts } from "../../actions/postsActions";
import { selectPosts } from "../../reducer/postsReducer";
import { selectFollowedUsers } from "../../reducer/followedUsersReducer";
import { FilterTermContext } from "../../context/FilterTermContext";
import styled from "styled-components";
import { API_BASE_URL } from "../../config/config";

const BaseButton = styled.button`
  border: none;
  border-radius: 5px;
  padding: 5px 15px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
`;

const PageButton = styled(BaseButton)`
  color: black;
  background-color: #e3e0e0;
  margin-right: 5px;
  margin: 0 10px; // Adds 10px margin on both sides

  &:hover {
    background-color: #dedada;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const PageIndicator = styled.span`
  margin: 0 10px; // Maintains the margin
  font-size: 12px; // Sets the font size
  color: #6c757d; // Bootstrap's .text-muted color, adjust as needed
`;

const Posts = () => {
  const currentUser = useSelector(selectUser);
  const posts = useSelector(selectPosts);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Assuming total pages info is available from server
  const followedUsers = useSelector(selectFollowedUsers);
  const { filterTerm = "" } = useContext(FilterTermContext);
  const [fetchCount, setFetchCount] = useState(0);

  const fetchCurrentUserPosts = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/articles?username=${currentUser.username}&page=${currentPage}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("data", data.articles.length);

      dispatch(setPosts(data.articles));
      //setTotalPages(data.articles.length); // Set the total pages (assuming the server sends this info)
      setTotalPages(data.articles.length);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUserPosts();
  }, [currentPage, followedUsers]); // Dependency on currentPage

  const sortedAndFilteredPosts = useMemo(() => {
    return (Array.isArray(posts) ? posts : [])
      .filter((post) => {
        const lowercasedFilterTerm = filterTerm.toLowerCase();
        return (
          (post.author &&
            post.author.toLowerCase().includes(lowercasedFilterTerm)) ||
          (post.text && post.text.toLowerCase().includes(lowercasedFilterTerm))
          // Removed the filters for date and customId
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [posts, filterTerm]);

  return (
    console.log(totalPages),
    (
      <div className="posts container mt-5">
        <Share />
        <div className="row">
          {/* Posts mapping */}
          {sortedAndFilteredPosts.map((post) => (
            <div className="col-12 mb-5" key={post.customId}>
              <Post post={post} fetchCurrentUserPosts={fetchCurrentUserPosts}/>
            </div>
          ))}
        </div>
        <PaginationContainer>
          <PageButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          <PageIndicator>
            Page {currentPage} of {totalPages}
          </PageIndicator>
          <PageButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </PaginationContainer>
      </div>
    )
  );
};

export default Posts;