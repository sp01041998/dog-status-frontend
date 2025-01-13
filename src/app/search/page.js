'use client';

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from "next/navigation";


export default function Search() {
  const [query, setQuery] = useState('')
  const [dogImages, setDogImages] = useState([])
  const [filteredDogImages, setFilteredDogImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [listName, setListName] = useState('')
  const [isListNameInputVisible, setIsListNameInputVisible] = useState(false)
  const router = useRouter();


  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      router.push("/login");
    } 
  }, []);

  useEffect(() => {
    const fetchDogImages = async () => {
      try {
        const response = await axios.get('https://dog-status-backend.onrender.com/image')
        console.log(response.data.data)
        const imageData = response.data.data
        imageData.sort((a, b) => a.statusCode - b.statusCode)
        setDogImages(imageData)
        setFilteredDogImages(imageData)
        setLoading(false)
      } catch (err) {
        setError('Error fetching images, please try again later.')
        setLoading(false);
      }
    };

    fetchDogImages();
  }, []);

  const handleFilter = (e) => {
    const queryValue = e.target.value.trim()
    setQuery(queryValue)
    const regex = new RegExp(queryValue.replace(/x/gi, '\\d'), 'i')
  
    const filtered = listDetails?.savedImages.filter((image) => {
      return regex.test(image.statusCode.toString())
    });
  
    setFilteredDogImages(filtered || [])
  };
  
  

  const handleChange = (e) => {
    setQuery(e.target.value)
  };

  const handleSave = async () => {
    if (!listName) {
      alert('Please provide a list name.')
      return;
    }

    try {
      console.log('Saved images:', filteredDogImages);    
      const imageIds = filteredDogImages.map(dog => dog._id);
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        alert('You are not authenticated. Please log in.')
        return;
      }
      const data = {
        savedImages: imageIds,
        listName: listName,
      };
      const response = await axios.post(
        'https://dog-status-backend.onrender.com/user/saved-list',
        data,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log('Saved list successfully:', response.data);
      alert('Your saved list has been successfully saved!');
      setIsListNameInputVisible(false)
      setListName('');
    } catch (error) {
      console.error('Error saving the list:', error);
      alert('There was an error saving your list. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>HTTPS Status Dogs</h1>
      <p>Dogs for every HyperText Transfer Protocol response status code.</p>
      <input
        type="text"
        placeholder="Enter status code (e.g., 2xx, 20x, 203)"
        value={query}
        onChange={handleChange}
        onKeyUp={handleFilter}
        style={{
          padding: '10px',
          fontSize: '16px',
          marginBottom: '20px',
          width: '300px',
          borderRadius: '5px',
        }}
      />
      {loading && <p>Loading images...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        padding: '20px'
      }}>
        {filteredDogImages.map((dog) => (
          <div key={dog.statusCode} style={{
            textAlign: 'center',
            padding: '10px',
            boxSizing: 'border-box',
          }}>
            <img
              src={dog.imageUrl}
              alt={dog.imageName}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            <p style={{ marginTop: '10px' }}>{dog.imageName} ({dog.statusCode})</p>
          </div>
        ))}
      </div>

      {!isListNameInputVisible && (
        <button
          onClick={() => setIsListNameInputVisible(true)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginTop: '20px',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: 'red',
            color: 'white',
            fontWeight: '600',
          }}
        >
          Save Filtered List
        </button>
      )}

      {isListNameInputVisible && (
        <>
          <div style={{ marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Enter List Name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              style={{
                padding: '10px',
                fontSize: '16px',
                marginBottom: '20px',
                width: '300px',
                borderRadius: '5px',
              }}
            />
          </div>

          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              marginTop: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              backgroundColor: 'green',
              color: 'white',
              fontWeight: '600',
            }}
          >
            Confirm Save
          </button>
        </>
      )}
    </div>
  );
}
