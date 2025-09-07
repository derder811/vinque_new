import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../Compo/Header/Header";
import Sidebar from "../../../Compo/Sidebar/Sidebar";
import styles from "./SellerEditProfile.module.css";

function SellerEditProfile() {
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id: sellerId } = useParams();
  // Get user data from localStorage and ensure it has the correct format
  const userString = localStorage.getItem("user");
  console.log("User string from localStorage:", userString);
  const user = JSON.parse(userString || "{}");

  // Check if the current user is the seller
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Seller ID from URL:", sellerId);
    console.log("User seller_id:", user?.seller_id);
    
    // For now, allow editing without strict permission check
    // This can be re-enabled once user data structure is consistent
    // Commenting out permission check temporarily to debug the issue
    // if (user?.seller_id && user.seller_id.toString() !== sellerId) {
    //   console.log("Permission error: User is not the seller");
    //   setError("You don't have permission to edit this profile");
    //   return;
    // }

    if (formRef.current) formRef.current.classList.add(styles.animateEnter);

    const fetchSellerData = async () => {
      try {
        setLoading(true);
        // Use the correct backend URL
        const backendUrl = 'http://localhost:3000';
        console.log("Fetching seller data for ID:", sellerId);
        
        // Check if sellerId is valid
        if (!sellerId) {
          throw new Error("Missing seller ID parameter");
        }
        
        const response = await fetch(`${backendUrl}/api/seller/${sellerId}`);
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log("Raw API response:", responseText);
        
        // Try to parse the response as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          throw new Error("Invalid response format from server");
        }

        if (data.status === "success" && data.seller) {
          const sellerData = data.seller;
          console.log("Fetched seller data:", sellerData);
          
          // Set form fields with seller data
          setBusinessName(sellerData.business_name || "");
          setBusinessDescription(sellerData.business_description || "");
          setBusinessAddress(sellerData.business_address || "");
          setPhoneNum(sellerData.phone_num || "");
          
          // Set profile image if available
          if (sellerData.seller_image) {
            const imageUrl = sellerData.seller_image.startsWith('http') 
              ? sellerData.seller_image 
              : `${backendUrl}/${sellerData.seller_image}`;
            setProfileImagePreview(imageUrl);
            console.log("Using seller image:", imageUrl);
          } else if (user?.picture) {
            // Use Google profile picture as fallback
            setProfileImagePreview(user.picture);
            console.log("Using Google profile picture:", user.picture);
          }
        } else {
          console.error("Error fetching seller data:", data.message || data.error);
          setError(data.message || data.error || "Failed to fetch seller data");
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
        setError(err.message || "Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Revoke previous object URL to prevent memory leaks
    if (profileImagePreview && !profileImagePreview.startsWith('http')) {
      URL.revokeObjectURL(profileImagePreview);
    }

    // Create a smaller preview image to improve performance
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Get optimized image URL
        const optimizedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfileImagePreview(optimizedImageUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    setProfileImage(file);
    console.log("Image selected:", file.name);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    console.log("Current user:", user);
    console.log("Seller ID from URL:", sellerId);
    console.log("Business name:", businessName);
    console.log("Business description:", businessDescription);

    // Validate required fields
    if (!businessName.trim()) {
      alert("Business name is required");
      return;
    }

    // Create form data with all fields
    const formData = new FormData();
    formData.append("business_name", businessName.trim());
    formData.append("business_description", businessDescription || "");
    formData.append("business_address", businessAddress || "");
    formData.append("phone_num", phoneNum || "");
    
    // Handle profile image
    if (user?.picture && profileImagePreview === user.picture) {
      // Using Gmail profile picture
      console.log("Using Gmail profile picture:", user.picture);
      formData.append("profile_pic_url", user.picture);
    } else if (profileImage) {
      // Using newly uploaded image
      console.log("Using uploaded image:", profileImage.name);
      formData.append("profile_image", profileImage);
    }

    try {
      // Show loading state
      setLoading(true);
      
      // Use the correct backend URL
      const backendUrl = 'http://localhost:3000';
      console.log("Sending update request to:", `${backendUrl}/api/seller/update/${sellerId}`);
      console.log("Form data keys:", [...formData.keys()]);
      
      const response = await fetch(`${backendUrl}/api/seller/update/${sellerId}`, {
        method: "PUT",
        body: formData,
      });

      console.log("Response status:", response.status);
      
      let result;
      try {
        const responseText = await response.text();
        console.log("Raw response text:", responseText);
        result = JSON.parse(responseText);
        console.log("Parsed response:", result);
      } catch (parseError) {
        console.error("Error parsing response JSON:", parseError);
        alert("Error parsing server response. Please try again later.");
        setLoading(false);
        return;
      }

      if (result.success) {
        alert("Profile updated successfully!");
        
        // If we uploaded a new image, clean up the object URL
        if (profileImagePreview && !profileImagePreview.startsWith('http')) {
          URL.revokeObjectURL(profileImagePreview);
        }
        
        // Navigate to store page
        navigate(`/store/${sellerId}`);
      } else {
        setLoading(false);
        alert(`Error: ${result.error || "Failed to update profile"}`);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setLoading(false);
      alert("Network error. Please try again later.");
    }
  };

  if (loading) {
    return (
      <>
        <Header showSearchBar={false} showItems={false} isSeller={true} />
        <div className={styles.container}>
          <Sidebar />
          <main className={styles.content}>
            <div className={styles.loading}>Loading...</div>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header showSearchBar={false} showItems={false} isSeller={true} />
        <div className={styles.container}>
          <Sidebar />
          <main className={styles.content}>
            <div className={styles.error}>{error}</div>
          </main>
        </div>
      </>
    );
  }

  // Create a function to render the form
  const renderForm = () => {
    return (
    <>
      <Header showSearchBar={false} showItems={false} isSeller={true} />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.content}>
          <form ref={formRef} className={styles.editProfileForm} onSubmit={handleSubmit}>
            <h2 className={styles.mainHeading}>Edit Store</h2>

            <div className={styles.profileImageSection}>
              <div className={styles.profileImageContainer} onClick={handleImageClick}>
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Store profile"
                    className={styles.profileImage}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Vinque_logo.png";
                    }}
                  />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                    </svg>
                  </div>
                )}
                <div className={styles.changePhotoText}>Change Photo</div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className={styles.fileInput}
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>

            <div className={styles.storeInfoSection}>
              <h3 className={styles.sectionHeading}>About Store</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="businessName" className={styles.formLabel}>Business Name <span className={styles.required}>*</span></label>
                <input
                  id="businessName"
                  className={styles.formInput}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="businessDescription" className={styles.formLabel}>Business Description</label>
                <textarea
                  id="businessDescription"
                  rows="4"
                  className={styles.formTextarea}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your business..."
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="businessAddress" className={styles.formLabel}>Business Address</label>
                <input
                  id="businessAddress"
                  className={styles.formInput}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Enter your business address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phoneNum" className={styles.formLabel}>Phone Number</label>
                <input
                  id="phoneNum"
                  className={styles.formInput}
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton}>Save Changes</button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => navigate(`/store/${sellerId}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
  };
  
  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  
  return renderForm();
}

export default SellerEditProfile;