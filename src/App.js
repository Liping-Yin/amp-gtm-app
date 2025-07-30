import "./App.css";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import { useEffect, useState } from "react";

function App() {
  // const apiKey = process.env.REACT_APP_AMPLI_API_KEY;

  const cld = new Cloudinary({ cloud: { cloudName: "dwi8mo6ev" } });

  // State for user testing - simplified
  const [userId, setUserId] = useState(''); // User identifier (required)
  const [userProperties, setUserProperties] = useState(''); // User properties (optional)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State for group testing - clarified structure
  const [groupValue, setGroupValue] = useState(''); // Group value for testing (01, 02, etc.)
  const [groupProperties, setGroupProperties] = useState(''); // Group properties (if provided, triggers group identification)

  // Use this sample image or upload your own via the Media Explorer
  const img = cld
    .image("IMG_4300_gkzshq")
    .format("auto") // Optimize delivery by resizing and applying auto-format and auto-quality
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio

  // Parse custom properties (works for both user and group properties)
  const parseCustomProperties = (customProps) => {
    if (!customProps.trim()) return {};
    
    try {
      // Try to parse as JSON first
      return JSON.parse(customProps);
    } catch (e) {
      // If not JSON, try to parse as key:value pairs
      try {
        const props = {};
        customProps.split(',').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            // Try to parse value as number or boolean, otherwise keep as string
            if (value === 'true') props[key] = true;
            else if (value === 'false') props[key] = false;
            else if (!isNaN(value)) props[key] = Number(value);
            else props[key] = value.replace(/['"]/g, ''); // Remove quotes
          }
        });
        return props;
      } catch (e2) {
        console.warn('Could not parse custom properties:', customProps);
        return {};
      }
    }
  };

  // Handle user login/identification
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      alert('Please enter a User ID');
      return;
    }

    if (window.analytics) {
      // 1. Identify the user with custom properties
      const userProps = parseCustomProperties(userProperties);
      const finalUserProps = {
        created_at: new Date().toISOString(),
        ...userProps
      };

      window.analytics.identify(userId, finalUserProps);
      console.log('User ID:', userId);
      console.log('User properties sent:', finalUserProps);

      // 2. Group identification - only if group properties are provided
      if (groupProperties.trim() && groupValue.trim()) {
        const groupProps = parseCustomProperties(groupProperties);
        
        window.analytics.group(groupValue, groupProps);
        
        console.log('Group Value:', groupValue);
        console.log('Group properties sent:', groupProps);
      } else if (groupProperties.trim() && !groupValue.trim()) {
        alert('Group Value is required when Group Properties are provided');
        return;
      }

      // 3. Track login event
      const eventProps = {
        user_id: userId,
        timestamp: new Date().toISOString()
      };
      
      // Add group info to event if group is identified
      if (groupProperties.trim() && groupValue.trim()) {
        eventProps.group_value = groupValue;
      }

      window.analytics.track('User Logged In', eventProps);

      setIsLoggedIn(true);
      console.log('User logged in and tracked!', { userId, groupValue: groupValue || 'none', hasGroupProps: !!groupProperties.trim() });
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.analytics) {
      window.analytics.track('User Logged Out', {
        user_id: userId,
        timestamp: new Date().toISOString()
      });
      
      window.analytics.reset(); // Clear user identity
    }
    
    setIsLoggedIn(false);
    setUserId('');
    setGroupValue('');
    setUserProperties('');
    setGroupProperties('');
    console.log('User logged out and analytics reset!');
  };

  // Segment Analytics Implementation - Track page load only when logged in
  useEffect(() => {
    if (isLoggedIn && window.analytics) {
      const eventProps = {
        page: 'Home',
        user_id: userId,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      };
      
      // Add group info if available
      if (groupProperties.trim() && groupValue.trim()) {
        eventProps.group_value = groupValue;
      }
      
      window.analytics.track('App Loaded', eventProps);
    }
  }, [isLoggedIn, userId, groupValue, groupProperties]);

  // Event handlers for tracking
  const handleButtonClick = () => {
    if (window.analytics && isLoggedIn) {
      const eventProps = {
        button_text: 'Click Me',
        location: 'homepage',
        user_id: userId,
        timestamp: new Date().toISOString()
      };
      
      // Add group info if available
      if (groupProperties.trim() && groupValue.trim()) {
        eventProps.group_value = groupValue;
      }
      
      window.analytics.track('Button Clicked', eventProps);
    }
    console.log('Button clicked and tracked!');
  };

  const handleImageLoad = () => {
    if (window.analytics && isLoggedIn) {
      const eventProps = {
        image_source: 'cloudinary',
        image_id: 'IMG_4300_gkzshq',
        image_size: '500x500',
        user_id: userId,
        timestamp: new Date().toISOString()
      };
      
      // Add group info if available
      if (groupProperties.trim() && groupValue.trim()) {
        eventProps.group_value = groupValue;
      }
      
      window.analytics.track('Image Viewed', eventProps);
    }
  };

  return (
    <div className="App">
      <h1>Segment Analytics Testing App</h1>
      
      {/* Login Form */}
      {!isLoggedIn ? (
        <div className="login-container fade-in">
          <h2 className="login-title">Testing Login</h2>
          <form onSubmit={handleLogin}>
            <h3 className="section-header">User Identifier & Properties</h3>
            
            <div className="form-group">
              <label>User ID (required):</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g., user-123"
                required
              />
              <div className="form-help">
                This is the user identifier (not a property)
              </div>
            </div>

            <div className="form-group">
              <label>User Properties (optional):</label>
              <textarea
                value={userProperties}
                onChange={(e) => setUserProperties(e.target.value)}
                placeholder={`JSON: {"name": "John Doe", "email": "john@example.com", "plan": "pro"}\nKey:value: name:John Doe, email:john@example.com, plan:pro`}
                rows="3"
              />
              <div className="form-help">
                Optional properties for this user (name, email, etc.)
              </div>
            </div>

            <h3 className="section-header">Group Testing (Optional)</h3>
            
            <div className="form-group">
              <label>Group Value (for testing):</label>
              <input
                type="text"
                value={groupValue}
                onChange={(e) => setGroupValue(e.target.value)}
                placeholder="e.g., 01, 02, company-123"
              />
              <div className="form-help">
                Test group identifier (01, 02, etc.) - company_id is the group type
              </div>
            </div>

            <div className="form-group">
              <label>Group Properties (optional):</label>
              <textarea
                value={groupProperties}
                onChange={(e) => setGroupProperties(e.target.value)}
                placeholder={`JSON: {"org plan": "Enterprise", "region": "US"}\nKey:value: org plan:Enterprise, region:US, employees:500`}
                rows="3"
              />
              <div className="form-help">
                If provided, will identify user with this group. If empty, no group identification.
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Login & Identify User
            </button>
          </form>
        </div>
      ) : (
        /* User Info Display */
        <div className="user-info fade-in">
          <h3>Logged in as:</h3>
          <p><strong>User ID:</strong> {userId}</p>
          {userProperties && (
            <div>
              <p><strong>User Properties:</strong></p>
              <div className="custom-props-code">
                {JSON.stringify(parseCustomProperties(userProperties), null, 2)}
              </div>
            </div>
          )}
          
          {groupProperties.trim() && groupValue.trim() ? (
            <div>
              <p><strong>Group Value:</strong> {groupValue}</p>
              <p><strong>Group Properties:</strong></p>
              <div className="custom-props-code">
                {JSON.stringify(parseCustomProperties(groupProperties), null, 2)}
              </div>
            </div>
          ) : (
            <p><strong>Group:</strong> Not identified (no group properties provided)</p>
          )}
          
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      )}

      {/* Main App Content */}
      <div className="main-content">
        <div className="main-button">
          <button 
            onClick={handleButtonClick}
            disabled={!isLoggedIn}
            className={`btn ${isLoggedIn ? 'btn-success' : 'btn-disabled'}`}
          >
            Click Me {!isLoggedIn && '(Login Required)'}
          </button>
        </div>
        
        {isLoggedIn && (
          <div className="image-container fade-in">
            <AdvancedImage 
              cldImg={img} 
              onLoad={handleImageLoad}
              alt="Sample Cloudinary Image"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


