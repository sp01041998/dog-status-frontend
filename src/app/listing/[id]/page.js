'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useRouter } from "next/navigation";


export default function ListingDetails() {
    const { id } = useParams();
    const [listDetails, setListDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [filteredImages, setFilteredImages] = useState([]);
    const router = useRouter();


    useEffect(() => {
        const authToken = localStorage.getItem("authToken");
    
        if (!authToken) {
          router.push("/login");
        } 
      }, []);
  
    useEffect(() => {
      const fetchListDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:3003/user/saved-list/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          const fetchedData = response.data?.data;
          setListDetails(fetchedData);
          setFilteredImages(fetchedData.savedImages || []);
        } catch (err) {
          setError('Error fetching list details.');
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchListDetails();
      }
    }, [id]);
  
    const handleFilter = (e) => {
      const queryValue = e.target.value.trim();
      if (queryValue === '') {
        setFilteredImages(listDetails?.savedImages || []);
        setQuery(queryValue);
        return;
      }
      setQuery(queryValue);
      
      const regex = new RegExp(queryValue.replace(/x/gi, '\\d'), 'i'); 
      
      const filtered = listDetails?.savedImages.filter((image) => {
        return regex.test(image.statusCode.toString()); 
      });
  
      setFilteredImages(filtered || []); 
    };
  
    const handleRemoveImage = async (imageId) => {
      try {
        const updatedImages = filteredImages.filter((image) => image._id !== imageId);
        setFilteredImages(updatedImages);
        const response = await axios.post(
          `http://localhost:3003/user/saved-list/${id}/image/${imageId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );
        const updatedListDetails = response.data?.data;
        setListDetails(updatedListDetails);  
      } catch (err) {
        setError('Error removing image.');
        console.error(err);
      }
    };
    
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
  
    return (
      <div style={{ padding: '20px' }}>
        <h1>List Details</h1>
        {listDetails ? (
          <div>
            <h2>{listDetails.listName}</h2>
            <div style={{ marginBottom: '20px'}}>
              <input
                type="text"
                placeholder="Search images by status code..."
                value={query}
                onChange={handleFilter}
                style={{
                  padding: '10px',
                  width: '100%',
                  maxWidth: '400px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
            {filteredImages.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Larger images
                  gap: '20px',
                }}
              >
                {filteredImages.map((image) => (
                  <div key={image._id} style={{ textAlign: 'center' }}>
                    <img
                      src={image.imageUrl}
                      alt={image.imageName}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        maxHeight: '500px', // Increased max height
                      }}
                    />
                    <p>{image.imageName}</p>
                    <button
                      onClick={() => handleRemoveImage(image._id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No images match your search.</p>
            )}
          </div>
        ) : (
          <p>No details available.</p>
        )}
      </div>
    );
  }
  
  
