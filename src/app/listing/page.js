'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";

export default function List() {
  const [savedLists, setSavedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const router = useRouter();

  
  const fetchSavedLists = async () => {
    try {
      const response = await axios.get('https://dog-status-backend.onrender.com/user/saved-lists', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setSavedLists(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching saved lists.');
      setLoading(false);
    }
  };


  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      router.push("/login");
    } else{
      fetchSavedLists()
    }
  }, []);


  useEffect(() => {
    const handleRouteChange = () => {
      fetchSavedLists();
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // useEffect(() => {
  //   const fetchSavedLists = async () => {
  //     try {
  //       const response = await axios.get('https://dog-status-backend.onrender.com/user/saved-lists', {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  //         },
  //       });
  //       setSavedLists(response.data.data);
  //       setLoading(false);
  //     } catch (err) {
  //       setError('Error fetching saved lists.');
  //       setLoading(false);
  //     }
  //   };

  //   fetchSavedLists();
  // }, [router]);

  const handleSelectList = (listId) => {
    const list = savedLists.find((item) => item._id === listId);
    setSelectedList(list);
  };

  const handleDeleteList = async (listId) => {
    try {
      const authToken = localStorage.getItem("authToken");
  
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }
  
      const response = await axios.delete(`https://dog-status-backend.onrender.com/user/saved-list/${listId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if(!response.data.data.length){
        setSavedLists(null);
        setSelectedList(null)
        return
      }
      setSavedLists(response.data.data);
  
      if (selectedList && selectedList._id === listId) setSelectedList(null);
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleEditList = (listId) => {
    window.location.href = `/listing/${listId}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Listing Page</h1>
      <div style={{ display: "flex", gap: "0px" }}>
        <div style={{ flex: 0.5 }}>
          <h2>Lists</h2>
          {savedLists && savedLists.length === 0 ? (
            <p>No saved lists. First, create your list!</p>
          ) : (
            <ul>
              {savedLists.map((list) => (
                <li key={list._id} style={{ marginBottom: "10px" }}>
                  <span
                    style={{
                      cursor: "pointer",
                      color: selectedList?._id === list._id ? 'green' : 'blue',
                      fontWeight: selectedList?._id === list._id ? 'bold' : 'normal', 
                    }}
                    onClick={() => handleSelectList(list._id)}
                  >
                    {list.listName}
                  </span>
                  <button
                    style={{ marginLeft: "10px", padding: "5px" }}
                    onClick={() => handleEditList(list._id)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ marginLeft: "10px", padding: "5px", color: "red" }}
                    onClick={() => handleDeleteList(list._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 2 }}>
          {selectedList ? (
            <div>
              <h2>{selectedList.listName}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px" }}>
                {selectedList.savedImages.map((image) => (
                  <div key={image._id} style={{ textAlign: "center" }}>
                    <img
                      src={image.imageUrl}
                      alt={image.imageName}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        objectFit: "cover",
                        borderRadius: "8px",
                        maxHeight: "700px",
                      }}
                    />
                    <p>{image.imageName}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
