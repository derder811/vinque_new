import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../Compo/Header/Header";
import Sidebar from "../../../Compo/Sidebar/Sidebar";
import styles from "./SellerEditProfile.module.css";

export default function SellerEditProfile() {
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
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Check if the current user is the seller
  useEffect(() => {
    if (user?.seller_id?.toString() !== sellerId) {
      setError("You don't have permission to edit this profile");
      return;
    }

    if (formRef.current) formRef.current.classList.add(styles.animateEnter);

    const fetchSellerData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/seller/${sellerId}`);
        const data = await response.json();

        if (data.status === "success" && data.seller) {
          const seller = data.seller;
          setBusinessName(seller.business_name || "");
          setBusinessDescription(seller.business_description || "");
          setBusinessAddress(seller.business_address || "");
          setPhoneNum(seller.phone_num || "");
          
          if (seller.seller_image) {
            const imagePath = seller.seller_image.startsWith('/uploads/') 
              ? seller.seller_image 
              : `/uploads/${seller.seller_image}`;
            setProfileImagePreview(imagePath);
          }
          
          setLoading(false);
        } else {
          setError("Failed to load seller data");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
        setError("Network error. Please try again later.");
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

    setProfileImage(file);
    const imageUrl = URL.createObjectURL(file);
    setProfileImagePreview(imageUrl);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("business_name", businessName);
    formData.append("business_description", businessDescription);
    formData.append("business_address", businessAddress);
    formData.append("phone_num", phoneNum);
    
    if (profileImage) {
      formData.append("seller_image", profileImage);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/seller/update/${sellerId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("Profile updated successfully!");
        navigate(`/store/${sellerId}`);
      } else {
        alert(`Error: ${result.message || "Failed to update profile"}`);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
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
                <label htmlFor="businessName" className={styles.formLabel}>Business Name</label>
                <input
                  id="businessName"
                  className={styles.formInput}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="businessDescription" className={styles.formLabel}>Description</label>
                <textarea
                  id="businessDescription"
                  rows="4"
                  className={styles.formTextarea}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your store..."
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
}